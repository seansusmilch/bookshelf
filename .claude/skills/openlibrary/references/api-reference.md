# Open Library API Reference

Complete reference documentation for Open Library API endpoints, organized by category.

## Table of Contents

- [Books](#books)
- [Authors](#authors)
- [Search](#search)
- [Covers](#covers)
- [Subjects](#subjects)
- [Error Responses](#error-responses)

---

## Books

### Get Books by Bibkeys

**Endpoint:** `GET /api/books`

**Description:** Retrieve specific works or editions by bibliographic identifiers (ISBN, OCLC, LCCN, etc.)

**Parameters:**

| Parameter | Type   | Required | Description                                                                            | Default   |
| --------- | ------ | -------- | -------------------------------------------------------------------------------------- | --------- |
| bibkeys   | string | Yes      | Comma-separated list of bibliographic keys (e.g., `ISBN:0201558025`, `OCLC:263296519`) | -         |
| format    | string | No       | Response format: `json` or `javascript`                                                | `json`    |
| jscmd     | string | No       | Information level: `viewapi` or `data`                                                 | `viewapi` |
| callback  | string | No       | JavaScript callback function name (only when format=javascript)                        | -         |

**Examples:**

```http
# Single ISBN
GET /api/books?bibkeys=ISBN:0201558025&format=json&jscmd=data

# Multiple identifiers
GET /api/books?bibkeys=ISBN:9781408113479,OCLC:420517

# With callback (JSONP)
GET /api/books?bibkeys=ISBN:0547928227&format=javascript&callback=handleResponse
```

**Response:** JSON object with bibkeys as keys

### Get Book by ISBN

**Endpoint:** `GET /isbn/{isbn}`

**Description:** Get book information by ISBN

**Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| isbn      | string | Yes      | International Standard Book Number |

**Example:**

```http
GET /isbn/9780547928227
```

**Response:** Book metadata JSON

### Get Book by Open Library ID

**Endpoint:** `GET /books/{olid}`

**Description:** Get book/edition by Open Library ID (OLxx... format)

**Parameters:**

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| olid      | string | Yes      | Open Library identifier (e.g., `OL53924W`) |

**Example:**

```http
GET /books/OL53924W
```

**Response:** Full book/edition metadata

### Get Work by Open Library ID

**Endpoint:** `GET /works/{olid}`

**Description:** Get work by Open Library ID (works contain multiple editions)

**Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| olid      | string | Yes      | Open Library work identifier |

**Example:**

```http
GET /works/OL12926233W
```

**Response:** Work metadata with edition list

### Get Brief Volume Info

**Endpoint:** `GET /api/volumes/brief/{key_type}/{value}.json`

**Description:** Get brief volume information by identifier type

**Parameters:**

| Parameter | Type   | Required | Description                                    |
| --------- | ------ | -------- | ---------------------------------------------- |
| key_type  | string | Yes      | Identifier type (e.g., `isbn`, `oclc`, `olid`) |
| value     | string | Yes      | Identifier value                               |
| callback  | string | No       | JSONP callback function                        |

**Example:**

```http
GET /api/volumes/brief/isbn/9780547928227.json
```

**Response:** Brief volume metadata

---

## Authors

### Get Author Profile

**Endpoint:** `GET /authors/{olid}.json`

**Description:** Retrieve author profile and metadata

**Parameters:**

| Parameter | Type   | Required | Description                               |
| --------- | ------ | -------- | ----------------------------------------- |
| olid      | string | Yes      | Open Library author ID (e.g., `OL23919A`) |

**Example:**

```http
GET /authors/OL23919A.json
```

**Response:**

```json
{
    "name": "J.R.R. Tolkien",
    "birth_date": "1892-01-03",
    "death_date": "1973-09-02",
    "bio": "British writer...",
    "key": "/authors/OL23919A"
}
```

### Get Author's Works

**Endpoint:** `GET /authors/{olid}/works.json`

**Description:** Retrieve list of works by author with pagination

**Parameters:**

| Parameter | Type    | Required | Description               |
| --------- | ------- | -------- | ------------------------- |
| olid      | string  | Yes      | Open Library author ID    |
| limit     | integer | No       | Number of works to return |

**Example:**

```http
GET /authors/OL23919A/works.json?limit=20
```

**Response:**

```json
{
    "entries": [
        {
            "title": "The Hobbit",
            "key": "/works/OL12926233W"
        }
    ]
}
```

---

## Search

### Search Books and Works

**Endpoint:** `GET /search.json`

**Description:** Full-text search across books, works, authors, and more

**Parameters:**

| Parameter | Type    | Required | Description                          |
| --------- | ------- | -------- | ------------------------------------ |
| q         | string  | Yes      | Search query string                  |
| page      | integer | No       | Page number for pagination (1-based) |

**Example:**

```http
GET /search.json?q=the+great+gatsby&page=1
```

**Response:**

```json
{
    "start": 0,
    "numFound": 123,
    "docs": [
        {
            "title": "The Great Gatsby",
            "author_name": ["F. Scott Fitzgerald"],
            "cover_i": 1234567,
            "first_publish_year": 1925
        }
    ]
}
```

**Search Tips:**

- Use `+` for spaces in URLs
- Search by title, author, subject, or keywords
- Results can be filtered using Solr syntax in query

### Search Authors

**Endpoint:** `GET /search/authors.json`

**Description:** Search specifically for authors

**Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| q         | string | Yes      | Search query for author name |

**Example:**

```http
GET /search/authors.json?q=Tolkien
```

**Response:**

```json
{
    "start": 0,
    "numFound": 45,
    "docs": [
        {
            "name": "J.R.R. Tolkien",
            "key": "/authors/OL23919A",
            "birth_date": "1892",
            "top_work": "The Hobbit"
        }
    ]
}
```

---

## Covers

### Get Book Cover

**Endpoint:** `GET /covers/{key_type}/{value}-{size}.jpg`

**Description:** Fetch book cover image by identifier

**Parameters:**

| Parameter | Type   | Required | Description                                                                |
| --------- | ------ | -------- | -------------------------------------------------------------------------- |
| key_type  | string | Yes      | Identifier type: `isbn`, `olid`, `oclc`, `lccn`, `id`                      |
| value     | string | Yes      | Identifier value                                                           |
| size      | string | Yes      | Image size: `S` (small, ~100px), `M` (medium, ~400px), `L` (large, ~800px) |

**Examples:**

```http
# By ISBN - Large
GET /covers/isbn/9780547928227-L.jpg

# By Open Library ID - Medium
GET /covers/olid/OL53924W-M.jpg

# By ID - Small
GET /covers/id/1234567-S.jpg
```

**Response:** JPEG image binary

**Notes:**

- Returns 404 if no cover exists
- Open Library has millions of covers but not all books have one
- Consider using placeholder when cover not found

---

## Subjects

### Get Books by Subject

**Endpoint:** `GET /subjects/{subject}.json`

**Description:** Retrieve books categorized by subject

**Parameters:**

| Parameter | Type    | Required | Description                |
| --------- | ------- | -------- | -------------------------- | ------- |
| subject   | string  | Yes      | Subject name (URL-encoded) |
| details   | boolean | No       | Include full book details  | `false` |

**Examples:**

```http
# Simple list
GET /subjects/fiction.json

# With full details
GET /subjects/science.json?details=true

# Multi-word subject
GET /subjects/science%20fiction.json
```

**Response (without details):**

```json
{
    "name": "Fiction",
    "work_count": 1234567,
    "works": [
        {
            "title": "The Hobbit",
            "key": "/works/OL12926233W"
        }
    ]
}
```

**Response (with details):**

```json
{
    "name": "Fiction",
    "work_count": 1234567,
    "works": [
        {
            "title": "The Hobbit",
            "key": "/works/OL12926233W",
            "authors": [{"name": "J.R.R. Tolkien"}],
            "first_publish_year": 1937
        }
    ]
}
```

---

## Error Responses

### Validation Error (422)

When request parameters are invalid or missing.

**Response:**

```json
{
    "detail": [
        {
            "loc": ["query", "bibkeys"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

**Properties:**

- `detail` - Array of validation errors
    - `loc` - Location of error (parameter path)
    - `msg` - Error message
    - `type` - Error type

---

## Complete OpenAPI Specification

For the full OpenAPI 3.0.2 specification including all schemas and complete endpoint definitions, see [openapi.json](openapi.json).

---

## External Resources

- [Open Library Developer Documentation](https://openlibrary.org/developers/api)
- [API Books Documentation](https://openlibrary.org/dev/docs/api/books)
- [API Authors Documentation](https://openlibrary.org/dev/docs/api/authors)
- [API Search Documentation](https://openlibrary.org/dev/docs/api/search)
- [API Covers Documentation](https://openlibrary.org/dev/docs/api/covers)
- [API Subjects Documentation](https://openlibrary.org/dev/docs/api/subjects)

---

## Notes

- This OpenAPI spec is a subset of the complete Open Library API
- For full API capabilities, see the developer documentation
- Do not use APIs for bulk downloads
- Contribute to the OpenAPI spec at: https://github.com/internetarchive/openlibrary/blob/master/static/openapi.json
