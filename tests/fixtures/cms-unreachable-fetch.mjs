// Loaded only by the isolated browser-test server, never by the application.
// Simulates a CMS whose hostname does not resolve (the ENOTFOUND outage).
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/auth/v1/')) {
    return Promise.reject(new TypeError('fetch failed', { cause: Object.assign(new Error(`getaddrinfo ENOTFOUND ${url.hostname}`), { code: 'ENOTFOUND' }) }));
  }
  return originalFetch(input, init);
};
