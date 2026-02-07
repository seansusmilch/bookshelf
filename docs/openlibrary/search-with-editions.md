Request
```bash
curl "https://openlibrary.org/search.json?q=the+martian&fields=key,title,author_name,editions,editions.key"
```
Response
```json
{
    "author_name": [
        "Andy Weir"
    ],
    "key": "/works/OL17091839W",
    "title": "The Martian",
    "editions": {
        "numFound": 44,
        "start": 0,
        "numFoundExact": true,
        "docs": [
            {
                "key": "/books/OL32815550M"
            }
        ]
    }
},
```