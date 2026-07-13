import type { SubscriptionStatus } from "@/shared/types";

export interface UserProfile {
  id: string;
  email: string;
  language: string;
  credits: number;
  creditsResetAt: string;
  subscriptionStatus: SubscriptionStatus;
}
