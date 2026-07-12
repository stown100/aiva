import "server-only";

import {
  ensureMonthlyCredits,
  findUserById,
  type UserRecord,
} from "../repositories/user.repository";

export interface UserProfileDto {
  id: string;
  email: string;
  language: string;
  credits: number;
  subscriptionStatus: string;
}

function toProfileDto(record: UserRecord): UserProfileDto {
  return {
    id: record.id,
    email: record.email,
    language: record.language,
    credits: record.credits,
    subscriptionStatus: record.subscription_status,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfileDto | null> {
  await ensureMonthlyCredits(userId);
  const record = await findUserById(userId);
  return record ? toProfileDto(record) : null;
}
