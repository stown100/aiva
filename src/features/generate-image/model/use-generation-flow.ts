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
import { ApiErrorCode, GenerationStatus } from "@/shared/types";

const POLL_INTERVAL_MS = 2000;

export enum GenerationFlowStatus {
  IDLE = "idle",
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  NO_CREDITS = "no_credits",
}

interface UseGenerationFlowResult {
  status: GenerationFlowStatus;
  generation: GenerationDetail | null;
  start: (input: { originalImageId: string; styleId: string }) => Promise<void>;
  regenerate: () => Promise<void>;
  /** Client-side guard: show the no-credits screen without hitting the API. */
  markNoCredits: () => void;
  reset: () => void;
}

export function useGenerationFlow(): UseGenerationFlowResult {
  const [status, setStatus] = useState<GenerationFlowStatus>(GenerationFlowStatus.IDLE);
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

          // Intermediate polls render nothing — commit state only on terminal
          // statuses so the progress screen isn't re-rendered every tick.
          if (detail.status === GenerationStatus.COMPLETED) {
            setGeneration(detail);
            const lastVersion = detail.variants.at(-1)?.versionNumber ?? 1;
            track({
              name: "generation_completed",
              props: { styleId: detail.styleId, versionNumber: lastVersion },
            });
            setStatus(GenerationFlowStatus.COMPLETED);
            return;
          }
          if (detail.status === GenerationStatus.FAILED) {
            setGeneration(detail);
            track({
              name: "generation_failed",
              props: { styleId: detail.styleId, errorCode: detail.errorCode ?? "unknown" },
            });
            setStatus(GenerationFlowStatus.FAILED);
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
      setStatus(GenerationFlowStatus.GENERATING);
      track({ name: "generation_started", props: { styleId } });

      try {
        const { generationId } = await request();
        poll(generationId);
      } catch (error) {
        if (error instanceof ApiClientError && error.code === ApiErrorCode.NO_CREDITS) {
          track({ name: "credit_exhausted" });
          setStatus(GenerationFlowStatus.NO_CREDITS);
          return;
        }
        track({
          name: "generation_failed",
          props: {
            styleId,
            errorCode: error instanceof ApiClientError ? error.code : "unknown",
          },
        });
        setStatus(GenerationFlowStatus.FAILED);
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

  const markNoCredits = useCallback(() => {
    stopPolling();
    track({ name: "credit_exhausted" });
    setStatus(GenerationFlowStatus.NO_CREDITS);
  }, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus(GenerationFlowStatus.IDLE);
    setGeneration(null);
  }, [stopPolling]);

  return { status, generation, start, regenerate, markNoCredits, reset };
}
