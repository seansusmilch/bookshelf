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

- [ ] `components/ui/BookCard.tsx`
  - [ ] Display cover, title, author, progress bar, rating badge
  - [ ] Tap handler for detail modal
  - [ ] Three-dot menu button

- [ ] `components/ui/ProgressSlider.tsx`
  - [ ] Range slider for page entry
  - [ ] Display current/total pages
  - [ ] Validation: can't exceed total pages

- [ ] `components/ui/RatingPicker.tsx`
  - [ ] Horizontal scrollable row of 10 numbered stars
  - [ ] Tap to select with visual feedback
  - [ ] 1-10 scale

### 3.2 List Components

- [ ] `components/ui/ListSelector.tsx`
  - [ ] Checkbox list of existing lists
  - [ ] "Create New List" button
  - [ ] Multi-select support

- [ ] `components/ui/FilterTabs.tsx`
  - [ ] Segmented control for status filtering
  - [ ] Persist selection across sessions

### 3.3 Stats Components

- [ ] `components/ui/StatsCard.tsx`
  - [ ] Display goal progress
  - [ ] Books read / yearly goal
  - [ ] Pages read total

### 3.4 Layout Components

- [ ] `components/book/BookDetailModal.tsx`
  - [ ] Full book details view
  - [ ] Progress slider integration
  - [ ] Rating picker integration
  - [ ] List selector integration
  - [ ] Mark complete button

- [ ] `components/book/BookActionsMenu.tsx`
  - [ ] Three-dot menu options
  - [ ] "Rate" action
  - [ ] "Update Progress" action
  - [ ] "Manage Lists" action

- [ ] `components/book/AddBookSheet.tsx`
  - [ ] Status selection prompt
  - [ ] Optional list selection
  - [ ] Confirm button

## Phase 4: Screen Implementation

### 4.1 My Books Screen

- [ ] `app/(tabs)/my-books.tsx`
  - [ ] Filter tabs at top
  - [ ] BookCard list
  - [ ] Empty state
  - [ ] Loading state (skeleton)
  - [ ] Pull-to-refresh

### 4.2 Search Screen

- [ ] `app/(tabs)/search.tsx`
  - [ ] Search bar
  - [ ] API results list
  - [ ] Result card with thumbnail, title, author
  - [ ] Tap to view details
  - [ ] Add button opens AddBookSheet

### 4.3 Stats Screen

- [ ] `app/(tabs)/stats.tsx`
  - [ ] StatsCard with goal progress
  - [ ] "Set Goal" button
  - [ ] Pages read display
  - [ ] Simple charts (optional)

## Phase 5: Navigation & Routing

### 5.1 Update Tab Layout

- [ ] Update `app/(tabs)/_layout.tsx`
  - [ ] Add "My Books", "Search", "Stats" tabs
  - [ ] Configure tab icons

### 5.2 Modal Routes

- [ ] Create modal routes for:
  - [ ] Book detail view
  - [ ] Goal settings

## Phase 6: Error Handling & Validation

### 6.1 Validation

- [ ] Add Zod schemas for:
  - [ ] Book data
  - [ ] Progress updates
  - [ ] Ratings
  - [ ] List names
  - [ ] Yearly goals

### 6.2 Error Boundaries

- [ ] Create error boundary component
- [ ] Wrap screens with error boundary

### 6.3 Toast Notifications

- [ ] Add toast notifications for:
  - [ ] Success messages (book added, progress updated)
  - [ ] Error messages (network failed, validation error)

### 6.4 Loading States

- [ ] Add skeleton loaders for:
  - [ ] Book cards
  - [ ] List items
  - [ ] Stats cards

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
