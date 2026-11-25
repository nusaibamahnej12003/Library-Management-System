const request = require("supertest");
const { app } = require("../../src/app");

async function createBook(overrides = {}) {
  const response = await request(app).post("/api/books").send({
    title: "A Wizard of Earthsea",
    author: "Ursula K. Le Guin",
    isbn: "9780547773742",
    totalCopies: 1,
    ...overrides
  });
  return response.body;
}

describe("Borrowing API", () => {
  test("borrows a copy, records the borrowing, and decrements availability", async () => {
    const book = await createBook();
    const response = await request(app)
      .post(`/api/books/${book.id}/borrow`)
      .send({ borrowerName: "Octavia Butler" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      bookId: book.id,
      bookTitle: book.title,
      borrowerName: "Octavia Butler",
      status: "BORROWED"
    });
    expect((await request(app).get(`/api/books/${book.id}`)).body.availableCopies).toBe(0);
  });

  test("rejects borrowing a nonexistent book", async () => {
    const response = await request(app)
      .post("/api/books/987654/borrow")
      .send({ borrowerName: "Octavia Butler" });
    expect(response.status).toBe(404);
  });

  test("rejects borrowing when no copies are available", async () => {
    const book = await createBook({ availableCopies: 0 });
    const response = await request(app)
      .post(`/api/books/${book.id}/borrow`)
      .send({ borrowerName: "Octavia Butler" });
    expect(response.status).toBe(409);
    expect((await request(app).get(`/api/books/${book.id}`)).body.availableCopies).toBe(0);
  });

  test("does not lend the final copy more than once under concurrent requests", async () => {
    const book = await createBook();
    const responses = await Promise.all([
      request(app).post(`/api/books/${book.id}/borrow`).send({ borrowerName: "Ada Lovelace" }),
      request(app).post(`/api/books/${book.id}/borrow`).send({ borrowerName: "Grace Hopper" })
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect((await request(app).get(`/api/books/${book.id}`)).body.availableCopies).toBe(0);
    expect((await request(app).get("/api/borrowings")).body).toHaveLength(1);
  });

  test("returns a borrowed copy and makes the transition exactly once", async () => {
    const book = await createBook();
    const borrowed = await request(app)
      .post(`/api/books/${book.id}/borrow`)
      .send({ borrowerName: "Octavia Butler" });
    const returned = await request(app).post(`/api/books/${book.id}/return`).send({ borrowingId: borrowed.body.id });

    expect(returned.status).toBe(200);
    expect(returned.body.status).toBe("RETURNED");
    expect(returned.body.returnedAt).toBeTruthy();
    expect((await request(app).get(`/api/books/${book.id}`)).body.availableCopies).toBe(1);

    const duplicate = await request(app).post(`/api/books/${book.id}/return`).send({ borrowingId: borrowed.body.id });
    expect(duplicate.status).toBe(409);
    expect((await request(app).get(`/api/books/${book.id}`)).body.availableCopies).toBe(1);
  });

  test("lists and retrieves borrowing records", async () => {
    const book = await createBook();
    const borrowing = await request(app)
      .post(`/api/books/${book.id}/borrow`)
      .send({ borrowerName: "Octavia Butler" });
    const list = await request(app).get("/api/borrowings");
    const found = await request(app).get(`/api/borrowings/${borrowing.body.id}`);

    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(found.status).toBe(200);
    expect(found.body.book.id).toBe(book.id);
  });

  test("returns 404 for an unknown borrowing", async () => {
    const response = await request(app).get("/api/borrowings/987654");
    expect(response.status).toBe(404);
  });
});
