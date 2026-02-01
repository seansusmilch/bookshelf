'use node';

import { fetchOpenLibrary } from './client';
import { SearchQuery, SearchResponse } from './types';

export async function searchBooks(
  query: SearchQuery
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query.q,
    fields: query.fields || 'key,title,author_name,author_key,cover_i,first_publish_year,edition_count,isbn,language,publisher,publish_year,subject',
    limit: (query.limit || 20).toString(),
  });

  if (query.offset) params.append('offset', query.offset.toString());
  if (query.page) params.append('page', query.page.toString());
  if (query.lang) params.append('lang', query.lang);
  if (query.sort) params.append('sort', query.sort);

  return fetchOpenLibrary<SearchResponse>(`/search.json?${params.toString()}`);
}

export async function searchAuthors(
  query: string,
  limit: number = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  return fetchOpenLibrary<SearchResponse>(`/search/authors.json?${params.toString()}`);
}

export async function searchSubjects(
  query: string,
  limit: number = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  return fetchOpenLibrary<SearchResponse>(`/search/subjects.json?${params.toString()}`);
}
