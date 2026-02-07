---
name: openlibrary
description: 'Open Library API integration for fetching book metadata, author information, search functionality, and cover images. Use when implementing features that require book data by ISBN/OLCLC/Open Library ID, author profiles and their works, searching for books and authors, book cover images by ISBN or Open Library ID, or browsing books by subject. This skill provides complete OpenAPI specification and organized reference documentation for all endpoints.'
---

# Open Library API

## Quick Start

Use `https://openlibrary.org` as the base URL. All endpoints return JSON by default.

## API Capabilities

### Books

- **GET /api/books** - Fetch book metadata by bibkeys (ISBN, OCLC, LCCN, etc.)
- **GET /isbn/{isbn}** - Get book by ISBN
- **GET /books/{olid}** - Get book by Open Library ID
- **GET /works/{olid}** - Get work by Open Library ID
- **GET /api/volumes/brief/{key_type}/{value}.json** - Brief volume lookup

### Authors

- **GET /authors/{olid}.json** - Get author profile
- **GET /authors/{olid}/works.json** - Get author's works (with pagination)

### Search

- **GET /search.json** - Search for books, authors, works, etc.
- **GET /search/authors.json** - Search specifically for authors

### Covers

- **GET /covers/{key_type}/{value}-{size}.jpg** - Get book cover image

### Subjects

- **GET /subjects/{subject}.json** - Get books by subject (with details option)

## Common Parameters

### Bibkeys (for /api/books)

- `ISBN:0201558025` - Single ISBN
- `OCLC:263296519` - OCLC identifier
- `LCCN:2001022645` - Library of Congress Control Number
- Multiple keys: `ISBN:9781408113479,OCLC:420517` (comma-separated)

### Query Parameters

- `bibkeys` (required for /api/books) - Comma-separated list of bibliographic keys
- `format` - Response format: `json` (default) or `javascript`
- `jscmd` - Detail level: `viewapi` (default) or `data`
- `q` - Search query
- `page` - Page number for pagination
- `limit` - Result limit (for author works)
- `details` - Include full details for subjects (boolean, default: false)

### Cover Sizes

- S - Small (~100px)
- M - Medium (~400px)
- L - Large (~800px)

## Example Usage

### Get book by ISBN

```
GET https://openlibrary.org/api/books?bibkeys=ISBN:9780547928227&format=json&jscmd=data
```

### Search for books

```
GET https://openlibrary.org/search.json?q=the+great+gatsby&page=1
```

### Get author and their works

```
GET https://openlibrary.org/authors/OL23919A.json
GET https://openlibrary.org/authors/OL23919A/works.json?limit=10
```

### Get book cover

```
GET https://openlibrary.org/covers/isbn/9780547928227-L.jpg
```

### Browse by subject

```
GET https://openlibrary.org/subjects/fiction.json
GET https://openlibrary.org/subjects/fiction.json?details=true
```

## Response Format

### Books API Response

```json
{
    "ISBN:9780547928227": {
        "title": "The Hobbit",
        "authors": [{"name": "J.R.R. Tolkien"}],
        "publishers": ["George Allen & Unwin"],
        "publish_date": "1937"
    }
}
```

### Search Response

```json
{
    "start": 0,
    "numFound": 123,
    "docs": [
        {
            "title": "The Hobbit",
            "author_name": ["J.R.R. Tolkien"],
            "cover_i": 1234567
        }
    ]
}
```

## Rate Limiting and Best Practices

- Do not use APIs for bulk downloads
- Implement client-side caching
- Use appropriate pagination
- Respect rate limits (no explicit limit stated, but be reasonable)
- See [Open Library Dev Center](https://openlibrary.org/developers/api) for full documentation

## Resources

- **[openapi.json](openapi.json)** - Complete OpenAPI 3.0.2 specification with all endpoints, parameters, and schemas
- **[api-reference.md](api-reference.md)** - Organized API documentation grouped by category with detailed endpoint information
- **External Documentation**: [Open Library Developers](https://openlibrary.org/developers/api)
