

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
