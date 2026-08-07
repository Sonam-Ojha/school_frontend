import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '@/config/constants';
import type { ListQueryParams, SortDirection } from '@/types/api';

import { useDebounce } from './useDebounce';

export interface TableQueryOptions {
  /** Column the API sorts by when the user has not chosen one. */
  defaultSortBy?: string;
  defaultSortDir?: SortDirection;
  defaultPageSize?: number;
  /** Filter keys this table owns. Only these are read from / written to the URL. */
  filterKeys?: string[];
}

export interface TableQueryState {
  page: number;
  perPage: number;
  /** Raw input value — bind this to the search box. */
  search: string;
  sortBy: string | undefined;
  sortDir: SortDirection;
  filters: Record<string, string>;

  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearch: (search: string) => void;
  /** Toggles asc/desc when the same column is clicked again. */
  toggleSort: (column: string) => void;
  setFilter: (key: string, value: string | undefined) => void;
  resetFilters: () => void;

  /** Debounced, API-ready params. Feed straight into a query key. */
  queryParams: ListQueryParams;
  hasActiveFilters: boolean;
}

/**
 * Single source of truth for every data table's pagination, search, sorting
 * and filter state — stored in the URL so a filtered view is shareable,
 * bookmarkable and survives a refresh or a back-button press.
 */
export function useTableQueryState(options: TableQueryOptions = {}): TableQueryState {
  const {
    defaultSortBy,
    defaultSortDir = 'desc',
    defaultPageSize = DEFAULT_PAGE_SIZE,
    filterKeys = [],
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const perPage = Number(searchParams.get('per_page')) || defaultPageSize;
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sort_by') ?? defaultSortBy;
  const sortDir = (searchParams.get('sort_dir') as SortDirection) ?? defaultSortDir;

  const filterKeysKey = filterKeys.join(',');
  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    for (const key of filterKeysKey ? filterKeysKey.split(',') : []) {
      const value = searchParams.get(key);
      if (value) result[key] = value;
    }
    return result;
  }, [searchParams, filterKeysKey]);

  /** Write params, dropping empty values so URLs stay clean. */
  const patchParams = useCallback(
    (patch: Record<string, string | number | undefined>, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          }
          // Any change to the result set invalidates the current page number.
          if (resetPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback((next: number) => patchParams({ page: next }, false), [patchParams]);

  const setPerPage = useCallback(
    (next: number) => patchParams({ per_page: next === defaultPageSize ? undefined : next }),
    [patchParams, defaultPageSize],
  );

  const setSearch = useCallback(
    (next: string) => patchParams({ search: next || undefined }),
    [patchParams],
  );

  const toggleSort = useCallback(
    (column: string) => {
      const nextDir: SortDirection = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
      patchParams({ sort_by: column, sort_dir: nextDir });
    },
    [patchParams, sortBy, sortDir],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => patchParams({ [key]: value || undefined }),
    [patchParams],
  );

  const resetFilters = useCallback(() => {
    const cleared: Record<string, undefined> = { search: undefined };
    for (const key of filterKeysKey ? filterKeysKey.split(',') : []) cleared[key] = undefined;
    patchParams(cleared);
  }, [patchParams, filterKeysKey]);

  // Debounce only the search term; page/sort/filter changes are deliberate
  // clicks and should hit the API immediately.
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const queryParams = useMemo<ListQueryParams>(
    () => ({
      page,
      per_page: perPage,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(sortBy ? { sort_by: sortBy, sort_dir: sortDir } : {}),
      ...filters,
    }),
    [page, perPage, debouncedSearch, sortBy, sortDir, filters],
  );

  return {
    page,
    perPage,
    search,
    sortBy,
    sortDir,
    filters,
    setPage,
    setPerPage,
    setSearch,
    toggleSort,
    setFilter,
    resetFilters,
    queryParams,
    hasActiveFilters: Boolean(search) || Object.keys(filters).length > 0,
  };
}
