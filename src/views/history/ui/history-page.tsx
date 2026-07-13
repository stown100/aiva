"use client";

import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { fetchGeneration, type GenerationDetail } from "@/entities/generation";
import { MeStatus, useMe } from "@/entities/user";
import { AppHeader } from "@/widgets/app-header";
import { AuthGate } from "@/widgets/auth-gate";
import { HistoryGrid } from "@/widgets/history-grid";
import { Button } from "@/shared/ui/button";

// Shown only after opening an item — loaded on demand to keep framer-motion
// out of the initial /history bundle.
const ResultViewer = dynamic(
  () => import("@/widgets/result-viewer").then((mod) => mod.ResultViewer),
  {
    loading: () => <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />,
  },
);

export function HistoryPage() {
  const t = useTranslations();
  const { status: meStatus } = useMe();
  const [detail, setDetail] = useState<GenerationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const handleOpen = async (generationId: string) => {
    setIsDetailLoading(true);
    try {
      setDetail(await fetchGeneration(generationId));
    } catch {
      // The grid stays visible; opening again retries.
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {meStatus === MeStatus.LOADING && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {meStatus === MeStatus.GUEST && <AuthGate />}

        {(meStatus === MeStatus.AUTHENTICATED || meStatus === MeStatus.ERROR) &&
          (detail ? (
            <section>
              <Button variant="ghost" className="gap-1.5" onClick={() => setDetail(null)}>
                <ArrowLeft aria-hidden />
                {t("history.back")}
              </Button>
              <div className="mt-4">
                <ResultViewer
                  generation={detail}
                  styleName={t(`styles.items.${detail.styleId}.name`)}
                />
              </div>
            </section>
          ) : (
            <section aria-busy={isDetailLoading}>
              <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                {t("history.title")}
              </h1>
              <div
                className={
                  isDetailLoading
                    ? "pointer-events-none mt-8 animate-pulse opacity-60"
                    : "mt-8"
                }
              >
                <HistoryGrid onOpen={(id) => void handleOpen(id)} />
              </div>
            </section>
          ))}
      </main>
    </>
  );
}
