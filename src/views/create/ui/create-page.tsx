"use client";

import { useTranslations } from "next-intl";

import { useMe } from "@/entities/user";
import { PhotoUploader } from "@/widgets/photo-uploader";
import { AppHeader } from "@/widgets/app-header";

import { useCreateFlowStore } from "../model/create-flow-store";
import { GuestGate } from "./guest-gate";

export function CreatePage() {
  const t = useTranslations("create");
  const { status } = useMe();
  const photo = useCreateFlowStore((state) => state.photo);
  const setPhoto = useCreateFlowStore((state) => state.setPhoto);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {status === "loading" && (
          <div className="min-h-64 animate-pulse rounded-3xl bg-muted" aria-hidden />
        )}

        {status === "guest" && <GuestGate />}

        {(status === "authenticated" || status === "error") && (
          <section>
            <h1 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
              {photo ? t("styleStep.title") : t("upload.step")}
            </h1>

            <div className="mt-8">
              <PhotoUploader photo={photo} onPhotoChange={setPhoto} />
            </div>

            {photo && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("styleStep.comingSoon")}
              </p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
