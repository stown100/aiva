"use client";

import { motion } from "framer-motion";

import { PortraitIllustration } from "./portrait-illustration";

const REVEAL_TRANSITION = {
  duration: 2.6,
  repeat: Infinity,
  repeatType: "reverse" as const,
  repeatDelay: 0.9,
  ease: "easeInOut" as const,
};

interface BeforeAfterCardProps {
  beforeLabel: string;
  afterLabel: string;
}

export function BeforeAfterCard({ beforeLabel, afterLabel }: BeforeAfterCardProps) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl">
      <div className="absolute inset-0">
        <PortraitIllustration variant="original" />
      </div>
      <span className="absolute left-4 top-4 z-10 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {beforeLabel}
      </span>

      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] }}
        transition={REVEAL_TRANSITION}
      >
        <PortraitIllustration variant="styled" />
        <span className="absolute right-4 top-4 rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          ✨ {afterLabel}
        </span>
      </motion.div>

      <motion.div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
        initial={{ left: "0%" }}
        animate={{ left: ["0%", "100%"] }}
        transition={REVEAL_TRANSITION}
      />
    </div>
  );
}
