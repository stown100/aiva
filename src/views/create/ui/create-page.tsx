"use client";

import { useTranslations } from "next-intl";

import { useMe } from "@/entities/user";
import { track } from "@/shared/analytics";
import { AppHeader } from "@/widgets/app-header";
import { PhotoUploader } from "@/widgets/photo-uploader";
import { StyleGallery } from "@/widgets/style-gallery";

import { useCreateFlowStore } from "../model/create-flow-store";
import { GenerateBar } from "./generate-bar";
import { GuestGate } from "./guest-gate";
import { PhotoStrip } from "./photo-strip";

export function CreatePage() {
  const t = useTranslations();
  const { status } = useMe();
  const { photo, styleId, setPhoto, setStyle } = useCreateFlowStore();

  const handleSelectStyle = (id: string) => {
    setStyle(id);
    track({ name: "style_selected", props: { styleId: id } });
  };

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 pb-28">
        {status === "loading" && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {status === "guest" && <GuestGate />}

        {(status === "authenticated" || status === "error") && (
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
      </main>

      {photo && styleId && <GenerateBar styleName={t(`styles.items.${styleId}.name`)} />}
    </>
  );
}
