"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchGeneration,
  requestNewVariant,
  startGeneration,
  type GenerationDetail,
} from "@/entities/generation";
import { track } from "@/shared/analytics";
import { ApiClientError } from "@/shared/api";

const POLL_INTERVAL_MS = 2000;

export type GenerationFlowStatus =
  | "idle"
  | "generating"
  | "completed"
  | "failed"
  | "no_credits";

interface UseGenerationFlowResult {
  status: GenerationFlowStatus;
  generation: GenerationDetail | null;
  start: (input: { originalImageId: string; styleId: string }) => Promise<void>;
  regenerate: () => Promise<void>;
  reset: () => void;
}

export function useGenerationFlow(): UseGenerationFlowResult {
  const [status, setStatus] = useState<GenerationFlowStatus>("idle");
  const [generation, setGeneration] = useState<GenerationDetail | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styleIdRef = useRef<string>("");

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const poll = useCallback((generationId: string) => {
    const tick = () => {
      pollTimer.current = setTimeout(async () => {
        try {
          const detail = await fetchGeneration(generationId);
          setGeneration(detail);

          if (detail.status === "completed") {
            const lastVersion = detail.variants.at(-1)?.versionNumber ?? 1;
            track({
              name: "generation_completed",
              props: { styleId: detail.styleId, versionNumber: lastVersion },
            });
            setStatus("completed");
            return;
          }
          if (detail.status === "failed") {
            track({
              name: "generation_failed",
              props: { styleId: detail.styleId, errorCode: detail.errorCode ?? "unknown" },
            });
            setStatus("failed");
            return;
          }
          tick();
        } catch {
          // Transient poll error (network blip) — keep polling.
          tick();
        }
      }, POLL_INTERVAL_MS);
    };

    tick();
  }, []);

  const begin = useCallback(
    async (styleId: string, request: () => Promise<{ generationId: string }>) => {
      stopPolling();
      styleIdRef.current = styleId;
      setStatus("generating");
      track({ name: "generation_started", props: { styleId } });

      try {
        const { generationId } = await request();
        poll(generationId);
      } catch (error) {
        if (error instanceof ApiClientError && error.code === "no_credits") {
          track({ name: "credit_exhausted" });
          setStatus("no_credits");
          return;
        }
        track({
          name: "generation_failed",
          props: {
            styleId,
            errorCode: error instanceof ApiClientError ? error.code : "unknown",
          },
        });
        setStatus("failed");
      }
    },
    [poll, stopPolling],
  );

  const start = useCallback(
    async (input: { originalImageId: string; styleId: string }) => {
      setGeneration(null);
      await begin(input.styleId, () => startGeneration(input));
    },
    [begin],
  );

  const regenerate = useCallback(async () => {
    const current = generation;
    if (!current) return;
    await begin(current.styleId, () => requestNewVariant(current.id));
  }, [begin, generation]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setGeneration(null);
  }, [stopPolling]);

  return { status, generation, start, regenerate, reset };
}
