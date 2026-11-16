const API = "/api/deadlock"; // forwarded to api.deadlock-api.com by Vite (dev) or the Worker (live)
const STEAM64_BASE = 76561197960265728n; // SteamID64 -> Deadlock account_id offset

// SteamID64 (string) -> Deadlock account id (string)
export const toAccountId = (steamId) => (BigInt(steamId) - STEAM64_BASE).toString();

// a match counts as a win when the player's team is the winning team
export const isWin = (m) => m.match_result === m.player_team;

// ---------- heroes (names + images, loaded once) ----------
const BANNER_KEYS = ["background_image_webp", "background_image", "selection_image_webp", "selection_image", "icon_hero_card_webp", "icon_hero_card"];
const ICON_KEYS = ["icon_image_small_webp", "icon_image_small", "minimap_image_webp", "minimap_image", "icon_hero_card_webp", "icon_hero_card"];
const pickImage = (images, keys) => keys.map((k) => images?.[k]).find(Boolean) ?? null;

let heroesPromise = null;

export function fetchHeroes() {
  heroesPromise ??= fetch(`${API}/v1/assets/heroes`)
    .then((res) => (res.ok ? res.json() : []))
    .then((list) => {
      const heroes = Array.isArray(list) ? list : [];
      if (import.meta.env.DEV && heroes[0]) {
        console.debug("Deadlock hero image fields:", Object.keys(heroes[0].images ?? {}));
      }
      return Object.fromEntries(
        heroes.map((h) => [
          h.id,
          { name: h.name, banner: pickImage(h.images, BANNER_KEYS), icon: pickImage(h.images, ICON_KEYS) },
        ])
      );
    })
    .catch(() => ({}));
  return heroesPromise;
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

export const COMPARE_DAYS = 14;

// the player's averages and their rank group's distribution, using the same filters for both
export async function fetchComparison(steamId, badge) {
  // without a rank, the "everyone" comparison is too heavy for the API and times out
  if (!badge) return { group: null, player: null, noRank: true };

  const since = Math.floor(Date.now() / 1000) - COMPARE_DAYS * 86400;
  const filters = {
    game_mode: "normal",
    min_unix_timestamp: String(Math.floor(since / 3600) * 3600),
  };

  const tier = Math.floor(badge / 10);
  filters.min_average_badge = String(tier * 10 + 1);
  filters.max_average_badge = String(tier * 10 + 6);

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

// ---------- teams ----------
// Assumed mapping: team 0 = The Hidden King (amber), team 1 = The Archmother (sapphire)
export const TEAMS = {
  0: { name: "The Hidden King", color: "#e0a33a" },
  1: { name: "The Archmother", color: "#4f8ef7" },
};

// the API may send the team as 0/1 or as "Team0"/"Team1"
export const teamIndex = (team) =>
  typeof team === "number" ? team : Number(String(team ?? "").replace(/\D/g, ""));

// ---------- single match details (cached; finished matches never change) ----------
const metadataCache = new Map();

export function fetchMatchMetadata(matchId) {
  if (!metadataCache.has(matchId)) {
    const request = fetch(`${API}/v1/matches/${matchId}/metadata`).then(async (res) => {
      if (!res.ok) throw new Error("Couldn't load this match's details.");
      const data = await res.json();
      if (import.meta.env.DEV) console.debug("Deadlock match metadata:", data);
      return data.match_info ?? data;
    });
    request.catch(() => metadataCache.delete(matchId));
    metadataCache.set(matchId, request);
  }
  return metadataCache.get(matchId);
}

// ---------- Steam names for a list of account ids ----------
export async function fetchSteamNames(accountIds) {
  const ids = [...new Set(accountIds.filter(Boolean))];
  if (ids.length === 0) return {};
  try {
    const res = await fetch(`${API}/v1/players/steam?account_ids=${ids.join(",")}`);
    if (!res.ok) return {};
    const list = await res.json();
    return Object.fromEntries((Array.isArray(list) ? list : []).map((p) => [p.account_id, p.personaname]));
  } catch {
    return {};
  }
}