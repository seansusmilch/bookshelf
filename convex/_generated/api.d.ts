/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as books from "../books.js";
import type * as cache from "../cache.js";
import type * as lib_openlibrary_books from "../lib/openlibrary/books.js";
import type * as lib_openlibrary_client from "../lib/openlibrary/client.js";
import type * as lib_openlibrary_covers from "../lib/openlibrary/covers.js";
import type * as lib_openlibrary_index from "../lib/openlibrary/index.js";
import type * as lib_openlibrary_isbn from "../lib/openlibrary/isbn.js";
import type * as lib_openlibrary_search from "../lib/openlibrary/search.js";
import type * as lib_openlibrary_types from "../lib/openlibrary/types.js";
import type * as lists from "../lists.js";
import type * as openLibrarySearch from "../openLibrarySearch.js";
import type * as ratings from "../ratings.js";
import type * as stats from "../stats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  books: typeof books;
  cache: typeof cache;
  "lib/openlibrary/books": typeof lib_openlibrary_books;
  "lib/openlibrary/client": typeof lib_openlibrary_client;
  "lib/openlibrary/covers": typeof lib_openlibrary_covers;
  "lib/openlibrary/index": typeof lib_openlibrary_index;
  "lib/openlibrary/isbn": typeof lib_openlibrary_isbn;
  "lib/openlibrary/search": typeof lib_openlibrary_search;
  "lib/openlibrary/types": typeof lib_openlibrary_types;
  lists: typeof lists;
  openLibrarySearch: typeof openLibrarySearch;
  ratings: typeof ratings;
  stats: typeof stats;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
