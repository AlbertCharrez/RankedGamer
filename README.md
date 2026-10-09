# Gamer Ranked
This product applies to all gamers who wish to be ranked against anyone on their favorite games including but not limited to Marvel Rivals, CS2, and World of Warcraft.

## Features
1. Player vs. All Rankings
2. Player vs. Friend Rankings
3. Player Stats vs. Others Stats
4. Player Peak statistics
5. Rising Star stats that display players who climb ranks the fastest (Smurf Detection)
6. Distinct Character Rankings vs. Others for individual characters
7. Account Linkage
8. And More!

## Ranking System
Rankings will be done through unique style of weights and other various factors to decide the ranking which will later be displayed below
1. Player vs. All / Friend Ranking
2. Player Stats vs. Other Stats
3. Rising Star Stats
4. Distinct Character Ranking vs. Others for individual characters

## Data Sources
We use a blend of api's for our data which can be found below,

`Steam: Steam Web API Key`

`Marvel Rivals: MarvelRivalsAPI.com`

`WoW: Battle.net `

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | [Next.js](https://nextjs.org/) (React, TypeScript) | Server-rendered leaderboards and player profiles |
| Styling | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) | UI components |
| Charts | [Recharts](https://recharts.org/) | Rating history graphs |
| Backend API | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12) | REST API for rankings, players, and matches |
| Rating engine | [openskill](https://github.com/vivekjoshy/openskill.py) | Skill ratings for 1v1, team, and free-for-all matches |
| Database | [PostgreSQL 16](https://www.postgresql.org/) | Players, matches, and rating history |
| Cache / leaderboards | [Redis](https://redis.io/) | Sorted sets for fast rank lookups |
| Background jobs | [Celery](https://docs.celeryq.dev/) | Scheduled match ingestion from game APIs |
| Auth | [Auth.js](https://authjs.dev/) | Sign in with Discord, Steam, or Riot |
| Hosting | Vercel (frontend), Railway (API, workers, DB) | Deployment |
| CI/CD | GitHub Actions | Tests, linting, and deploys |
| Monitoring | [Sentry](https://sentry.io/) | Error tracking |

## Architecture

```
 Game APIs (Rivals, Steam, WOW, ...)
            │
            ▼
   Celery workers ──► Rating engine (openskill)
            │                  │
            ▼                  ▼
       PostgreSQL ◄──────► Redis (leaderboards)
            │
            ▼
      FastAPI backend
            │
            ▼
     Next.js frontend
```

1. **Ingestion:** Celery workers poll each supported game's API on a schedule. Each game has an adapter in `backend/ingest/adapters/` that converts its data into a common match format.
2. **Rating:** New matches go to the rating engine, which updates player ratings and writes a record to the rating history table.
3. **Leaderboards:** Current ratings are mirrored into Redis sorted sets, so top-N and rank lookups stay fast.
4. **Cross-game ranking:** Ratings are normalized to a percentile within each game before they're combined into the overall leaderboard. See [docs/ranking.md](docs/ranking.md).
5. **Serving:** The FastAPI backend serves data to the Next.js frontend, which renders pages server-side for speed and SEO.

## Project Structure
## Privacy and Data
## License
## Acknowledgments and Other Information
