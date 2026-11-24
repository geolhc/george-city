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

Known limits: two-dimensional building collision, decorative traffic, repeated NPC
identities, no navigation mesh, numeric mission coupling, no cloud saves. Fixed-step
simulation alone is not a claim of deterministic cross-device multiplayer.
