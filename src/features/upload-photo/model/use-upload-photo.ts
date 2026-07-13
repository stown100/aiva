"use client";

import { useState } from "react";

import { track } from "@/shared/analytics";
import { ApiClientError } from "@/shared/api";
import { UPLOAD_ACCEPTED_EXTENSIONS, UPLOAD_MAX_SIZE_BYTES } from "@/shared/config";

import { uploadPhoto } from "../api/upload-api";
import type { UploadedPhoto } from "../types";

export enum UploadStatus {
  IDLE = "idle",
  UPLOADING = "uploading",
  ERROR = "error",
}

interface UseUploadPhotoOptions {
  onUploaded: (photo: UploadedPhoto) => void;
}

interface UseUploadPhotoResult {
  status: UploadStatus;
  errorCode: string | null;
  upload: (file: File) => Promise<void>;
}

function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return UPLOAD_ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function useUploadPhoto({ onUploaded }: UseUploadPhotoOptions): UseUploadPhotoResult {
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fail = (code: string) => {
    setErrorCode(code);
    setStatus(UploadStatus.ERROR);
  };

  const upload = async (file: File) => {
    // Cheap client-side checks for instant feedback; the server re-validates
    // by magic bytes and enforces the same limits.
    if (!hasAcceptedExtension(file.name)) {
      fail("unsupported_format");
      return;
    }
    if (file.size > UPLOAD_MAX_SIZE_BYTES) {
      fail("upload_too_large");
      return;
    }

    setStatus(UploadStatus.UPLOADING);
    setErrorCode(null);
    track({ name: "upload_started" });

    try {
      const photo = await uploadPhoto(file);
      track({ name: "upload_completed", props: { format: "jpeg", sizeBytes: file.size } });
      setStatus(UploadStatus.IDLE);
      onUploaded(photo);
    } catch (error) {
      fail(error instanceof ApiClientError ? error.code : "unknown");
    }
  };

  return { status, errorCode, upload };
}
