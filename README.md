# GEORGE CITY 2099

**V0.2 — NEW HORIZON · CITY IN MOTION** · The Future Is Yours.

Explore. Play. Connect. Live. Start in **Moontide — 月潮里**, the south-gate market of **Nova Harbour — 新港**. A tramline-era shopping street has grown around a ferry interchange. Its bakers, couriers and projectionists now share the waterfront with delivery robots.

[World and asset guide](docs/NEW-HORIZON.md) · [Gameplay comparisons](docs/NEW-HORIZON.md#gameplay-comparison)

[Play on GitHub Pages](https://geolhc.github.io/george-city/)

Walk forward through the illuminated archway. Press **E** at a floating ring to accept a neighbourhood commission. The gold diamond and north-up radar point to the next objective. Open City OS → 街坊委託 to mark another starting point, see personal records or leave a commission. The city opens directly into play.

| Action | Desktop | Touch |
| --- | --- | --- |
| Walk / steer | WASD or arrows | Left thumbstick |
| Look | Drag scene | Drag scene with right thumb |
| Run | Hold Shift | Toggle 跑 |
| Interact / enter / exit | E or Space | Context button |
| City OS | M or City OS | City OS |
| City Scan | Q or ⌖ | ⌖ in the top bar |

In a car, forward accelerates, back reverses, and left/right steer. Lift off to slow down. The Midnight Circuit marker supplies a car for the closed race.

## City in Motion

- Follow the east pavement south to **PLAYVERSE**. Enter at the cyan doorway and start **NOVA SYNC**, a 48-second rhythm game. Use **D F J K** or tap the four pads as their notes reach the white line. Score at least 1,600 to collect the resonance chip.
- Walk to the amber doorway opposite PLAYVERSE to enter **Moontide Café**. Read each Cantonese ticket, choose a food and a drink and tap 出餐. Serve five tickets in a shift. A score of 300 earns the night-shift token.
- Use **City Scan** on foot to find eight stories and stamps. City OS → 城市掃描 gives you neighbourhood clues. City ID records discoveries, City XP, collectibles and personal bests.
- Find **City Pulse** work at the west dispatch station and the north side of Moonwheel Plaza. Blue waypoints lead to the parcel pickup and delivery or the next relay. Both jobs can be replayed.
- Tap **NOVA** to fold away its advice. Tap 提示 for a commission hint, or change guidance and reduced motion in Settings.

## District guide

| Commission | Start | Objective | First clear |
| --- | --- | --- | --- |
| Neon postcards | South gate | Frame three landmark views | 80 credits + coral |
| Lost in transit | West dispatch stop | Locate Ah Luk and escort him back | 100 + violet |
| Light the plaza | Moonwheel | Rotate the three relays into a continuous eastbound circuit | 120 + amber |
| Midnight circuit | South arcade | Drive the marked gates in order and finish a lap | 150 + mint + GT |
| Lantern walk | North gate | Find four festival lights | 90 + silver |

Replay a commission to improve its time. Visit the southwest tailor to equip earned outfits or buy a 60-second iced-tea sprint. The GT is parked by the northeast garage. Credits exist solely inside this save. Talk to locals before and after commissions for different responses.

## Run locally

Requires Node 22+. Run `npm ci`, then `npm run dev`. Run `npm test` for simulation and progression tests. Run `npm run build` for type checks and the static production bundle in `dist/`. Serve that directory over HTTP or use `npm run preview`.

Every main-branch push runs tests, builds the locked dependencies and publishes dist with GitHub Actions. The repository Pages source is GitHub Actions. Vite emits relative asset URLs for project hosting.

## Implementation

PlayCanvas Engine was considered for its entity/component model and editor-oriented art workflow. Babylon.js was selected for this code-authored district. Thin instances batch architecture, custom dynamic textures provide bilingual signs and repeatable facades, and the camera consumes the same collision map as the simulation. No external model pack or hosted editor project is required.

- **world.ts** defines immutable district geometry, mission sites, input commands, collision, driving and camera clearance.
- **game.ts** owns serializable player/world state, mission transitions, deterministic NPC schedules and the dialogue provider. Local conversations remember encounter counts. Simulation runs without DOM or GPU.
- **view.ts** builds original procedural geometry, lighting, materials, signs, characters, cars and the dedicated circuit.
- **main.ts** binds touch and keyboard commands, rendering, HUD, interactions and versioned localStorage. Saves occur after interactions, periodically during movement and on page exit. Keep the same browser and origin to resume.
- **activities/** hosts lazy-loaded rounds, foreground clocks and the portal that suspends and resumes the street.
- **exploration.ts**, **pulse.ts** and **progression.ts** implement City Scan, district jobs and local City ID records.
- **audio.ts** synthesizes an original score and effects using Web Audio. Cantonese announcements use an available Cantonese device voice and display captions. Sound starts on request.
- **Future private rooms** can route input commands through a room authority, replicate snapshots by player ID and validate mission events server-side. A future dialogue provider can read per-player memories and return responses. Room membership, invitation codes, networking, remote avatars and external AI are future work.

All district art, characters, sign designs and musical sequences are original procedural work. Babylon.js is Apache-2.0. Vite, TypeScript and tsx retain their upstream licenses. This prototype requires WebGL and a modern browser. Rendering resolution reduces under sustained frame pressure.

## Save compatibility and release checks
See [architecture](docs/ARCHITECTURE.md), [prioritized backlog](docs/ROADMAP.md)
and [changelog](CHANGELOG.md). Existing version-1 saves remain compatible.
Valid previous saves are retained as a local backup. Back up browser data before
clearing site storage; this is not cloud sync.

Production regression: build, serve dist on port 4173, then run
`node scripts/smoke.cjs`. Install Chrome using `npx playwright install chrome`,
or set `CITY_BROWSER=/usr/bin/chromium`. CITY_URL overrides the served URL.
Run `node --import tsx scripts/city-in-motion.cjs` for the arcade, scan, City Pulse
and touch café checks. See [validation and gameplay captures](docs/VALIDATION.md#city-in-motion).
The browser checks walk the PLAYVERSE approach and use position fixtures for
the other activity and mission stops.
PR checks do not deploy. Main pushes still deploy through pages.yml; merge only
after approval and passing checks. Roll back with a reviewed revert of the release,
then verify Pages assets and save compatibility. Never reset player saves to roll back.
