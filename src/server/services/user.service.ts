import "server-only";

import {
  ensureMonthlyCredits,
  findUserById,
  updateUserLanguage,
  type UserRecord,
} from "../repositories/user.repository";

export interface UserProfileDto {
  id: string;
  email: string;
  language: string;
  credits: number;
  creditsResetAt: string;
  subscriptionStatus: string;
}

function toProfileDto(record: UserRecord): UserProfileDto {
  return {
    id: record.id,
    email: record.email,
    language: record.language,
    credits: record.credits,
    creditsResetAt: record.credits_reset_at,
    subscriptionStatus: record.subscription_status,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfileDto | null> {
  await ensureMonthlyCredits(userId);
  const record = await findUserById(userId);
  return record ? toProfileDto(record) : null;
}

export async function setUserLanguage(userId: string, language: string): Promise<void> {
  await updateUserLanguage(userId, language);
}
