const loadAccounts = () => {
  try { return JSON.parse(localStorage.getItem("rg-accounts")) ?? {}; } catch { return {}; }
};

// Search every registered account by username, regardless of games
export async function searchAllPlayers(query) {
  const q = query.trim().toLowerCase();

  return Object.values(loadAccounts())
    .filter((acc) => acc.name.toLowerCase().includes(q))
    .map((acc) => ({
      name: acc.name,
      registered: true,
      // turn ["deadlock", "cs2"] into { deadlock: {}, cs2: {} } for the result cards
      games: Object.fromEntries((acc.games ?? []).map((id) => [id, {}])),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}