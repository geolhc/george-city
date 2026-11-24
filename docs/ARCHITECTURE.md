# Architecture
Babylon.js renders the original procedural district; no engine or content rewrite.
world.ts owns geometry, collision and movement. game.ts owns serializable state,
mission transitions and the existing DialogueProvider extension point.
view.ts owns procedural rendering. main.ts composes input, UI and rendering.
runtime.ts introduces a DOM-free fixed-step clock (60 Hz, maximum 250 ms catch-up).
At ordinary low frame rates elapsed simulation time is preserved; prolonged stalls
discard excess time to avoid a catch-up spiral. Dialogs/background pause simulation.
Camera smoothing remains render-driven. No interpolation or new physics engine.
storage.ts validates saves through game.decode, rotates valid previous saves into
a backup and protects future-version saves. Version 1 keeps its original key and supports an optional City in Motion extension.
Invalid saves recover a backup where available; otherwise a fresh session starts.
Storage failures leave the current in-memory session playable.

Race movement explicitly uses GT performance without changing the selected street
vehicle. Input axes clamp before driving physics. Existing collision stays intact.

Extension strategy: retain DialogueProvider and InputCommand; extract mission
definitions with stable IDs when adding content. Add district
load/unload and spawn contracts when introducing a second district. Keep shared
progression in State, not renderer objects. Do not add empty networking/AI layers.
Private rooms eventually require an authoritative backend; Pages remains the client.

Known limits: two-dimensional building collision, decorative traffic, four authored residents,
no navigation mesh, numeric mission coupling, no cloud saves. Fixed-step
simulation alone is not a claim of deterministic cross-device multiplayer.


## Task B integration points inherited from V0.2

| Change area | Existing owner and contract |
| --- | --- |
| Street layout and camera | `world.ts` supplies building footprints to movement and camera clearance. Preserve the south-gate spawn, mission coordinates and walking-camera view down the street. |
| Rendering | `view.ts` builds the Babylon scene. Static details use thin-instance batches keyed by material and shape. Moving rigid parts share mesh sources. The player's recolourable clothing keeps independent materials. |
| Controls and menus | `main.ts` combines keyboard and captured pointer input. The context button resolves nearby actions. City OS opens map, journal, City ID and settings in the same modal. Opening it clears transient input and pauses simulation. |
| Identity and progression | `game.ts` owns the serializable state. City ID reads the fictional callsign Tidewalker from UI code, landmark IDs from discoveries and achievements and outfits from mission records. Existing first-clear rewards and replay records remain authoritative locally. |
| Persistence | `storage.ts` owns the `george-city.v1` key, backup and guarded writes. The optional reduced-motion override uses `george-city.motion` separately and defaults to the system preference. |
| Delivery | Vite emits project-relative URLs for the static Pages site. PR checks build and exercise the client. Merging to main triggers publication. |

Use the [district and asset guide](NEW-HORIZON.md) for visual conventions. The
[Task A gate](VALIDATION.md#v02-task-a-final-gate) records the tested baseline
for reviewing later changes.


## City in Motion

### Activity lifecycle

The street offers context actions at PLAYVERSE and Moontide Café. The portal
clears input, saves the street state, stops Babylon's render callback and
suspends city music before loading the selected module with a dynamic import.
The activity mounts in a dedicated modal scene. The same Babylon scene,
camera, player, cars and commission resume on return. Exiting during a load
invalidates the pending mount. No time in the activity advances the street clock.

A module implements `mountActivity(services)` and returns `pause()` and
`dispose()`. It receives its own DOM mount, reduced-motion preference,
previous best, run count, tone callback and `beginAttempt()`. Start and
restart each request a new score reporter. The reporter accepts one nonnegative
integer score for the current attempt. Restart or exit invalidates earlier
reporters. The portal owns the reward commit and save. The scene handles its
own scoring, input and feedback.

Both activities pause on browser blur or a hidden document and offer an
explicit resume button. Exit and Escape abandon an unfinished round. Finished
records are saved immediately. Reloading returns to the same street location,
while an unfinished arcade or café round is ephemeral. New bundled activities
can use the same contract without editing the city simulation.

### City progression and saves

`george-city.v1` still uses version 1. The decoder supplies an empty City in
Motion extension when the old save has no `city` member. The next normal write
persists it, and the existing backup and future-version safeguards apply.
`city.stamps` contains stable discovery IDs. `city.records` stores each stable
challenge ID's completion count and best score. `city.pulse` records the active
street event and its stage. Commission IDs, currencies, vehicles and outfits
retain their original fields.

City ID derives 15 XP per stamp and fixed XP and collectibles at first
qualification. Replays update counts and can improve best scores. The
threshold-derived rewards need no separate claim or balance. City Pulse runs
beside a commission and uses the same context interaction and radar. Its
stages survive reload and can be cancelled through City OS.

City Scan checks distance and intervening building footprints, records nearby
signals once and temporarily highlights them on the Babylon scene. The NOVA
provider reads authored contexts and game state. It has no network
dependency. Resident routes have timed stops and interpolate along accessible
sidewalks. The scene refreshes their positions at roughly 10 Hz.

The updated DistrictHK WOFF2 uses the same Noto Sans CJK HK face with the
existing characters and the new Cantonese text. Its upstream license is in
`public/FONT-LICENSE.txt`.
