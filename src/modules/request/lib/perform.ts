import axios, { AxiosRequestConfig } from "axios";
import { normalizeAndValidateUrl, safeLookup } from "@/lib/safe-url";
import { buildBodyAndHeaders, toKeyValueObject } from "./normalize";

export const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 30_000;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024;

export type SendInput = {
  method: string;
  url: string;
  headers?: unknown;
  params?: unknown;
  body?: unknown;
};

export async function performRequest(req: SendInput) {
  const start = performance.now();
  try {
    const url = normalizeAndValidateUrl(req.url);
    const { body, headers } = buildBodyAndHeaders(
      req.body,
      toKeyValueObject(req.headers)
    );

    const config: AxiosRequestConfig = {
      method: req.method,
      url,
      headers,
      params: toKeyValueObject(req.params),
      data: body,
      validateStatus: () => true, // capture error statuses too
      timeout: REQUEST_TIMEOUT_MS,
      maxContentLength: MAX_RESPONSE_BYTES,
      maxRedirects: 5,
      lookup: safeLookup as AxiosRequestConfig["lookup"],
    };

    const res = await axios(config);
    const duration = performance.now() - start;

    const raw =
      typeof res.data === "string" ? res.data : JSON.stringify(res.data ?? "");
    const headerLength = Number(res.headers["content-length"]);
    const size =
      Number.isFinite(headerLength) && headerLength > 0
        ? headerLength
        : res.data === "" || res.data === undefined
          ? 0
          : Buffer.byteLength(raw);

    return {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(Object.entries(res.headers)),
      data: res.data,
      duration: Math.round(duration),
      size,
      error: undefined as string | undefined,
    };
  } catch (error) {
    const message =
      axios.isAxiosError(error) && error.code === "ECONNABORTED"
        ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
        : error instanceof Error
          ? error.message
          : "Request failed";
    return {
      status: undefined as number | undefined,
      statusText: undefined as string | undefined,
      headers: undefined as Record<string, unknown> | undefined,
      data: undefined as unknown,
      size: undefined as number | undefined,
      error: message,
      duration: Math.round(performance.now() - start),
    };
  }
}

