import { apiPost } from "@/shared/api";

import type { UploadedPhoto } from "../types";

export function uploadPhoto(file: File): Promise<UploadedPhoto> {
  const formData = new FormData();
  formData.append("file", file);
  return apiPost<UploadedPhoto>("/api/upload", formData);
}
