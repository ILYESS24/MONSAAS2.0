/**
 * useSearch Hook
 * 
 * Provides search functionality with debouncing and filtering.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { logger } from '@/lib/logger';

export interface SearchableItem {
  id: string;
  [key: string]: unknown;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

interface UseSearchOptions<T> {
  items: T[];
  searchKeys: (keyof T)[];
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult<T>[];
  isSearching: boolean;
  hasResults: boolean;
  clearSearch: () => void;
}

/**
 * Simple string matching with score
 */
function matchString(str: string, query: string): { matches: boolean; score: number } {
  const lowerStr = str.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (lowerStr === lowerQuery) {
    return { matches: true, score: 100 };
  }
  
  // Starts with
  if (lowerStr.startsWith(lowerQuery)) {
    return { matches: true, score: 80 };
  }
  
  // Contains
  if (lowerStr.includes(lowerQuery)) {
    return { matches: true, score: 60 };
  }
  
  // Word match
  const words = lowerStr.split(/\s+/);
  if (words.some(word => word.startsWith(lowerQuery))) {
    return { matches: true, score: 40 };
  }
  
  return { matches: false, score: 0 };
}

/**
 * Hook for searching through items
 */
export function useSearch<T extends SearchableItem>({
  items,
  searchKeys,
  debounceMs = 300,
  minQueryLength = 2,
  maxResults = 20,
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search
  const results = useMemo(() => {
    if (debouncedQuery.length < minQueryLength) {
      return [];
    }

    const searchResults: SearchResult<T>[] = [];

    for (const item of items) {
      let bestScore = 0;
      const matches: string[] = [];

      for (const key of searchKeys) {
        const value = item[key];
        if (typeof value === 'string') {
          const { matches: isMatch, score } = matchString(value, debouncedQuery);
          if (isMatch) {
            if (score > bestScore) {
              bestScore = score;
            }
            matches.push(String(key));
          }
        }
      }

      if (bestScore > 0) {
        searchResults.push({ item, score: bestScore, matches });
      }
    }

    // Sort by score (highest first) and limit results
    return searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }, [items, searchKeys, debouncedQuery, minQueryLength, maxResults]);

  const hasResults = results.length > 0;

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  // Log search activity
  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      logger.debug('Search performed', { 
        query: debouncedQuery, 
        resultsCount: results.length 
      });
    }
  }, [debouncedQuery, results.length, minQueryLength]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    clearSearch,
  };
}

/**
 * Hook for simple filter functionality
 */
export function useFilter<T>(
  items: T[],
  filterFn: (item: T, filter: string) => boolean
) {
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter(item => filterFn(item, filter));
  }, [items, filter, filterFn]);

  const clearFilter = useCallback(() => {
    setFilter('');
  }, []);

  return {
    filter,
    setFilter,
    filteredItems,
    clearFilter,
    isFiltered: filter.length > 0,
  };
}

export default { useSearch, useFilter };
