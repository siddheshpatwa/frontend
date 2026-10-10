type KeyValueItem = { key?: string; value?: string; enabled?: boolean };

/**
 * The editor stores headers/params as a JSON string of [{key, value, enabled}].
 * Axios needs a plain { key: value } object, so convert whatever was saved.
 */
export function toKeyValueObject(input: unknown): Record<string, string> {
  let data: unknown = input;
  if (typeof data === "string") {
    if (!data.trim()) return {};
    try {
      data = JSON.parse(data);
    } catch {
      return {};
    }
  }
  const result: Record<string, string> = {};
  if (Array.isArray(data)) {
    for (const item of data as KeyValueItem[]) {
      if (!item || item.enabled === false) continue;
      const key = item.key?.trim();
      if (key) result[key] = String(item.value ?? "");
    }
  } else if (data && typeof data === "object") {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (k.trim()) result[k.trim()] = String(v ?? "");
    }
  }
  return result;
}

/** Sends JSON bodies as JSON unless the user set their own Content-Type. */
export function buildBodyAndHeaders(
  rawBody: unknown,
  headers: Record<string, string>
): { body: unknown; headers: Record<string, string> } {
  if (rawBody === undefined || rawBody === null || rawBody === "") {
    return { body: undefined, headers };
  }
  const hasContentType = Object.keys(headers).some(
    (h) => h.toLowerCase() === "content-type"
  );
  if (typeof rawBody === "string") {
    try {
      JSON.parse(rawBody);
      return {
        body: rawBody,
        headers: hasContentType
          ? headers
          : { ...headers, "Content-Type": "application/json" },
      };
    } catch {
      return { body: rawBody, headers };
    }
  }
  return {
    body: rawBody,
    headers: hasContentType
      ? headers
      : { ...headers, "Content-Type": "application/json" },
  };
}
