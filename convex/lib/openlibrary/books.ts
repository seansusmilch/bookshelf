'use node';

import { fetchOpenLibrary, isValidOLID } from './client';
import { Book, Work, Author, EditionsResponse } from './types';

export async function getBook(olid: string): Promise<Book> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid book OLID: ${olid}`);
  }

  return fetchOpenLibrary<Book>(`/books/${olid}.json`);
}

export async function getWork(olid: string): Promise<Work> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid work OLID: ${olid}`);
  }

  return fetchOpenLibrary<Work>(`/works/${olid}.json`);
}

export async function getWorkEditions(
  olid: string,
  limit: number = 50
): Promise<EditionsResponse> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid work OLID: ${olid}`);
  }

  const params = new URLSearchParams({ limit: limit.toString() });
  return fetchOpenLibrary<EditionsResponse>(`/works/${olid}/editions.json?${params.toString()}`);
}

export async function getAuthor(olid: string): Promise<Author> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid author OLID: ${olid}`);
  }

  return fetchOpenLibrary<Author>(`/authors/${olid}.json`);
}

export async function getAuthorWorks(
  olid: string,
  limit: number = 20
): Promise<{ entries: Work[] }> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid author OLID: ${olid}`);
  }

  const params = new URLSearchParams({ limit: limit.toString() });
  return fetchOpenLibrary(`/authors/${olid}/works.json?${params.toString()}`);
}

export async function getWorkRatings(olid: string): Promise<{ summary: string; count: number }> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid work OLID: ${olid}`);
  }

  return fetchOpenLibrary(`/works/${olid}/ratings.json`);
}

export async function getWorkBookshelves(olid: string): Promise<{ count: number; works: any[] }> {
  if (!isValidOLID(olid)) {
    throw new Error(`Invalid work OLID: ${olid}`);
  }

  return fetchOpenLibrary(`/works/${olid}/bookshelves.json`);
}
