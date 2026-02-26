"use client";

import { useState, useEffect, useRef } from "react";

export function useSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
    return () => clearTimeout(timer.current);
  }, [query, delay]);

  return { query, setQuery, debouncedQuery };
}
