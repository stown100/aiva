"use client";

import { CreditCard, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";

import { MeStatus, useMe } from "@/entities/user";
import { GenerationFlowStatus, useGenerationFlow } from "@/features/generate-image";
import { track } from "@/shared/analytics";
import { FREE_MONTHLY_CREDITS } from "@/shared/config";
import { AppHeader } from "@/widgets/app-header";
import { AuthGate } from "@/widgets/auth-gate";
import { PhotoUploader } from "@/widgets/photo-uploader";
import { StyleGallery } from "@/widgets/style-gallery";

import { useCreateFlowStore } from "../model/create-flow-store";
import { FlowMessage } from "./flow-message";
import { GenerateBar } from "./generate-bar";
import { PhotoStrip } from "./photo-strip";

const widgetFallback = (
  <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
);

// These framer-motion-heavy widgets appear only mid-flow, so they're loaded
// on demand instead of shipping with the initial /create bundle.
const GenerationProgress = dynamic(
  () => import("@/widgets/generation-progress").then((mod) => mod.GenerationProgress),
  { loading: () => widgetFallback },
);
const ResultViewer = dynamic(
  () => import("@/widgets/result-viewer").then((mod) => mod.ResultViewer),
  { loading: () => widgetFallback },
);

export function CreatePage() {
  const t = useTranslations();
  const { profile, status: meStatus, refetch: refetchMe } = useMe();
  const { photo, styleId, setPhoto, setStyle } = useCreateFlowStore();
  const flow = useGenerationFlow();
  const { markNoCredits, regenerate, reset, start } = flow;

  const styleName = styleId ? t(`styles.items.${styleId}.name`) : "";

  // A failed generation refunds the credit on the server — refetch on the
  // terminal states so the header badge reflects it without a reload.
  useEffect(() => {
    if (
      flow.status === GenerationFlowStatus.COMPLETED ||
      flow.status === GenerationFlowStatus.FAILED
    ) {
      void refetchMe();
    }
  }, [flow.status, refetchMe]);

  const handleSelectStyle = useCallback(
    (id: string) => {
      setStyle(id);
      track({ name: "style_selected", props: { styleId: id } });
    },
    [setStyle],
  );

  // Don't hit the API when we already know there are no credits — the request
  // would only fail after work (and money) is spent. If the profile is
  // unavailable (MeStatus.ERROR), the server-side check stays the source of truth.
  const hasNoCredits = profile !== null && profile.credits <= 0;

  const handleGenerate = useCallback(() => {
    if (!photo || !styleId) return;
    if (hasNoCredits) {
      markNoCredits();
      return;
    }
    void start({ originalImageId: photo.originalImageId, styleId }).then(refetchMe);
  }, [photo, styleId, hasNoCredits, markNoCredits, start, refetchMe]);

  const handleRegenerate = useCallback(() => {
    if (hasNoCredits) {
      markNoCredits();
      return;
    }
    void regenerate().then(refetchMe);
  }, [hasNoCredits, markNoCredits, regenerate, refetchMe]);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 pb-28">
        {meStatus === MeStatus.LOADING && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {meStatus === MeStatus.GUEST && <AuthGate />}

        {(meStatus === MeStatus.AUTHENTICATED || meStatus === MeStatus.ERROR) && (
          <>
            {flow.status === GenerationFlowStatus.IDLE && (
              <section>
                <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                  {photo ? t("create.styleStep.title") : t("create.upload.step")}
                </h1>

                {photo ? (
                  <div className="mt-8 space-y-6">
                    <PhotoStrip photo={photo} onChangePhoto={() => setPhoto(null)} />
                    <StyleGallery selectedStyleId={styleId} onSelect={handleSelectStyle} />
                  </div>
                ) : (
                  <div className="mt-8">
                    <PhotoUploader photo={photo} onPhotoChange={setPhoto} />
                  </div>
                )}
              </section>
            )}

            {flow.status === GenerationFlowStatus.GENERATING && photo && (
              <GenerationProgress styleName={styleName} photoUrl={photo.previewUrl} />
            )}

            {flow.status === GenerationFlowStatus.COMPLETED && flow.generation && (
              <ResultViewer
                generation={flow.generation}
                styleName={styleName}
                onRegenerate={handleRegenerate}
                onChangeStyle={reset}
              />
            )}

            {flow.status === GenerationFlowStatus.NO_CREDITS && (
              <FlowMessage
                icon={CreditCard}
                title={t("create.noCredits.title")}
                description={t("create.noCredits.description", { count: FREE_MONTHLY_CREDITS })}
                actions={[
                  { label: t("create.noCredits.back"), onClick: reset, variant: "outline" },
                ]}
              />
            )}

            {flow.status === GenerationFlowStatus.FAILED && (
              <FlowMessage
                icon={TriangleAlert}
                title={t("create.failed.title")}
                description={t("create.failed.description")}
                actions={[
                  { label: t("common.retry"), onClick: handleGenerate },
                  { label: t("create.failed.back"), onClick: reset, variant: "outline" },
                ]}
              />
            )}
          </>
        )}
      </main>

      {photo && styleId && flow.status === GenerationFlowStatus.IDLE && (
        <GenerateBar styleName={styleName} onGenerate={handleGenerate} />
      )}
    </>
  );
}
