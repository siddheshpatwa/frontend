import dns from "node:dns";
import net from "node:net";

/**
 * Guards server-side outbound requests against SSRF. Enforced in production
 * unless ALLOW_PRIVATE_REQUESTS=true; always enforced when BLOCK_PRIVATE_REQUESTS=true.
 */
export function privateRequestsBlocked() {
  if (process.env.BLOCK_PRIVATE_REQUESTS === "true") return true;
  if (process.env.ALLOW_PRIVATE_REQUESTS === "true") return false;
  return process.env.NODE_ENV === "production";
}

export function isPrivateAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      lower === "::" ||
      lower === "::1" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe8") ||
      lower.startsWith("fe9") ||
      lower.startsWith("fea") ||
      lower.startsWith("feb")
    );
  }
  return true;
}

/** Adds https:// when no scheme is given, then checks scheme and literal IPs. */
export function normalizeAndValidateUrl(raw: string): string {
  let value = (raw ?? "").trim();
  if (!value) throw new Error("URL is required");
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(value)) value = `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }
  if (privateRequestsBlocked()) {
    const host = parsed.hostname.replace(/^\[|\]$/g, "");
    if (host.toLowerCase() === "localhost" || (net.isIP(host) && isPrivateAddress(host))) {
      throw new Error("Requests to private or local addresses are blocked");
    }
  }
  return parsed.toString();
}

/** DNS lookup that rejects private addresses (covers redirects and DNS rebinding). */
export const safeLookup = (
  hostname: string,
  options: dns.LookupOptions,
  callback: (...args: unknown[]) => void
) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = addresses as dns.LookupAddress[];
    if (privateRequestsBlocked() && list.some((a) => isPrivateAddress(a.address))) {
      return callback(new Error("Requests to private or local addresses are blocked"));
    }
    if (options?.all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
};
