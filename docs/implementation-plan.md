# Bookshelf App Implementation Plan

Date: 2025-01-31

## Overview

This plan breaks down the implementation of the bookshelf reading tracker into phases. Each phase can be implemented and tested independently.

## Phase 1: Convex Backend Setup

### 1.1 Define Convex Schema

- [x] Create `convex/schema.ts` with all collections
- [x] Define book, readingStatus, lists, bookListMembership, readingSessions, ratings, yearlyGoals
- [x] Add indexes for efficient queries (user_id, reading_status, etc.)
- [x] Run `npx convex dev` to deploy schema

### 1.2 Implement Convex Queries

- [x] `convex/books.ts`
  - [x] `getUserBooks`: Get user's books with optional status filter
  - [x] `getBookById`: Get single book with reading status and rating
- [x] `convex/lists.ts`
  - [x] `getUserLists`: Get user's custom lists
  - [x] `getBooksInList`: Get all books in a specific list
- [x] `convex/stats.ts`
  - [x] `getReadingStats`: Get yearly stats and goal progress

### 1.3 Implement Convex Mutations

- [x] `convex/books.ts`
  - [x] `addBook`: Add book to library with initial status
  - [x] `updateProgress`: Update current page for a book
  - [x] `completeBook`: Mark book as completed
- [x] `convex/ratings.ts`
  - [x] `rateBook`: Set or update rating (1-10)
- [x] `convex/lists.ts`
  - [x] `createList`: Create custom list
  - [x] `addBookToList`: Add book to list
  - [x] `removeBookFromList`: Remove book from list
  - [x] `deleteList`: Delete list (if empty)
- [x] `convex/stats.ts`
  - [x] `setYearlyGoal`: Update yearly reading goal

## Phase 2: React Query Hooks

### 2.1 Query Hooks

- [x] `hooks/useBooks.ts` - `useBooks(statusFilter)`
- [x] `hooks/useBookDetail.ts` - `useBookDetail(bookId)`
- [x] `hooks/useLists.ts` - `useLists()`
- [x] `hooks/useStats.ts` - `useStats()`

### 2.2 Mutation Hooks

- [x] `hooks/useAddBook.ts` - `useAddBook()`
- [x] `hooks/useUpdateProgress.ts` - `useUpdateProgress()`
- [x] `hooks/useRateBook.ts` - `useRateBook()`
- [x] `hooks/useCreateList.ts` - `useCreateList()`
- [x] `hooks/useUpdateGoal.ts` - `useUpdateGoal()`

### 2.3 API Search Hook

- [x] `hooks/useSearchBooks.ts` - `useSearchBooks(query)`
  - [x] Call Google Books API
  - [x] Cache results with 10min staleTime

## Phase 3: UI Components

### 3.1 Book Components

- [x] `components/ui/BookCard.tsx`
  - [x] Display cover, title, author, progress bar, rating badge
  - [x] Tap handler for detail modal
  - [x] Three-dot menu button

- [x] `components/ui/ProgressSlider.tsx`
  - [x] Range slider for page entry
  - [x] Display current/total pages
  - [x] Validation: can't exceed total pages

- [x] `components/ui/RatingPicker.tsx`
  - [x] Horizontal scrollable row of 10 numbered stars
  - [x] Tap to select with visual feedback
  - [x] 1-10 scale

### 3.2 List Components

- [x] `components/ui/ListSelector.tsx`
  - [x] Checkbox list of existing lists
  - [x] "Create New List" button
  - [x] Multi-select support

- [x] `components/ui/FilterTabs.tsx`
  - [x] Segmented control for status filtering
  - [x] Persist selection across sessions

### 3.3 Stats Components

- [x] `components/ui/StatsCard.tsx`
  - [x] Display goal progress
  - [x] Books read / yearly goal
  - [x] Pages read total

### 3.4 Layout Components

- [x] `components/book/BookDetailModal.tsx`
  - [x] Full book details view
  - [x] Progress slider integration
  - [x] Rating picker integration
  - [x] List selector integration
  - [x] Mark complete button

- [x] `components/book/BookActionsMenu.tsx`
  - [x] Three-dot menu options
  - [x] "Rate" action
  - [x] "Update Progress" action
  - [x] "Manage Lists" action

- [x] `components/book/AddBookSheet.tsx`
  - [x] Status selection prompt
  - [x] Optional list selection
  - [x] Confirm button

## Phase 4: Screen Implementation

### 4.1 My Books Screen

- [x] `app/(tabs)/my-books.tsx`
  - [x] Filter tabs at top
  - [x] BookCard list
  - [x] Empty state
  - [x] Loading state (skeleton)
  - [x] Pull-to-refresh

### 4.2 Search Screen

- [x] `app/(tabs)/search.tsx`
  - [x] Search bar
  - [x] API results list
  - [x] Result card with thumbnail, title, author
  - [x] Tap to view details
  - [x] Add button opens AddBookSheet

### 4.3 Stats Screen

- [x] `app/(tabs)/stats.tsx`
  - [x] StatsCard with goal progress
  - [x] "Set Goal" button
  - [x] Pages read display
  - [ ] Simple charts (optional)

## Phase 5: Navigation & Routing

### 5.1 Update Tab Layout

- [x] Update `app/(tabs)/_layout.tsx`
  - [x] Add "My Books", "Search", "Stats" tabs
  - [x] Configure tab icons

### 5.2 Modal Routes

- [x] Create modal routes for:
  - [x] Book detail view
  - [x] Goal settings

## Phase 6: Error Handling & Validation

### 6.1 Validation

- [x] Add Zod schemas for:
  - [x] Book data
  - [x] Progress updates
  - [x] Ratings
  - [x] List names
  - [x] Yearly goals

### 6.2 Error Boundaries

- [x] Create error boundary component
- [x] Wrap screens with error boundary

### 6.3 Toast Notifications

- [x] Add toast notifications for:
  - [x] Success messages (book added, progress updated)
  - [x] Error messages (network failed, validation error)

### 6.4 Loading States

- [x] Add skeleton loaders for:
  - [x] Book cards
  - [x] List items
  - [x] Stats cards

## Phase 7: Testing & Polish

### 7.1 Manual Testing Checklist

- [ ] Add book from search
- [ ] Update reading progress
- [ ] Rate a book
- [ ] Create custom list
- [ ] Add book to list
- [ ] Set yearly goal
- [ ] Mark book as complete
- [ ] Filter books by status

### 7.2 Edge Cases

- [ ] Duplicate book addition
- [ ] Progress exceeds total pages
- [ ] Empty search results
- [ ] Network errors
- [ ] Auth errors

### 7.3 Performance

- [ ] Test with 100+ books
- [ ] Verify query caching works
- [ ] Check smooth scrolling

## Phase 8: Optional Enhancements

- [ ] Local SQLite caching for offline access
- [ ] Swipe actions (if desired later)
- [ ] Reading streaks
- [ ] More detailed analytics
- [ ] Import/export reading data
