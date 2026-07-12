"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchStyles } from "../api/style-api";
import type { StyleSummary } from "../types";

export type StylesStatus = "loading" | "ready" | "error";

// The catalog is static within a session — cache it at module level so
// remounts (navigation, state resets) don't refetch.
let catalogCache: StyleSummary[] | null = null;

interface UseStylesResult {
  styles: StyleSummary[];
  status: StylesStatus;
  retry: () => void;
}

export function useStyles(): UseStylesResult {
  const [styles, setStyles] = useState<StyleSummary[]>(catalogCache ?? []);
  const [status, setStatus] = useState<StylesStatus>(catalogCache ? "ready" : "loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const catalog = await fetchStyles();
      catalogCache = catalog;
      setStyles(catalog);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!catalogCache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- state updates happen after the fetch resolves
      void load();
    }
  }, [load]);

  return { styles, status, retry: () => void load() };
}
