# Library Management System API

A standalone REST API built with Node.js, Express, PostgreSQL, Prisma, Jest, and Supertest. The implementation separates middleware, controllers, services, domain rules, and persistence repositories.

## Requirements

- Node.js 20+
- PostgreSQL

## Setup

1. Create two PostgreSQL databases: one for the API and a separate, disposable database for integration tests.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to the development database.
3. Create `.env.test` with a `TEST_DATABASE_URL` pointing only to the dedicated test database:

   ```dotenv
   TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/library_management_test?schema=public"
   ```

4. Install dependencies, generate Prisma Client, and create the development schema:

   ```sh
   npm install
   npx prisma generate
   npx prisma db push
   ```

5. Start the API:

   ```sh
   npm start
   ```

The API listens on port `3000` by default; set `PORT` to change it.

## Integration tests

Set up the dedicated test database and `.env.test` before running:

```sh
npm test
```

`npm test` pushes the Prisma schema to the test database and then runs Jest. It fails early if `TEST_DATABASE_URL` is missing or identifies the same database as `DATABASE_URL`. The Jest setup points Prisma at the test URL before importing the application, clears only the test database's `Borrowing` and `Book` tables between tests, and disconnects Prisma after the suite.

## API

All errors use RFC 9457-style `application/problem+json` responses and include the request ID. Each request also receives an `X-Request-Id` response header.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/books` | Create a book |
| `GET` | `/api/books` | List books |
| `GET` | `/api/books/:id` | Get a book |
| `PUT` | `/api/books/:id` | Update a book |
| `DELETE` | `/api/books/:id` | Delete a book with no active borrowings |
| `POST` | `/api/books/:id/borrow` | Borrow a copy (`{"borrowerName":"..."}`) |
| `POST` | `/api/books/:id/return` | Return a copy (`{"borrowingId":1}`) |
| `GET` | `/api/borrowings` | List borrowing records |
| `GET` | `/api/borrowings/:id` | Get a borrowing record |

`totalCopies` defaults to `1`; `availableCopies` defaults to `totalCopies` on creation. Availability is controlled by borrow/return operations and cannot be set in book updates. Reducing total copies below the number currently borrowed returns `409 Conflict`. Returned borrowing history is retained if its book is deleted.
