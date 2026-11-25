const request = require("supertest");
const { app, bookService } = require("../../src/app");

describe("Request IDs and error handling", () => {
  test("assigns a distinct request ID and returns it in the response header", async () => {
    const first = await request(app).get("/api/books");
    const second = await request(app).get("/api/books");

    expect(first.headers["x-request-id"]).toEqual(expect.any(String));
    expect(second.headers["x-request-id"]).toEqual(expect.any(String));
    expect(first.headers["x-request-id"]).not.toBe(second.headers["x-request-id"]);
  });

  test("returns standardized problem details for errors", async () => {
    const response = await request(app).get("/api/books/987654");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toMatch(/^application\/problem\+json/);
    expect(response.body).toMatchObject({
      type: expect.any(String),
      title: "Not Found",
      status: 404,
      detail: expect.any(String),
      instance: "/api/books/987654",
      requestId: response.headers["x-request-id"]
    });
  });

  test("does not expose unexpected internal error details", async () => {
    const originalConsoleError = console.error;
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(bookService, "getAll").mockRejectedValue(new Error("private database connection string"));

    try {
      const response = await request(app).get("/api/books");
      expect(response.status).toBe(500);
      expect(response.headers["content-type"]).toMatch(/^application\/problem\+json/);
      expect(response.body.detail).not.toContain("private database connection string");
      expect(response.body.requestId).toBe(response.headers["x-request-id"]);
    } finally {
      spy.mockRestore();
      console.error = originalConsoleError;
    }
  });
});
