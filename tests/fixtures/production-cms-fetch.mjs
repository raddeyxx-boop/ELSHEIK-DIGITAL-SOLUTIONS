// Loaded only by the isolated browser-test server, never by the application.
// Public environment values are embedded at build time by Next.js.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/rest/v1/')) {
    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    if (method !== 'GET') throw new Error('The isolated CMS fixture is read-only');
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    // Do not forward embedded production credentials, even to localhost.
    return originalFetch(`http://127.0.0.1:3101${url.pathname}${url.search}`, {
      method: 'GET', headers: { accept: headers.get('accept') || 'application/json' },
      signal: init?.signal,
    });
  }
  return originalFetch(input, init);
};
