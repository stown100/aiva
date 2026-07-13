import "server-only";

import { NextResponse } from "next/server";

import { ApiErrorCode } from "@/shared/types";

export { ApiErrorCode };

export function jsonError(status: number, code: ApiErrorCode, message?: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}
