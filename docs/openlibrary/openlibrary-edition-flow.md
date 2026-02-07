# Open Library Cover and Edition Selection Analysis

## Current Issue

When searching for books (e.g., "The Prince" by Machiavelli), our app shows different covers and editions than the Open Library website.

### Example: "The Prince"

**What Open Library shows:**

- URL: `https://openlibrary.org/works/OL1089297W/The_Prince?edition=key:/books/OL52260427M`
- Cover: `https://covers.openlibrary.org/b/id/15103494-L.jpg`
- Edition: OL52260427M (Standard Ebooks, 2014, English)

**What our app shows:**

- Search results: cover_i=12726168 (work-level cover)
- Add book page: First edition from editions API (OL26385143M)
- Cover from different edition

## API Flow

### 1. Search API

```
GET /search.json?q=The+Prince+Machiavelli&limit=1
```

Returns:

- `key`: "/works/OL1089297W" (work ID)
- `cover_i`: 12726168 (work-level cover ID)
- `cover_edition_key`: "OL37826838M" (specific edition for cover)
- `title`, `author_name`, etc.

### 2. Work API

```
GET /works/OL1089297W.json
```

Returns:

- `covers`: [12726168, 8348921, ...] (array of all cover IDs for work)
- `description`, `subjects`, etc.

### 3. Editions API

```
GET /works/OL1089297W/editions.json?limit=50
```

Returns:

- `entries`: Array of editions
- Each edition has: `key`, `title`, `covers`, `publish_date`, `languages`, etc.

### 4. Book/Edition API

```
GET /books/OL52260427M.json
```

Returns:

- Full edition details including `covers`, `publish_date`, `languages`, etc.

## The Problem

### Issue 1: Search Results Use Work-Level Cover

Our app uses `cover_i` from search results, which is a work-level cover that might not match the best edition.

**Open Library website**: Also uses `cover_i` initially, but may apply additional logic.

### Issue 2: Edition Selection is Arbitrary

Our `getBestEditionForWork` just returns `entries[0]` from editions API, which has no clear sorting logic.

**Open Library website**: Has internal logic to select a "default" edition based on:

- Language preference (likely English)
- Recency
- Metadata completeness
- Publisher reputation
- User history (cookies)

### Issue 3: Inconsistency in Editions API

Edition OL52260427M exists and is valid:

- Has cover 15103494
- Links to work OL1089297W
- Published in 2014 (Standard Ebooks, English)
- Canonical URL exists

But it's NOT in:

- Work's `covers` array
- First 50 editions from editions API

This suggests OL52260427M might be:

- An older/duplicate record
- Part of a work that was merged
- Or the editions API has some filtering

## Recommended Solution

### For Search Results

**Option 1**: Use `cover_edition_key` instead of `cover_i`

Instead of:

```typescript
const coverUrl = getBookCoverURL(book.cover_i, workOlid, book.isbn)
```

Use:

```typescript
const editionOlid = extractOLID(book.cover_edition_key)
const coverUrl = getBookCoverURL(undefined, editionOlid)
```

**Option 2**: Fetch edition details to get exact cover

```typescript
const edition = await fetchOpenLibrary(`/books/${book.cover_edition_key}.json`)
const coverUrl = edition.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`
    : getBookCoverURL(book.cover_i, workOlid, book.isbn)
```

### For Add Book Page

Implement a better edition selection algorithm:

```typescript
function scoreEdition(edition: Edition): number {
    let score = 0

    // Prefer editions with covers
    if (edition.covers?.length > 0) {
        score += 100
    }

    // Prefer English language
    if (edition.languages?.some((l) => l.key === '/languages/eng')) {
        score += 50
    }

    // Prefer more recent editions (within last 20 years)
    const year = parsePublishYear(edition.publish_date)
    if (year && year >= 2004) {
        score += 30
    } else if (year && year >= 1990) {
        score += 20
    }

    // Prefer physical books over ebooks
    if (edition.physical_format !== 'ebook') {
        score += 10
    }

    // Prefer editions with ISBN
    if (edition.isbn_13?.length > 0 || edition.isbn_10?.length > 0) {
        score += 15
    }

    // Prefer editions with page count
    if (edition.number_of_pages) {
        score += 5
    }

    return score
}

// Select best edition
const bestEdition = allEditions
    .map((e) => ({edition, score: scoreEdition(e)}))
    .sort((a, b) => b.score - a.score)[0]?.edition
```

### Hybrid Approach

For both search and add book:

1. **In search results**: Use `cover_edition_key` from search API
2. **In add book page**:
    - First check if `cover_edition_key` edition is in editions list
    - If yes, use that as default
    - If no, use scoring algorithm to select best edition
    - Allow user to override with EditionSelector

## Implementation Priority

1. **Quick fix**: Use `cover_edition_key` for search results
2. **Better fix**: Implement edition scoring algorithm
3. **Long term**: Consider caching edition preferences per user/work

## Notes

- The Open Library website may show different covers based on user history/cookies
- There's no public API for "default edition" selection
- The editions API doesn't have documented sort parameters for "quality" or "relevance"
- Some editions exist as standalone records but aren't in work's edition list (data inconsistency)
