import { games } from "../Data/games";

export default function GamePicker({ picked, setPicked }) {
  const toggle = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  return (
    <div className="game-checks">
      {games.map((g) => (
        <label key={g.id} className={picked.includes(g.id) ? "game-check checked" : "game-check"}>
          <input type="checkbox" checked={picked.includes(g.id)} onChange={() => toggle(g.id)} />
          {g.name}
        </label>
      ))}
    </div>
  );
}