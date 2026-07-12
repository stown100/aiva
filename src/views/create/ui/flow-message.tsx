"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface FlowMessageAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "outline";
}

interface FlowMessageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions: FlowMessageAction[];
}

/** Shared card for terminal flow states (no credits, generation failed). */
export function FlowMessage({ icon: Icon, title, description, actions }: FlowMessageProps) {
  return (
    <Card className="mx-auto w-full max-w-sm text-center">
      <CardContent className="flex flex-col items-center pt-6">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex w-full flex-col gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant === "outline" ? "outline" : "default"}
              className={
                action.variant === "outline" ? undefined : "bg-brand-gradient border-0 text-white"
              }
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
