# Bookshelf App Feature Design

Date: 2025-01-31

## Overview

A personal reading tracker mobile app built with Expo, Convex, and Clerk that allows users to track, rate, and manage their book reading progress with manual page entry.

## Section 1: Data Model & Architecture

### Convex Schema Structure

The app uses a relational-style data model in Convex. Books have a many-to-many relationship with lists (so a book can be in multiple lists). Reading sessions store individual page updates for progress tracking.

**Key Collections:**

- `books` - Book metadata (title, author, cover, total pages, ISBN, API source)
- `readingStatus` - "want to read", "reading", "completed" per book per user
- `lists` - Custom list definitions (name, description)
- `bookListMembership` - Join table linking books to lists
- `readingSessions` - Individual page updates (current page, date)
- `ratings` - 1-10 scale ratings per book per user
- `yearlyGoals` - Yearly reading goal (books count, pages count)

**Data Flow:**
Books are added via API search → stored in `books` → user can assign status → create custom lists → add books to lists → update page progress via manual entry → track completion against yearly goals.

## Section 2: User Interface & Navigation

### Tab Layout Structure

The app uses a 3-tab layout:

1. **My Books** - Main tab showing all books with reading status filter tabs at top
2. **Search** - API book search interface with "Add to My Books" action
3. **Stats** - Yearly goal progress and simple totals

### My Books Screen

- Filter tabs: "All", "Reading", "Want to Read", "Completed"
- Each book card shows: cover image, title, author, progress bar (if reading), rating badge
- Three-dot menu on each card for actions: "Rate", "Update Progress", "Manage Lists"

### Book Detail Modal

- Shows full book metadata, cover, current page/total pages
- Progress slider for manual page entry
- Star rating picker (1-10)
- Lists management (add/remove from custom lists)
- Mark as complete button

### Search Screen

- Search bar for Google Books/Open Library API
- Results list with thumbnail, title, author
- Tap to view details and "Add" button
- On add: prompt to set initial status and optionally add to a list

### Stats Screen

- Big number card: Books read this year / Yearly goal
- Secondary card: Pages read this year
- Simple progress bar for goal completion
- "Set Goal" button to update yearly target

## Section 3: Component Structure & Implementation

### Component Hierarchy

```
components/
├── ui/
│   ├── BookCard.tsx          - Book item in list
│   ├── ProgressSlider.tsx    - Manual page entry slider
│   ├── RatingPicker.tsx      - 1-10 star rating selector
│   ├── ListSelector.tsx      - Multi-select for custom lists
│   ├── FilterTabs.tsx         - Reading status tabs
│   └── StatsCard.tsx         - Goal progress display
├── book/
│   ├── BookDetailModal.tsx   - Full book detail view
│   ├── BookActionsMenu.tsx   - Three-dot menu options
│   └── AddBookSheet.tsx      - Add book status prompt
└── list/
    ├── ListManager.tsx       - Create/edit custom lists
    └── ListBadge.tsx         - Show lists on book card
```

### Key Components

**BookCard** - Displays book with cover, title, author, progress bar, rating badge. Tap opens detail modal, three-dot icon opens action menu.

**ProgressSlider** - Range slider for page entry with current/total pages display, validates can't exceed total pages.

**RatingPicker** - Horizontal scrollable row of 10 numbered stars, tap to select rating with visual feedback.

**ListSelector** - Checkbox list of existing lists with "Create New List" button, multi-select supported.

**FilterTabs** - Segmented control for status filtering, persists selection across sessions.

## Section 4: API Integration & Data Fetching

### Google Books API Integration

The app uses Google Books API v1 for book search and metadata.

**Endpoints:**
- Search: `GET https://www.googleapis.com/books/v1/volumes?q={query}`
- Volume details: `GET https://www.googleapis.com/books/v1/volumes/{volumeId}`

**API Data Mapping:**
- title → book title
- authors → author array
- imageLinks.thumbnail → cover URL
- pageCount → total pages
- description → book description
- industryIdentifiers → ISBN/other identifiers
- publishedDate → publication year

### React Query Hooks Structure

```
hooks/
├── useBooks.ts              - Query: user's books with status filter
├── useSearchBooks.ts        - Query: search Google Books API
├── useBookDetail.ts         - Query: single book details
├── useLists.ts              - Query: custom lists
├── useProgressUpdate.ts     - Mutation: update reading progress
├── useRateBook.ts           - Mutation: rate a book
├── useAddBook.ts            - Mutation: add book to library
└── useUpdateGoal.ts         - Mutation: set yearly goal
```

Each query includes staleTime (5-10 minutes) for caching. Mutations invalidate relevant queries on success.

### Convex Functions

**Query Functions:**
- `getUserBooks` - Get user's books with optional status filter
- `getBookById` - Get single book with reading status and rating
- `getUserLists` - Get user's custom lists
- `getReadingStats` - Get yearly stats and goal progress

**Mutation Functions:**
- `addBook` - Add book to library with initial status
- `updateProgress` - Update current page for a book
- `rateBook` - Set or update rating (1-10)
- `addToList` - Add/remove book from custom lists
- `setYearlyGoal` - Update yearly reading goal

Functions use Clerk authentication context to ensure users only access their own data.

## Section 5: Error Handling & Validation

### Validation Rules

- **Book pages:** Must be positive integer, progress can't exceed total pages
- **Rating:** Must be integer 1-10
- **List names:** Required, max 50 characters, unique per user
- **Yearly goal:** Must be positive integer, minimum 1 book/year
- **ISBN:** Validate format before storing

### Error Handling Strategy

**API Errors:**
- Network failures: Show toast with retry option
- Rate limiting: Display message, suggest waiting before retry
- Book not found: Allow manual entry fallback
- Invalid ISBN: Clear field and show validation message

**Convex Errors:**
- Auth failures: Redirect to sign-in, clear local data
- Duplicate books: Show "Already in your library" message
- Validation failures: Display inline error with clear guidance

**UI Error States:**
- Empty states: "No books yet - search for your first book!"
- Loading states: Skeleton loaders for book cards, spinners for modals
- Offline mode: Cache book data locally with SQLite, sync when online

### Data Integrity

- Use Convex transactions for related mutations (e.g., add book + assign status)
- Validate book exists before allowing progress updates
- Prevent deleting lists with books (require removing books first)
