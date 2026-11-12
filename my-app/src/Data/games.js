//Order of the list below is the way in which the games will be displayed in the UI. 

export const games = [
  { id: "deadlock",     name: "Deadlock",      color: "#ff4655", image: "/deadlock.png",     account: "steam"  },
  { id: "marvelrivals", name: "Marvel Rivals", color: "#da292a", image: "/rivals.png", account: "rivals" },
  { id: "cs2",          name: "CS2",           color: "#9d4dbb", image: "/cs2.png",          account: "steam"  },
];

export const getGame = (id) => games.find((g) => g.id === id);