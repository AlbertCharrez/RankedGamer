import { useEffect, useState } from "react";
import { fetchMatchMetadata, fetchSteamNames, toAccountId, TEAMS, teamIndex, isWin } from "../Data/deadlock";

const clock = (s = 0) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function MatchSpotlight({ steamId, match, heroes }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        const info = await fetchMatchMetadata(match.match_id);
        const players = info.players ?? [];
        const me = players.find((p) => String(p.account_id) === toAccountId(steamId));
        if (!me) throw new Error("This player wasn't found in the match details.");

        const deaths = [...(me.death_details ?? [])].sort((a, b) => (a.game_time_s ?? 0) - (b.game_time_s ?? 0));
        const killers = deaths.map((d) => players.find((p) => p.player_slot === d.killer_player_slot)).filter(Boolean);
        const names = await fetchSteamNames(killers.map((k) => k.account_id));

        if (!cancelled) setState({ status: "ready", info, players, me, deaths, names });
      } catch (err) {
        if (!cancelled) setState({ status: "error", message: err.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [steamId, match.match_id]);

  const hero = heroes[match.hero_id];
  const heroName = hero?.name ?? `Hero ${match.hero_id}`;
  const won = isWin(match);

  if (state.status === "loading") {
    return <div className="spotlight"><p className="muted spotlight-loading">Loading match details...</p></div>;
  }

  if (state.status === "error") {
    return <div className="spotlight"><p className="form-error spotlight-loading">{state.message}</p></div>;
  }

  const { info, players, me, deaths, names } = state;
  const team = TEAMS[teamIndex(me.team)] ?? { name: "Unknown team", color: "var(--text-muted)" };
  const duration = info.duration_s ?? match.match_duration_s ?? 0;
  const souls = me.net_worth ?? match.net_worth;

  const killerFor = (death) => players.find((p) => p.player_slot === death.killer_player_slot);
  const killerLabel = (killer) => {
    if (!killer) return "Troopers / objectives";
    const name = names[killer.account_id] ?? "Unknown player";
    const kHero = heroes[killer.hero_id]?.name ?? `Hero ${killer.hero_id}`;
    return `${name} (${kHero})`;
  };

  // who killed them most
  const killCounts = {};
  for (const d of deaths) {
    const k = killerFor(d);
    if (k) killCounts[k.player_slot] = (killCounts[k.player_slot] ?? 0) + 1;
  }
  const topSlot = Object.entries(killCounts).sort((a, b) => b[1] - a[1])[0];
  const nemesis = topSlot ? { killer: players.find((p) => String(p.player_slot) === topSlot[0]), count: topSlot[1] } : null;
  const deathsPer10 = duration ? ((deaths.length / duration) * 600).toFixed(1) : "0";

  return (
    <div className="spotlight">
      {/* banner */}
      <div
        className="spotlight-banner"
        style={{
          "--team": team.color,
          backgroundImage: hero?.banner
            ? `linear-gradient(90deg, rgba(15,17,23,0.95) 30%, rgba(15,17,23,0.4)), url(${hero.banner})`
            : undefined,
        }}
      >
        {hero?.icon && <img className="spotlight-icon" src={hero.icon} alt="" />}
        <div className="spotlight-info">
          <span className="spotlight-team">{team.name}</span>
          <h3>{heroName}</h3>
          <span className={won ? "spotlight-result win" : "spotlight-result loss"}>
            {won ? "Victory" : "Defeat"} · {clock(duration)}
          </span>
        </div>
        <div className="spotlight-numbers">
          <div>
            <strong>{souls != null ? Math.round(souls).toLocaleString() : "—"}</strong>
            <span title="Net worth: value of items held plus unspent souls">Souls</span>
          </div>
          <div>
            <strong>{me.kills ?? match.player_kills ?? 0} / {me.deaths ?? match.player_deaths ?? 0} / {me.assists ?? match.player_assists ?? 0}</strong>
            <span>K / D / A</span>
          </div>
        </div>
      </div>

      {/* death timeline */}
      <div className="spotlight-body">
        <p className="stats-caption">
          Deaths · {deaths.length} total · {deathsPer10} per 10 min
          {nemesis && ` · died most to ${killerLabel(nemesis.killer)} (${nemesis.count}×)`}
        </p>

        {deaths.length === 0 ? (
          <p className="muted">No deaths this match. Clean game!</p>
        ) : (
          <>
            <div className="death-timeline">
              {deaths.map((d, i) => (
                <span
                  key={i}
                  className="death-marker"
                  style={{ left: `${duration ? Math.min(100, ((d.game_time_s ?? 0) / duration) * 100) : 0}%` }}
                  title={`${clock(d.game_time_s)} · killed by ${killerLabel(killerFor(d))}`}
                />
              ))}
              <span className="timeline-label start">0:00</span>
              <span className="timeline-label end">{clock(duration)}</span>
            </div>

            <ul className="death-list">
              {deaths.map((d, i) => (
                <li key={i}>
                  <span className="death-time">{clock(d.game_time_s)}</span>
                  <span>Killed by {killerLabel(killerFor(d))}</span>
                  {d.death_duration_s != null && <span className="muted">dead {clock(d.death_duration_s)}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}