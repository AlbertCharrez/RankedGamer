const UPSTREAM = "https://api.deadlock-api.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/deadlock/")) {
      return proxyDeadlock(request, url, ctx);
    }

    return env.ASSETS.fetch(request); // everything else = the website
  },
};

async function proxyDeadlock(request, url, ctx) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  // only forward the API's v1 endpoints
  const path = url.pathname.replace(/^\/api\/deadlock/, "");
  if (!path.startsWith("/v1/")) return new Response("Not found", { status: 404 });

  const target = UPSTREAM + path + url.search;
  const cache = caches.default;
  const cacheKey = new Request(target);

  // serve from Cloudflare's cache when we can
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const upstream = await fetch(target, { headers: { Accept: "application/json" } });
  const response = new Response(upstream.body, upstream);

  if (upstream.ok) {
    // how long to keep each kind of data
    const seconds = path.startsWith("/v1/analytics/")
      ? 3600 // rank comparisons: 1 hour
      : path.startsWith("/v1/assets/")
      ? 86400 // hero names and images: 1 day
      : path.startsWith("/v1/matches/")
      ? 86400 // finished matches don't change
      : 300; // player history and rank: 5 minutes

    response.headers.set("Cache-Control", `public, max-age=${seconds}`);
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}