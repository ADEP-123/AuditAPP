async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `HTTP ${res.status}`);
  }
  return res;
}

export const http = {
  get: async (url) => (await request('GET', url)).json(),
  post: async (url, body) => (await request('POST', url, body)).json(),
  postForBlob: async (url, body) => (await request('POST', url, body)).blob(),
};
