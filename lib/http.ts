const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Options = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
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

export async function http<T = any>(path: string, opts: Options = {}) {
  const { body, query, ...rest } = opts;
  const res = await fetch(buildUrl(path, query), {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (res.json() as Promise<T>) : ((await res.text()) as T);
}

export const httpPost = <T = any>(p: string, b?: any, o?: Options) => http<T>(p, { ...(o || {}), method: 'POST', body: b });


