import { Sparkles } from "lucide-react";

import { Badge } from "@/shared/ui/badge";

interface CreditsBadgeProps {
  credits: number;
  label: string;
}

export function CreditsBadge({ credits, label }: CreditsBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-1" title={label}>
      <Sparkles className="size-3.5 text-primary" aria-hidden />
      <span className="font-semibold tabular-nums">{credits}</span>
      <span className="sr-only">{label}</span>
    </Badge>
  );
}
