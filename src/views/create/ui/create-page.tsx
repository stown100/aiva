"use client";

import { CreditCard, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useMe } from "@/entities/user";
import { useGenerationFlow } from "@/features/generate-image";
import { track } from "@/shared/analytics";
import { AppHeader } from "@/widgets/app-header";
import { GenerationProgress } from "@/widgets/generation-progress";
import { PhotoUploader } from "@/widgets/photo-uploader";
import { ResultViewer } from "@/widgets/result-viewer";
import { StyleGallery } from "@/widgets/style-gallery";

import { useCreateFlowStore } from "../model/create-flow-store";
import { FlowMessage } from "./flow-message";
import { GenerateBar } from "./generate-bar";
import { GuestGate } from "./guest-gate";
import { PhotoStrip } from "./photo-strip";

export function CreatePage() {
  const t = useTranslations();
  const { status: meStatus, refetch: refetchMe } = useMe();
  const { photo, styleId, setPhoto, setStyle } = useCreateFlowStore();
  const flow = useGenerationFlow();

  const styleName = styleId ? t(`styles.items.${styleId}.name`) : "";

  // Keep the shared credits state in sync on every flow transition: spend on
  // start, refund on failure — the header badge updates without a reload.
  useEffect(() => {
    if (flow.status === "generating" || flow.status === "completed" || flow.status === "failed") {
      void refetchMe();
    }
  }, [flow.status, refetchMe]);

  const handleSelectStyle = (id: string) => {
    setStyle(id);
    track({ name: "style_selected", props: { styleId: id } });
  };

  const handleGenerate = () => {
    if (!photo || !styleId) return;
    void flow.start({ originalImageId: photo.originalImageId, styleId }).then(refetchMe);
  };

  const handleRegenerate = () => {
    void flow.regenerate().then(refetchMe);
  };

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 pb-28">
        {meStatus === "loading" && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {meStatus === "guest" && <GuestGate />}

        {(meStatus === "authenticated" || meStatus === "error") && (
          <>
            {flow.status === "idle" && (
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

            {flow.status === "generating" && photo && (
              <GenerationProgress styleName={styleName} photoUrl={photo.previewUrl} />
            )}

            {flow.status === "completed" && flow.generation && (
              <ResultViewer
                generation={flow.generation}
                styleName={styleName}
                onRegenerate={handleRegenerate}
                onChangeStyle={flow.reset}
              />
            )}

            {flow.status === "no_credits" && (
              <FlowMessage
                icon={CreditCard}
                title={t("create.noCredits.title")}
                description={t("create.noCredits.description")}
                actions={[
                  { label: t("create.noCredits.back"), onClick: flow.reset, variant: "outline" },
                ]}
              />
            )}

            {flow.status === "failed" && (
              <FlowMessage
                icon={TriangleAlert}
                title={t("create.failed.title")}
                description={t("create.failed.description")}
                actions={[
                  { label: t("common.retry"), onClick: handleGenerate },
                  { label: t("create.failed.back"), onClick: flow.reset, variant: "outline" },
                ]}
              />
            )}
          </>
        )}
      </main>

      {photo && styleId && flow.status === "idle" && (
        <GenerateBar styleName={styleName} onGenerate={handleGenerate} />
      )}
    </>
  );
}
