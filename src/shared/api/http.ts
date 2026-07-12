export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(`API error ${status}: ${code}`);
    this.name = "ApiClientError";
  }
}

interface ApiErrorBody {
  error?: { code?: string };
}

async function parseError(response: Response): Promise<never> {
  let code = "unknown";
  try {
    const body = (await response.json()) as ApiErrorBody;
    code = body.error?.code ?? code;
  } catch {
    // non-JSON error body — keep the fallback code
  }
  throw new ApiClientError(response.status, code);
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) return parseError(response);
  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
  if (!response.ok) return parseError(response);
  return (await response.json()) as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) return parseError(response);
  return (await response.json()) as T;
}
