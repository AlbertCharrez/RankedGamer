// All Deadlock data comes from the community API at deadlock-api.com.
const API = "https://api.deadlock-api.com";
const STEAM64_BASE = 76561197960265728n; // SteamID64 -> Deadlock account_id offset
const CACHE_MS = 5 * 60 * 1000; // how long player data is reused (5 minutes)
export const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // time between manual refreshes

// SteamID64 (string) -> Deadlock account id (string)
export const toAccountId = (steamId) => (BigInt(steamId) - STEAM64_BASE).toString();

// a match counts as a win when the player's team is the winning team
export const isWin = (m) => m.match_result === m.player_team;

// ============================================================
// Saved data (localStorage), so a page reload doesn't refetch everything
// ============================================================
const STORE_PREFIX = "rg-deadlock-";

function readStore(key, maxAgeMs = Infinity) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return Date.now() - saved.time < maxAgeMs ? saved : null; // { time, value }
  } catch {
    return null;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify({ time: Date.now(), value }));
  } catch {
    // storage full or blocked; the in-memory copy still works
  }
}

function removeStore(key) {
  try {
    localStorage.removeItem(STORE_PREFIX + key);
  } catch {
    // ignore
  }
}

// ============================================================
// Match types
// match_mode: 1 = unranked, 4 = ranked.  game_mode: 1 = normal, 4 = Street Brawl
// ============================================================
const RANKED_MATCH_MODE = 4;
const STREET_BRAWL_GAME_MODE = 4;

export const MATCH_TYPES = [
  { id: "all", label: "All" },
  { id: "ranked", label: "Competitive" },
  { id: "normal", label: "Regular" },
  { id: "brawl", label: "Street Brawl" },
];

export function matchType(m) {
  const gameMode = String(m.game_mode ?? "").toLowerCase();
  if (m.game_mode === STREET_BRAWL_GAME_MODE || gameMode.includes("brawl")) return "brawl";

  const matchMode = String(m.match_mode ?? "").toLowerCase();
  if (m.match_mode === RANKED_MATCH_MODE || matchMode === "ranked") return "ranked";
  return "normal";
}

// ============================================================
// Teams
// Assumed: team 0 = The Hidden King (amber), team 1 = The Archmother (sapphire)
// ============================================================
export const TEAMS = {
  0: { name: "The Hidden King", color: "#e0a33a" },
  1: { name: "The Archmother", color: "#4f8ef7" },
};

// the API may send the team as 0/1 or as "Team0"/"Team1"
export const teamIndex = (team) =>
  typeof team === "number" ? team : Number(String(team ?? "").replace(/\D/g, ""));

// ============================================================
// Heroes (names + images, loaded once per page)
// ============================================================
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
    .catch(() => ({})); // if this fails, heroes show as "Hero 12" instead of names
  return heroesPromise;
}

// ============================================================
// Match history (saved for 5 minutes per player, survives page reloads)
// ============================================================
const historyCache = new Map(); // steamId -> { time, matches }

export async function fetchMatchHistory(steamId) {
  // 1. this page already has it
  const cached = historyCache.get(steamId);
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.matches;

  // 2. saved from an earlier page load
  const saved = readStore(`history-${steamId}`, CACHE_MS);
  if (saved) {
    historyCache.set(steamId, { time: saved.time, matches: saved.value });
    return saved.value;
  }

  // 3. fetch fresh
  const res = await fetch(`${API}/v1/players/${toAccountId(steamId)}/match-history`);
  if (res.status === 429) throw new Error("Deadlock stats are busy right now. Try again in a minute.");
  if (!res.ok) throw new Error("Couldn't load Deadlock matches.");

  const data = await res.json();
  const seen = new Set();
  const matches = (Array.isArray(data) ? data : [])
    .filter((m) => m.match_id && m.hero_id != null && !seen.has(m.match_id) && seen.add(m.match_id))
    .sort((a, b) => (b.start_time ?? 0) - (a.start_time ?? 0)); // newest first

  if (import.meta.env.DEV) {
    console.debug(
      "Deadlock modes in history (game_mode/match_mode):",
      [...new Set(matches.map((m) => `${m.game_mode}/${m.match_mode}`))]
    );
  }

  historyCache.set(steamId, { time: Date.now(), matches });
  writeStore(`history-${steamId}`, matches);
  return matches;
}

// when this player's match history was last actually fetched (or null)
export function lastFetchedAt(steamId) {
  const time = historyCache.get(steamId)?.time ?? readStore(`history-${steamId}`)?.time;
  return time ? new Date(time) : null;
}

// summary of the most recent matches
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

// ============================================================
// Single match details (cached; finished matches never change)
// ============================================================
const metadataCache = new Map();

export function fetchMatchMetadata(matchId) {
  if (!metadataCache.has(matchId)) {
    const request = fetch(`${API}/v1/matches/${matchId}/metadata`).then(async (res) => {
      if (!res.ok) throw new Error("Couldn't load this match's details.");
      const data = await res.json();
      if (import.meta.env.DEV) console.debug("Deadlock match metadata:", data);
      return data.match_info ?? data;
    });
    request.catch(() => metadataCache.delete(matchId)); // don't keep failures
    metadataCache.set(matchId, request);
  }
  return metadataCache.get(matchId);
}

// ============================================================
// Steam names (cached for the page session)
// ============================================================
const namesCache = new Map(); // account_id -> name

export async function fetchSteamNames(accountIds) {
  const wanted = [...new Set(accountIds.filter(Boolean))];
  const missing = wanted.filter((id) => !namesCache.has(id));

  if (missing.length > 0) {
    try {
      const res = await fetch(`${API}/v1/players/steam?account_ids=${missing.join(",")}`);
      if (res.ok) {
        const list = await res.json();
        for (const p of Array.isArray(list) ? list : []) namesCache.set(p.account_id, p.personaname);
      }
    } catch {
      // names are optional; heroes still show
    }
  }

  return Object.fromEntries(wanted.filter((id) => namesCache.has(id)).map((id) => [id, namesCache.get(id)]));
}

// ============================================================
// Rank (saved for 5 minutes per player, survives page reloads)
// ============================================================

// a badge is rank * 10 + subrank (1–6), e.g. 45 = rank 4, subrank 5
const isRealBadge = (b) =>
  Number.isFinite(b) && Math.floor(b / 10) >= 1 && Math.floor(b / 10) <= 11 && b % 10 >= 1 && b % 10 <= 6;

const rankCache = new Map(); // steamId -> { time, rank }

export async function fetchRank(steamId) {
  const cached = rankCache.get(steamId);
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.rank;

  const saved = readStore(`rank-${steamId}`, CACHE_MS);
  if (saved) {
    rankCache.set(steamId, { time: saved.time, rank: saved.value });
    return saved.value;
  }

  let rank = null;
  try {
    const res = await fetch(`${API}/v1/players/${toAccountId(steamId)}/rank`);
    if (res.ok) {
      const data = await res.json();
      if (import.meta.env.DEV) console.debug("Deadlock rank response:", data);

      const entry = Array.isArray(data) ? data[0] : data;
      // the API returns { badge: 45, rank: 4, subrank: 5 }; use badge, or build it from rank + subrank
      const badge = Number(
        entry?.badge ??
          (entry?.rank != null && entry?.subrank != null ? entry.rank * 10 + entry.subrank : NaN)
      );
      if (isRealBadge(badge)) {
        rank = { badge, label: entry?.ranked_display_badge ?? entry?.display_badge ?? null };
      }
    }
  } catch {
    // leave rank as null
  }

  rankCache.set(steamId, { time: Date.now(), rank });
  writeStore(`rank-${steamId}`, rank);
  return rank;
}

// ============================================================
// Rank comparison
// ============================================================
export const COMPARE_DAYS = 3; // comparison group: ranked matches at your tier, last 3 days
export const PLAYER_DAYS = 90; // your side: all your ranked matches, last 90 days

const metricsCache = new Map();

function fetchMetrics(params) {
  const qs = new URLSearchParams(params).toString();
  if (!metricsCache.has(qs)) {
    const request = fetch(`${API}/v1/analytics/player-stats/metrics?${qs}`).then((res) => {
      if (!res.ok) throw new Error("Couldn't load rank comparison.");
      return res.json();
    });
    request.catch(() => metricsCache.delete(qs)); // don't keep failures
    metricsCache.set(qs, request);
  }
  return metricsCache.get(qs);
}

// a timestamp N days ago, rounded to the hour so cached queries match
const hourAgo = (days) => String(Math.floor((Date.now() / 1000 - days * 86400) / 3600) * 3600);

// true if the API returned an actual distribution (not all nulls)
const hasData = (metrics) =>
  Object.values(metrics ?? {}).some((m) => m && m.percentile50 != null);

// your ranked averages vs. ranked players at (or near) the same tier
export async function fetchComparison(steamId, badge) {
  if (!badge) return { noRank: true }; // an all-players query is too heavy and times out

  const tier = Math.min(11, Math.max(1, Math.floor(badge / 10))); // e.g. badge 45 -> tier 4
  const ranked = { game_mode: "normal", match_mode: "Ranked" };

  const groupFor = (minTier, maxTier) =>
    fetchMetrics({
      ...ranked,
      min_unix_timestamp: hourAgo(COMPARE_DAYS),
      min_average_badge: String(minTier * 10 + 1),
      max_average_badge: String(maxTier * 10 + 6),
    }).catch(() => null); // timed out or failed

  const [player, exact] = await Promise.all([
    fetchMetrics({ ...ranked, min_unix_timestamp: hourAgo(PLAYER_DAYS), account_ids: toAccountId(steamId) }),
    groupFor(tier, tier),
  ]);

  let group = exact;
  let widened = false;

  // nobody at exactly this tier recently (or it failed)? try the tiers around it
  if (!hasData(exact)) {
    group = await groupFor(Math.max(1, tier - 1), Math.min(11, tier + 1));
    widened = true;
  }

  if (import.meta.env.DEV) console.debug("Rank comparison:", { badge, tier, widened, groupHasData: hasData(group) });
  return { group, player, widened, busy: !hasData(group) };
}

// the badge to compare against: the player's rank badge if they have a real one,
// otherwise the skill level of their most recent ranked lobby
export async function findComparisonBadge(steamId, history) {
  const rank = await fetchRank(steamId);
  if (rank?.badge) return { badge: rank.badge, label: rank.label, source: "rank" };

  const lastRanked = history.find((m) => matchType(m) === "ranked");
  if (!lastRanked) return null;

  try {
    const info = await fetchMatchMetadata(lastRanked.match_id);
    const team = teamIndex(lastRanked.player_team);
    const badge = Math.round(
      Number(
        info[`average_badge_team${team}`] ??
          info.average_badge ??
          info.average_badge_team0 ??
          info.average_badge_team1
      )
    );
    if (Number.isFinite(badge) && Math.floor(badge / 10) >= 1) {
      return { badge, label: null, source: "lobby" };
    }
  } catch {
    // fall through
  }
  return null;
}

// stats to compare; only the ones the API actually returns are shown
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

// ============================================================
// Manual refresh (with a 5-minute cooldown that survives page reloads)
// ============================================================

// when this player's Refresh button can be used again (ms timestamp; 0 = now)
export function refreshAvailableAt(steamId) {
  const last = readStore(`refreshed-${steamId}`)?.time ?? 0;
  return last + REFRESH_COOLDOWN_MS;
}

// forget everything saved for one player and start the cooldown
// (match details and hero data are kept; they don't change)
export function clearPlayerCache(steamId) {
  historyCache.delete(steamId);
  rankCache.delete(steamId);
  removeStore(`history-${steamId}`);
  removeStore(`rank-${steamId}`);

  const accountParam = `account_ids=${toAccountId(steamId)}`;
  for (const key of metricsCache.keys()) {
    if (key.includes(accountParam)) metricsCache.delete(key);
  }

  writeStore(`refreshed-${steamId}`, true); // start the cooldown
}