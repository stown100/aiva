"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError } from "@/shared/api";

import { fetchMe } from "../api/user-api";
import type { UserProfile } from "../types";

export type MeStatus = "loading" | "authenticated" | "guest" | "error";

interface UseMeResult {
  profile: UserProfile | null;
  status: MeStatus;
  refetch: () => Promise<void>;
  markGuest: () => void;
}

export function useMe(): UseMeResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<MeStatus>("loading");

  const refetch = useCallback(async () => {
    try {
      const me = await fetchMe();
      setProfile(me);
      setStatus("authenticated");
    } catch (error) {
      setProfile(null);
      setStatus(error instanceof ApiClientError && error.status === 401 ? "guest" : "error");
    }
  }, []);

  const markGuest = useCallback(() => {
    setProfile(null);
    setStatus("guest");
  }, []);

  useEffect(() => {
    // State updates happen after the fetch resolves, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { profile, status, refetch, markGuest };
}
