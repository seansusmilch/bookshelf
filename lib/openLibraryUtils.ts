import { api } from 'convex/_generated/api';

export type Edition = {
  key: string;
  title: string;
  pageCount?: number;
  publishDate?: string;
  coverUrl?: string;
  isbn10?: string[];
  isbn13?: string[];
  publishers?: { name: string }[];
  languages?: { key: string }[];
  covers?: number[];
  authors?: any[];
  physicalFormat?: string;
};

export const extractOLID = (key: string): string => {
  const match = key.match(/\/(?:books|works|authors)\/([A-Za-z0-9]+)/);
  return match ? match[1] : key;
};

export const getEditionCoverUrl = (edition: Edition): string | undefined => {
  if (edition.covers && edition.covers.length > 0) {
    return `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`;
  }
  if (edition.isbn10 && edition.isbn10.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${edition.isbn10[0]}-M.jpg`;
  }
  if (edition.isbn13 && edition.isbn13.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${edition.isbn13[0]}-M.jpg`;
  }
  if (edition.key) {
    const editionOlid = extractOLID(edition.key);
    return `https://covers.openlibrary.org/b/olid/${editionOlid}-M.jpg`;
  }
  return undefined;
};

export const scoreEdition = (edition: Edition): number => {
  let score = 0;

  const hasPageCount = edition.pageCount && edition.pageCount > 0;
  const hasEnglish = edition.languages?.some((l: any) => l.key === '/languages/eng');
  const hasCover = edition.coverUrl || (edition.covers && edition.covers.length > 0);
  const hasAuthors = edition.authors && edition.authors.length > 0 && edition.authors[0]?.name;

  if (hasPageCount) {
    score += 100;
  }

  if (hasEnglish) {
    score += 50;
  }

  if (hasCover) {
    score += 75;
  }

  if (hasAuthors) {
    score += 60;
  }

  return score;
};

export const processEditions = (editions: Edition[]): Edition[] => {
  const editionsWithAuthors = editions.filter((edition: Edition) => {
    const hasAuthors = edition.authors && edition.authors.length > 0;
    return hasAuthors;
  });

  if (editionsWithAuthors.length === 0) {
    return [];
  }

  const scoredEditions = editionsWithAuthors.map((edition) => ({
    edition,
    score: scoreEdition(edition),
  }));

  const sortedEditions = scoredEditions.sort((a, b) => b.score - a.score);
  return sortedEditions.map((item) => item.edition);
};
