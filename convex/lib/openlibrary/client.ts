'use node';

import { OpenLibraryError } from './types';

const BASE_URL = 'https://openlibrary.org';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export interface FetchOptions {
  retryCount?: number;
  headers?: Record<string, string>;
}

export async function fetchOpenLibrary<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { retryCount = 0, headers = {} } = options;

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BookshelfApp/1.0 (https://github.com/user/bookshelf)',
        'Accept': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new OpenLibraryError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES && shouldRetry(error)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return fetchOpenLibrary<T>(endpoint, {
        ...options,
        retryCount: retryCount + 1,
      });
    }

    throw error;
  }
}

function shouldRetry(error: unknown): boolean {
  if (error instanceof OpenLibraryError) {
    return error.statusCode !== undefined && error.statusCode >= 500;
  }

  return error instanceof TypeError;
}

export function extractOLID(key: string, type: 'book' | 'work' | 'author'): string {
  const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/);
  if (!match) {
    throw new Error(`Invalid Open Library key: ${key}`);
  }
  return match[1];
}

export function isValidOLID(olid: string): boolean {
  return /^(OL[0-9]+[A-Z])$/.test(olid);
}
