const API = "https://api.deadlock-api.com";
const STEAM64_BASE = 76561197960265728n; // SteamID64 -> Deadlock account_id offset

// SteamID64 (string) -> Deadlock account id (string)
export const toAccountId = (steamId) => (BigInt(steamId) - STEAM64_BASE).toString();

// a match counts as a win when the player's team is the winning team
export const isWin = (m) => m.match_result === m.player_team;

// ---------- hero names (loaded once, shared by every component) ----------
let heroNamesPromise = null;

export function fetchHeroNames() {
  heroNamesPromise ??= fetch(`${API}/v1/assets/heroes`)
    .then((res) => (res.ok ? res.json() : []))
    .then((list) =>
      Object.fromEntries((Array.isArray(list) ? list : []).map((h) => [h.id, h.name]))
    )
    .catch(() => ({})); // if this fails, heroes show as "Hero 12" instead of names
  return heroNamesPromise;
}

// ---------- match history (cached for 5 minutes per player) ----------
const historyCache = new Map(); // steamId -> { time, matches }
const CACHE_MS = 5 * 60 * 1000;

export async function fetchMatchHistory(steamId) {
  const cached = historyCache.get(steamId);
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.matches;

  const res = await fetch(`${API}/v1/players/${toAccountId(steamId)}/match-history`);
  if (res.status === 429) throw new Error("Deadlock stats are busy right now. Try again in a minute.");
  if (!res.ok) throw new Error("Couldn't load Deadlock matches.");

  const data = await res.json();
  const seen = new Set();
  const matches = (Array.isArray(data) ? data : [])
    .filter((m) => m.match_id && m.hero_id != null && !seen.has(m.match_id) && seen.add(m.match_id))
    .sort((a, b) => (b.start_time ?? 0) - (a.start_time ?? 0)); // newest first

  historyCache.set(steamId, { time: Date.now(), matches });
  return matches;
}

// ---------- summary of the most recent matches ----------
export function summarize(matches, count = 20) {
  const recent = matches.slice(0, count);
  const played = recent.length;
  const wins = recent.filter(isWin).length;
  const avg = (key) =>
    played ? (recent.reduce((t, m) => t + (m[key] ?? 0), 0) / played).toFixed(1) : "0";

  const heroCounts = {};
  for (const m of recent) heroCounts[m.hero_id] = (heroCounts[m.hero_id] ?? 0) + 1;
  const topHero = Object.entries(heroCounts).sort((a, b) => b[1] - a[1])[0];

  return {
    played,
    wins,
    losses: played - wins,
    winRate: played ? Math.round((wins / played) * 100) : 0,
    kills: avg("player_kills"),
    deaths: avg("player_deaths"),
    assists: avg("player_assists"),
    topHeroId: topHero?.[0] ?? null,
    topHeroGames: topHero?.[1] ?? 0,
  };
}

// ---------- rank ----------
export async function fetchRank(steamId) {
  try {
    const res = await fetch(`${API}/v1/players/${toAccountId(steamId)}/rank`);
    if (!res.ok) return null;
    const data = await res.json();
    if (import.meta.env.DEV) console.debug("Deadlock rank response:", data);

    const entry = Array.isArray(data) ? data[0] : data;
    const badge = Number(entry?.rank ?? entry?.badge ?? entry?.badge_level ?? entry?.ranked_badge_level);
    if (!Number.isFinite(badge) || badge <= 0) return null;

    return { badge, label: entry?.ranked_display_badge ?? entry?.display_badge ?? null };
  } catch {
    return null;
  }
}

// ---------- rank comparison ----------
const metricsCache = new Map();

function fetchMetrics(params) {
  const qs = new URLSearchParams(params).toString();
  if (!metricsCache.has(qs)) {
    const request = fetch(`${API}/v1/analytics/player-stats/metrics?${qs}`).then((res) => {
      if (!res.ok) throw new Error("Couldn't load rank comparison.");
      return res.json();
    });
    request.catch(() => metricsCache.delete(qs)); // don't cache failures
    metricsCache.set(qs, request);
  }
  return metricsCache.get(qs);
}

export const COMPARE_DAYS = 30;

// the player's averages and their rank group's distribution, using the same filters for both
export async function fetchComparison(steamId, badge) {
  const since = Math.floor(Date.now() / 1000) - COMPARE_DAYS * 86400;
  const filters = {
    game_mode: "normal",
    min_unix_timestamp: String(Math.floor(since / 3600) * 3600), // rounded to the hour so caching works
  };

  if (badge) {
    const tier = Math.floor(badge / 10); // e.g. badge 103 -> tier 10, subtiers 101–106
    filters.min_average_badge = String(tier * 10 + 1);
    filters.max_average_badge = String(tier * 10 + 6);
  }

  const [group, player] = await Promise.all([
    fetchMetrics(filters),
    fetchMetrics({ ...filters, account_ids: toAccountId(steamId) }),
  ]);

  if (import.meta.env.DEV) console.debug("player-stats/metrics stat names:", Object.keys(group ?? {}));
  return { group, player };
}

// stats to compare; only ones the API actually returns are shown
export const COMPARE_METRICS = [
  { key: "net_worth_per_min", label: "Souls / min", tip: "Farm lane creeps and jungle camps between fights. Lane creeps are the biggest source of souls." },
  { key: "player_damage_per_min", label: "Hero damage / min", tip: "Look for more safe trades and fights where you can deal damage." },
  { key: "last_hits", label: "Last hits", tip: "Practice last-hitting in lane so you secure more creeps." },
  { key: "kills", label: "Kills" },
  { key: "deaths", label: "Deaths", lowerIsBetter: true, tip: "Watch the minimap and back off when enemies go missing." },
  { key: "assists", label: "Assists", tip: "Rotate to help teammates in fights more often." },
  { key: "accuracy", label: "Accuracy", percent: true, tip: "Spend some time on aim practice in the sandbox." },
];

// estimate where a value falls in a distribution like { percentile5: .., percentile50: .., percentile95: .. }
export function percentileOf(value, dist) {
  if (typeof value !== "number") return null;

  const points = Object.entries(dist ?? {})
    .map(([key, v]) => [Number(key.match(/^percentile(\d+)$/)?.[1]), v])
    .filter(([p, v]) => Number.isFinite(p) && typeof v === "number")
    .sort((a, b) => a[0] - b[0]);
  if (points.length < 2) return null;

  if (value <= points[0][1]) return points[0][0];
  if (value >= points.at(-1)[1]) return points.at(-1)[0];

  for (let i = 1; i < points.length; i++) {
    const [p0, v0] = points[i - 1];
    const [p1, v1] = points[i];
    if (value <= v1) return v1 === v0 ? p1 : p0 + ((p1 - p0) * (value - v0)) / (v1 - v0);
  }
  return null;
}