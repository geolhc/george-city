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
a backup and protects future-version saves. Version 1 and its key remain unchanged.
Invalid saves recover a backup where available; otherwise a fresh session starts.
Storage failures leave the current in-memory session playable.

Race movement explicitly uses GT performance without changing the selected street
vehicle. Input axes clamp before driving physics. Existing collision stays intact.

Extension strategy: retain DialogueProvider and InputCommand; extract mission
definitions with stable IDs when adding content. Add activity enter/update/abort/
finish/dispose around existing activities before another mini-game. Add district
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
