"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config";
import { Link } from "@/shared/i18n";

import { BeforeAfterCard } from "./before-after-card";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ backgroundImage: "linear-gradient(120deg, var(--brand-from), var(--brand-to))" }}
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-14 md:pb-24 md:pt-20 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              {t("badge")}
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-5 text-balance text-4xl font-extrabold tracking-tight md:text-6xl"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Button
              size="lg"
              className="bg-brand-gradient h-12 border-0 px-8 text-base text-white shadow-lg"
              render={<Link href={ROUTES.create} />}
            >
              {t("cta")}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-6 text-base"
              render={<a href="#styles" />}
            >
              {t("secondaryCta")}
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            {t("freeNote")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <BeforeAfterCard beforeLabel={t("beforeLabel")} afterLabel={t("afterLabel")} />
        </motion.div>
      </div>
    </section>
  );
}
