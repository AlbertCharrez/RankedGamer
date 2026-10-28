export const players = [
  { id: 1, name: "ShadowFox#NA1", game: "cs2", rank: "Global Elite", kd: 1.42 },
  { id: 2, name: "IronClad#EUW", game: "rivals", rank: "Grandmaster", kd: 2.1 },
  { id: 3, name: "Moonpetal#US", game: "wow", rank: "Gladiator", kd: 3.05 },
  { id: 4, name: "FoxTrot#NA2", game: "cs2", rank: "Supreme", kd: 1.18 },
  { id: 5, name: "Nightshade#OCE", game: "rivals", rank: "Diamond", kd: 1.67 },
  { id: 6, name: "Stormrage#EU", game: "wow", rank: "Duelist", kd: 2.44 },
];

// Simulates an API call: waits, then returns matches
export function fakeSearch(query, delay = 800) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.toLowerCase();
      resolve(players.filter((p) => p.name.toLowerCase().includes(q)));
    }, delay);
  });
}