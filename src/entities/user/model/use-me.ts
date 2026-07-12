"use client";

import { useEffect } from "react";
import { create } from "zustand";

import { ApiClientError } from "@/shared/api";

import { fetchMe } from "../api/user-api";
import type { UserProfile } from "../types";

export type MeStatus = "loading" | "authenticated" | "guest" | "error";

interface UserState {
  profile: UserProfile | null;
  status: MeStatus;
  refetch: () => Promise<void>;
  markGuest: () => void;
}

/**
 * Single shared profile state: every consumer (header credits badge, create
 * flow, account page) sees the same data, so spending a credit updates the
 * whole UI without a reload.
 */
const useUserStore = create<UserState>((set) => ({
  profile: null,
  status: "loading",
  refetch: async () => {
    try {
      const profile = await fetchMe();
      set({ profile, status: "authenticated" });
    } catch (error) {
      set({
        profile: null,
        status: error instanceof ApiClientError && error.status === 401 ? "guest" : "error",
      });
    }
  },
  markGuest: () => set({ profile: null, status: "guest" }),
}));

let initialFetchStarted = false;

export function useMe(): UserState {
  const state = useUserStore();

  useEffect(() => {
    if (!initialFetchStarted) {
      initialFetchStarted = true;
      void useUserStore.getState().refetch();
    }
  }, []);

  return state;
}
