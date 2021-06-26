## API Reference

### Genres

|HTTP Method| API URL | What it does | Sample Request Body |
|:---------:|:-------:|:------------:|:-----------:|
|GET   |  /api/v1/genres     | get all genres | - |
|GET   |  /api/v1/genres/:id | get a genre with a specific id | - |
|POST  |  /api/v1/genres     | create a new genre | { "name": "Textbooks" } |
|POST  |  /api/v1/genres/:parentId     | add a subgenre to parent genre | { "name": "Computer Science" } |
|PUT   |  /api/v1/genres/:id | update an existing genre | { "name": "Educational" } |
|DELETE|  /api/v1/genres/:id | update an existing genre | - |

### Authors

|HTTP Method| API URL | What it does | Sample Request Body |
|:---------:|:-------:|:------------:|:-----------:|
|GET   |  /api/v1/authors     | get all authors | - |
|GET   |  /api/v1/authors/:id | get an author with a specific id | - |
|POST  |  /api/v1/authors     | create a new author | { "name": "Mosh Hamedani" } |
|PUT   |  /api/v1/authors/:id | update an existing author | { "name": "Moshfegh Hamedani" } |
|DELETE|  /api/v1/authors/:id | update an existing author | - |

### Books

|HTTP Method| API URL | What it does | Sample Request Body |
|:---------:|:-------:|:------------:|:-----------:|
|GET   |  /api/v1/books     | get all books | - |
|GET   |  /api/v1/books/:id | get a book with a specific id | - |
|POST  |  /api/v1/books     | create a new book | { "name": "Cracking the PM Interview","genreId": "60a795c2a3da7e7451e6fb5a", "quantity": 3, "unitPrice": 200, "authorName": Gayle L Mcdowell" } |
|PUT   |  /api/v1/books/:id | update an existing book | { "quantity": 100, "unitPrice": 100 } |
|DELETE|  /api/v1/books/:id | update an existing book | - |

### Search

|HTTP Method| API URL | What it does | Sample Request Body |
|:---------:|:-------:|:------------:|:-----------:|
|GET   |  /api/v1/search/byName/:bookName     | get all books by bookName | - |
|GET   |  /api/v1/search/byGenre/:genreId | get all books with a specific genreId | - |
|GET   |  /api/v1/search/byAuthor/:authorName | get all the books by authorName | - |

### Buy

|HTTP Method| API URL | What it does | Sample Request Body |
|:---------:|:-------:|:------------:|:-----------:|
|POST  |  /api/v1/buy     | create a new transaction | { "bookId": "60a7f22079308bcfd3d9bc12","quantity": 1, "unitPrice": 100 } |
|PUT   |  /api/v1/buy/rate/:transactionId | rate a transaction | { "transactionRating": 2 } |