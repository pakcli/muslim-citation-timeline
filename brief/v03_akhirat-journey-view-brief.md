# Brief v03 — Akhirat Journey View

Status: DRAFT (awaiting "go")
Builds on: v02 (vanilla JS, static, no server, no build step)

## 1. Goal
Add a 5th header tab, **Akhirat**, that reproduces the reference diagram
(World of Al-Dharr → Heaven) as a clickable map, plus a timeline-scrub mode
for stepping through the stages.

**View only.** No citations, no sourcing, no Arabic in this version.

## 2. Non-goals
- No Qur'an/hadith content per stage (later phase).
- No verification of stage order against sources; order follows the picture.
- No server, no framework, no dependencies.

## 3. Nodes (16, hard-coded from the picture)
| # | Node | Group |
|---|------|-------|
| 1 | World of Al-Dharr | Pre-life |
| 2 | Womb of the Mother | Pre-life |
| 3 | Dunya (📍 You are here) | Life |
| 4 | Grave | Barzakh |
| 5 | Blowing the Horn | Resurrection |
| 6 | Resurrection | Resurrection |
| 7 | Intercession of the Prophet | Land of Resurrection |
| 8 | Judgement | Land of Resurrection |
| 9 | The Books | Land of Resurrection |
| 10 | The Scale | Land of Resurrection |
| 11 | The Fountain | Land of Resurrection |
| 12 | Test for the believers | Land of Resurrection |
| 13 | Hell | Final |
| 14 | Sirat (bridge over Hell) | Final |
| 15 | The Arch | Final |
| 16 | Heaven | Final |

## 4. Paths (edges)
- Green = Believers, Red = Disbelievers, Orange = Hypocrites.
- Dunya → Grave → Horn → Resurrection: believers (green) and disbelievers (red) both pass.
- Land of Resurrection runs right-to-left in the grey band, as in the picture.
- Disbelievers: Scale → Hell. Hypocrites: Fountain/Test → Hell (orange).
- Believers: Test → Sirat → The Arch → Heaven.
- Edge labels (Believers / Disbelievers / Hypocrites) as in the picture.

## 5. Mode A — Map
- SVG with `viewBox`, scales to any pane size. Text always horizontal.
- Rounded green boxes laid out like the reference picture; grey "Land of Resurrection" band.
- Red 📍 pin on Dunya.
- Click node: select it, highlight its outgoing edges, show a small info card
  (name, group, paths leaving it).
- Mobile: same SVG scaled, or vertical fallback list.

## 6. Mode B — Timeline scrub
- Premiere-style horizontal track; stages as clips in order.
- Draggable playhead snaps stage to stage.
- Path switch: Believer / Disbeliever / Hypocrite changes which clips appear
  (e.g. disbeliever track ends at Hell).
- Prev / Next step buttons (same pattern as existing Premiere transport).
- Selected node is shared state: scrubbing updates the map, clicking the map
  moves the playhead.

## 7. Files
- NEW `journey-data.js` — nodes, edges, groups, layout coordinates (data only).
- EDIT `index.html` — new tab button + `view-container-journey`.
- EDIT `index.css` — journey styles (reuse existing tokens/themes).
- EDIT `app.js` — `renderJourneyMap`, `renderJourneyTimeline`, scrub handlers,
  hook into `switchView`; `activeView` accepts `'journey'`.

## 8. Reuse
Split-screen + Focus buttons, theme/lang selectors, localStorage view memory,
toast, existing drawer (optional; not required in v03).

## 9. Open decisions (defaults in bold)
1. Map and Timeline as **sub-tabs inside Akhirat** vs separate header tabs.
2. "You are here" pin **fixed on Dunya** vs draggable.
3. Stage order **exactly as the picture** vs flag disputed stages.

## 10. Later phases (out of scope now)
- P2: per-stage citations (English only, exact Sunnah.com/Quran.com wording so
  the `#:~:text=` Verify highlight works) with grading, each marked "needs review".
- P3: route highlight animation; note where scholars differ on stage order.

## 11. Acceptance
- Opens from `file://`, no console errors, `node --check` passes.
- All 16 nodes render and are clickable; labels stay horizontal.
- Switching path (believer/disbeliever/hypocrite) changes the timeline clips.
- Scrubbing and map selection stay in sync.
- Existing 4 views unaffected.
