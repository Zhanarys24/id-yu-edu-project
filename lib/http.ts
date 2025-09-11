const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

import { extractMessageFromBackend, mapErrorToFriendlyMessage } from './utils/errorMessages';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
type JsonArray = JsonValue[];

type Options<TBody extends JsonValue | undefined = undefined> = {
  method?: string;
  headers?: Record<string, string>;
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
};

function buildUrl(path: string, query?: Options['query']) {
  const full = path.startsWith('http') || BASE_URL === '' ? path : `${BASE_URL}${path}`;
  const url = new URL(full);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function http<TResponse = unknown, TBody extends JsonValue | undefined = undefined>(path: string, opts: Options<TBody> = {}) {
  const { body, query, ...rest } = opts as Options<TBody>;
  const res = await fetch(buildUrl(path, query), {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  if (!res.ok) {
    const status = res.status;
    const text = await res.text().catch(() => '');
    let friendly: string | undefined;
    try {
      const json = text ? JSON.parse(text) : undefined;
      friendly = json ? extractMessageFromBackend(json, status) : undefined;
    } catch {}
    throw new Error(friendly || mapErrorToFriendlyMessage(text || `HTTP ${status}`, status));
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (res.json() as Promise<TResponse>) : ((await res.text()) as TResponse);
}

export const httpPost = <TResponse = unknown, TBody extends JsonValue | undefined = undefined>(p: string, b?: TBody, o?: Options<TBody>) =>
  http<TResponse, TBody>(p, { ...(o || {}), method: 'POST', body: b as TBody });


