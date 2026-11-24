# GEORGE CITY engineering
Preserve existing world content, missions and version-1 progression. Make small,
tested changes; do not replace Babylon or rebuild the city without agreement.
Keep simulation independent of DOM, Babylon and persistence. Use strict TypeScript.
Keep numeric mission IDs stable until a tested migration introduces named IDs.
Validate persisted data and protect unsupported future versions.
Keep input normalized and clear transient controls on blur and cancellation.
Use bounded fixed simulation steps; pause hidden sessions and dialogs.
Target 44px touch controls and test simultaneous movement/look on real devices.
Run npm ci, npm test, npm run build and the production smoke script.
Record browser substitutions; seeded mission checks do not prove route playability.
Retain licenses and profile hardware before claiming performance gains.
Use PR validation. Never merge or deploy without approval. Main pushes deploy Pages.
Future activities need explicit entry, cancellation, reward and return semantics.
Future districts need resource disposal and shared collision definitions.
Servers must authorize shared rewards; AI dialogue needs authored fallbacks.
Do not place service credentials in browser code.

## Task B baseline

Build on the merged V0.2 south gate in Moontide (月潮里), Nova Harbour (新港).
Use GEORGE CITY 2099 and “The Future Is Yours.” for player-facing branding.
Use the playable south gate as the reference for sightlines, amber shop lighting,
cyan wayfinding, bilingual signs and planted galleries. Keep interaction prompts
and the compact HUD legible in portrait and landscape.

Keep City ID local and derive its achievements, discoveries and wardrobe from
the existing save. Route map, journal, activity and settings views through City OS.
Keep static architecture batched and share geometry for repeated moving parts.
See [architecture](docs/ARCHITECTURE.md) and the [art guide](docs/NEW-HORIZON.md).
The district atlas records the direction for future neighbourhoods.

## City in Motion

Register a lazy loader in `src/activities/portal.ts` and supply an accessible
street entrance. Start each round with `beginAttempt()`, report one final score
and release clocks and input handlers on dispose. Preserve the city snapshot
on entry, abort, completion and exit. Pause rounds when the browser loses focus.
Keep activity scores and event rewards local. Keep City Scan IDs and activity
IDs stable because City ID reads them from saves.

Run `node --import tsx scripts/city-in-motion.cjs` against the settled production
build after changing portal flow, scans, event stages or activities. Review
portrait and landscape captures whenever controls or layout change.
