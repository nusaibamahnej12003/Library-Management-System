const request = require("supertest");
const { app } = require("../../src/app");

const makeBook = (overrides = {}) => ({
  title: "The Left Hand of Darkness",
  author: "Ursula K. Le Guin",
  isbn: "9780441478125",
  description: "A science fiction novel.",
  totalCopies: 3,
  ...overrides
});

describe("Book management API", () => {
  test("creates a valid book and initializes available copies", async () => {
    const response = await request(app).post("/api/books").send(makeBook());

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "The Left Hand of Darkness",
      totalCopies: 3,
      availableCopies: 3
    });
    expect(response.body.id).toEqual(expect.any(Number));
  });

  test("rejects a book with a missing title using a problem response", async () => {
    const invalidBook = makeBook();
    delete invalidBook.title;
    const response = await request(app).post("/api/books").send(invalidBook);

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/^application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 400, title: "Bad Request" });
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
  });

  test("rejects a duplicate ISBN", async () => {
    await request(app).post("/api/books").send(makeBook());
    const response = await request(app).post("/api/books").send(makeBook({ title: "Duplicate" }));

    expect(response.status).toBe(409);
  });

  test("lists books and retrieves a book by ID", async () => {
    const created = await request(app).post("/api/books").send(makeBook());
    const list = await request(app).get("/api/books");
    const found = await request(app).get(`/api/books/${created.body.id}`);

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(found.status).toBe(200);
    expect(found.body.id).toBe(created.body.id);
  });

  test("returns 404 for a nonexistent book", async () => {
    const response = await request(app).get("/api/books/987654");
    expect(response.status).toBe(404);
  });

  test("updates an existing book and preserves borrowed-copy counts", async () => {
    const created = await request(app).post("/api/books").send(makeBook());
    const borrowed = await request(app)
      .post(`/api/books/${created.body.id}/borrow`)
      .send({ borrowerName: "Ada Lovelace" });

    const response = await request(app)
      .put(`/api/books/${created.body.id}`)
      .send({ title: "Updated title", totalCopies: 4 });

    expect(borrowed.status).toBe(201);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ title: "Updated title", totalCopies: 4, availableCopies: 3 });
  });

  test("rejects invalid updates and prevents total copies falling below active loans", async () => {
    const created = await request(app).post("/api/books").send(makeBook());
    const invalid = await request(app)
      .put(`/api/books/${created.body.id}`)
      .send({ totalCopies: -1 });
    await request(app).post(`/api/books/${created.body.id}/borrow`).send({ borrowerName: "Grace Hopper" });
    const belowBorrowed = await request(app)
      .put(`/api/books/${created.body.id}`)
      .send({ totalCopies: 0 });

    expect(invalid.status).toBe(400);
    expect(belowBorrowed.status).toBe(409);
  });

  test("deletes an existing book", async () => {
    const created = await request(app).post("/api/books").send(makeBook());
    const removed = await request(app).delete(`/api/books/${created.body.id}`);
    const fetched = await request(app).get(`/api/books/${created.body.id}`);

    expect(removed.status).toBe(204);
    expect(fetched.status).toBe(404);
  });

  test("prevents deleting a book with an active borrowing", async () => {
    const created = await request(app).post("/api/books").send(makeBook());
    await request(app).post(`/api/books/${created.body.id}/borrow`).send({ borrowerName: "Katherine Johnson" });
    const response = await request(app).delete(`/api/books/${created.body.id}`);

    expect(response.status).toBe(409);
    expect((await request(app).get(`/api/books/${created.body.id}`)).status).toBe(200);
  });
});
