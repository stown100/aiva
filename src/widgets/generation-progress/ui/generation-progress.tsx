"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

import { PROGRESS_STEPS } from "../constants";

interface GenerationProgressProps {
  styleName: string;
  photoUrl: string;
}

export function GenerationProgress({ styleName, photoUrl }: GenerationProgressProps) {
  const t = useTranslations("create.progress");
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = PROGRESS_STEPS.slice(1).map((step, index) =>
      setTimeout(() => setActiveStep(index + 1), step.startsAtMs),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-56 overflow-hidden rounded-3xl border shadow-xl md:size-64">
        <Image
          src={photoUrl}
          alt=""
          fill
          unoptimized
          className="scale-105 object-cover blur-[2px]"
        />
        <div className="bg-brand-gradient absolute inset-0 opacity-30" />
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          initial={{ left: "-35%" }}
          animate={{ left: "105%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
          aria-hidden
        />
      </div>

      <h1 className="mt-8 text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-muted-foreground">{styleName}</p>

      <ul className="mt-8 w-full max-w-xs space-y-3 text-left">
        {PROGRESS_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isActive = index === activeStep;

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                isActive && "border-primary/40 bg-primary/5",
                !isActive && !isDone && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : isActive ? (
                  <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </span>
              <span className="text-sm font-medium">{t(`steps.${step.key}`)}</span>
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
