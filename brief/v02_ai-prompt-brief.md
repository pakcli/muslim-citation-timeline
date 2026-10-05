# Muslim Citation Timeline — Product Specification & AI Prompt Brief (v02)
> **Document Version:** 2.0  
> **Status:** Ready for Implementation  
> **Target:** Interactive Web Application (Mobile-First Responsive PWA / Desktop Dual-Pane)  
> **Evolution From:** `v01_CHAT-HISTORY-daily-quran-hardist.md`

---

## 1. Executive Summary & Core Philosophy

### 1.1 The Concept
**Muslim Citation Timeline** is a contemplative, circadian Islamic citation instrument. Unlike conventional apps that fire disconnected daily push notifications or dump users into search dictionaries, this application aligns sacred texts (The Holy Qur'an and authentic Prophetic Hadith) to the **natural rhythm of the human day across 8 distinct temporal phases**.

It operates as a **single structured dataset observed through dual, synchronized lenses**:
1. **The Visual Instrument (Top / Left Pane):** An analog-feeling radial "valve" dial that users can rotate to travel through the phases of the day, governed by an intentional **Zen Mode ("no spoilers")** philosophy.
2. **The Structured Data Sheet (Bottom / Right Pane):** An Excel/Airtable-grade data grid engineered for instant search, copying, cross-referencing, and scholarly verification.

---

## 2. Product Critique: Antigravity's "Take" on v01

### What Makes This a 10/10 Idea (The Strengths)
1. **Circadian Islamic UX is deeply intuitive:** Islam is inherently tied to the sun's trajectory (Fajr, Dhuhr, Asr, Maghrib, Isha, Tahajjud). Organizing citations into 8 time-of-day slots grounds spirituality in the user's immediate emotional and physical context (e.g., morning gratitude, afternoon perseverance, twilight reflection, midnight tranquility).
2. **The "Valve" Rotary Scrubbing:** Replacing standard linear sliders with a rotary dial on the radial view creates a tangible, mechanical micro-interaction that feels calming and tactile.
3. **The Zen Principle ("No Spoilers"):** Information overload ruins reflection. Restricting visible citations to the current moment + the next 6 hours preserves anticipation and presence.
4. **Dual-Lens Power Architecture:** Split-pane with a draggable divider bridges the gap between aesthetic mindfulness and high-utility reference tools (copying Arabic, translation, and grading in one click).

### Weak Points & Traps in v01 (And How v02 Solves Them)
1. **Fixed Hours vs. Solar Prayer Times:**
   - *Trap in v01:* Hardcoding phases as "05-08", "11-14" breaks down across seasons and latitudes (e.g., Nordic winters vs. Equator).
   - *v02 Resolution:* MVP uses configurable 8-phase hourly brackets with device-time auto-detection, while architecting the phase engine to seamlessly plug in local astronomical prayer time calculation (`adhan` algorithm) in v2.1.
2. **Content Generation Bottleneck (8 slots × 365 days = 2,920 citations/year):**
   - *Trap in v01:* Handcrafting 3,000 entries with Arabic diacritics, English, Indonesian, tafsir, and hadith grading can stall development.
   - *v02 Resolution:* Ship MVP with a pristine, vetted 3-day seed collection (24 comprehensive slots) and a standardized JSON pipeline schema that can be populated via verified sources (Quran.com API v4, Sunnah.com / HadithEnc).
3. **Mobile Gesture Conflicts:**
   - *Trap in v01:* Rotating a radial dial on a touchscreen frequently triggers page scroll or pull-to-refresh.
   - *v02 Resolution:* Strict CSS `touch-action: none` on the valve wheel, angular delta math via `Math.atan2`, minimum drag threshold (8px), and haptic tick feedback (`navigator.vibrate(10)`).
4. **Slidev Chat Contamination in v01:**
   - *Resolution:* v01 ended with an unrelated discussion about Slidev deck exports. v02 strips all non-relevant presentation-tool chatter and focuses 100% on the **Muslim Citation Timeline** application.

---

## 3. The 8 Circadian Phases & Dynamic Color Palette

The day is divided into 8 harmonious phases. When the app is in **Auto Theme**, the UI palette dynamically transitions to match the current phase (or scrubbed phase):

| Phase ID | Name (EN) | Name (ID) | Default Window | Mood / Spiritual Tone | Accent Color (HSL) | CSS Variable |
|:---|:---|:---|:---|:---|:---|:---|
| `p1_dawn` | Dawn / Fajr | Pagi / Fajar | 05:00 – 08:00 | Awakening, Gratitude, Fresh Start | Golden Amber (`hsl(42, 92%, 55%)`) | `--phase-p1` |
| `p2_morning` | Mid-Morning | Dhuha / Pagi Menjelang Siang | 08:00 – 11:00 | Industry, Work, Sustenance | Solar Yellow (`hsl(48, 96%, 53%)`) | `--phase-p2` |
| `p3_noon` | High Noon / Dhuhr | Siang Terik | 11:00 – 14:00 | Pause, Reset, Seeking Refuge | Radiant Azure (`hsl(198, 88%, 48%)`) | `--phase-p3` |
| `p4_afternoon`| Late Afternoon / Asr | Sore Hari | 14:00 – 17:00 | Perseverance, Time Passing | Warm Terracotta (`hsl(24, 85%, 52%)`)| `--phase-p4` |
| `p5_sunset` | Sunset / Maghrib | Senja / Maghrib | 17:00 – 19:00 | Dusk, Contemplation, Forgiveness | Twilight Rose (`hsl(340, 75%, 56%)`)| `--phase-p5` |
| `p6_evening` | Early Night / Isha | Malam Awal | 19:00 – 22:00 | Fellowship, Family, Peace | Deep Indigo (`hsl(228, 62%, 54%)`) | `--phase-p6` |
| `p7_midnight`| Midnight / Deep Night| Tengah Malam | 22:00 – 02:00 | Stillness, Solitude, Sleep | Nocturne Violet (`hsl(265, 50%, 48%)`)| `--phase-p7` |
| `p8_predawn` | Pre-Dawn / Tahajjud | Sepertiga Malam Terakhir | 02:00 – 05:00 | Intimacy with God, Seeking Mercy | Ethereal Cyan (`hsl(182, 70%, 46%)`)| `--phase-p8` |

### Static Theme Presets (User Overridable)
- **Auto (Circadian Sync):** Shifts palette automatically with the active/scrubbed phase.
- **Desert Sand (Cream / Warm Brown):** Parchment backdrop, warm Umber text, Gold accents.
- **Medina Night (Deep Navy / Gold):** Obsidian slate backdrop with starry gold and lapis accents.
- **Pomegranate (Terracotta / Red Ochre):** Warm clay and crimson tones.

---

## 4. Multi-Lens Architecture (One Dataset, 5 Views)

The core dataset powers 5 synchronized views:

```
                  ┌──────────────────────────────────────────────┐
                  │          UNIFIED CITATION STORE              │
                  │        (citations.json / IndexedDB)          │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌──────────────┬─────────────────┼────────────────┬──────────────┐
        ▼              ▼                 ▼                ▼              ▼
   [Lens 1:        [Lens 2:          [Lens 3:         [Lens 4:       [Lens 5:
    Radial 8]       Circle (0)]       Scrubber]        Calendar]      Sheet Grid]
  Default dial   360° day loop      Linear timeline  Month grid     Excel-style
  8 segment valve  dot ring           Premiere-style   Google style   Inspector split
```

1. **Radial 8 (Default MVP View):** 
   - 8-segment donut ring.
   - Central hub displaying current phase name, live clock, and "Back to Now" button.
   - Smooth rotary dragging (Valve Mode).
2. **Circle 0 (MVP Extended):**
   - 24-hour / 360° continuous ring with dots marking individual citation points.
3. **Scrubber Timeline:**
   - Linear horizontal track with playhead and scrub controls.
4. **Calendar View (Phase 2):**
   - Monthly grid overview showing daily themes and topics.
5. **Sheet Grid (Data View):**
   - Dense, high-legibility spreadsheet with quick actions (Copy Arabic, Copy ID, Copy EN, Share Card).

---

## 5. Zen Mode Specification ("No Spoilers")

Zen Mode is the defining philosophical feature of the app. It is **enabled by default**.

### 5.1 Visibility Rules by Temporal Distance
- **Current Phase ($T_0$):** Fully active, highlighted glow, full text and title visible.
- **Upcoming Window ($T_0 < t \le T_0 + 6\text{h}$):** 
  - Since each phase is ~3 hours, this reveals the **next 2 consecutive phases**.
  - Visible titles, soft indicator to help users look forward without distraction.
- **Past Phases ($t < T_0$):**
  - Retained on the ring, but gently dimmed (opacity ~0.4), accessible if clicked.
- **Distant Future ($t > T_0 + 6\text{h}$):**
  - **Masked entirely** (e.g., titled as `•••` or `"Terselubung"` / `"In Time"`).
  - Preserves anticipation and presence.

### 5.2 Interaction & Override
- Tapping a masked segment opens a delicate toast/dialogue:
  > *"Zen Mode is active. Focus on this hour's wisdom."*  
  > `[Reveal Just This]` `[Disable Zen Mode]`
- When Zen is toggled OFF, all 8 segments reveal their titles across all views.
- **Data Sheet Mirroring:** The Sheet view masks unrevealed rows with a frosted glass blur filter to ensure Zen consistency.

---

## 6. Valve Rotary Dial & Interaction Mechanics

```
               [ 08:00 - 11:00 ]
             Phase 2: Mid-Morning
                    ▲
        ┌───────────┴───────────┐
     ┌──┘     ╭─────────╮       └──┐
     │  P1   │  10:24   │   P3    │
     │ Dawn  │  [LIVE]  │  Noon   │ ◄── Rotates like a valve
     └──┐     ╰─────────╯       ┌──┘     (Touch / Mouse drag)
        └───────────┬───────────┘
                    ▼
```

### 6.1 Rotary Drag Physics
- **Angle Calculation:** Computed on `pointermove` using:
  $$\theta = \operatorname{atan2}(y - y_c, x - x_c) \times \frac{180}{\pi}$$
- **Scrubbing Sensitivity:** Continuous angle change tracks the pointer. Releasing snaps to the nearest phase segment with an ease-out spring animation.
- **Haptic Feedback:** Emits `navigator.vibrate(8)` on crossing each phase boundary on mobile devices.
- **Accessibility Fallbacks:**
  - Keyboard: `ArrowLeft` / `ArrowDown` (previous phase), `ArrowRight` / `ArrowUp` (next phase), `Home` (jump to live now).
  - Mouse Wheel: Delta wheel over the radial steps through segments.
- **Live vs. Scrubbed State:**
  - If user rotates away from the present time, a floating pill badge appears:  
    `[ ↺ Kembali ke Waktu Sekarang / Back to Now ]`.

---

## 7. Responsive Dual-Pane Layout

```
MOBILE LAYOUT (Split Vertical)           DESKTOP LAYOUT (Split Horizontal)
┌──────────────────────────────┐        ┌───────────────────┬───────────────────┐
│ Top: Radial Instrument       │        │ Left:             │ Right:            │
│ (Valve dial, controls, live) │        │ Radial Instrument │ Sheet Grid &      │
├══════════════════════════════┤        │ (Valve, themes,   │ Inspector Drawer  │
│ ═══ Draggable Divider ═══    │        │  zen status)      │ (Multi-copy,      │
├──────────────────────────────┤        │                   │  tafsir, notes)   │
│ Bottom: Data Sheet & Quick   │        │                   │                   │
│ Action Copy Bar              │        │                   │                   │
└──────────────────────────────┘        └───────────────────┴───────────────────┘
```

### 7.1 Draggable Divider Mechanics
- Mobile: Vertical split (default 52% top / 48% bottom). Drag handle allows expanding either the radial view or the sheet grid.
- Desktop: Horizontal split (default 50% left / 50% right) with a sleek vertical gutter.
- Divider position is persisted in `localStorage`.

---

## 8. Complete Data Schema (`citations.json`)

Each entry represents exactly one circadian slot:

```json
[
  {
    "id": "2026-10-05-p1",
    "date": "2026-10-05",
    "slot": 1,
    "phase_id": "p1_dawn",
    "phase_name_en": "Dawn / Fajr",
    "phase_name_id": "Pagi / Fajar",
    "time_range": "05:00-08:00",
    "topic_en": "Gratitude at First Light",
    "topic_id": "Syukur Menyambut Fajar",
    "source_type": "quran",
    "arabic": "وَالصُّبْحِ إِذَا تَنَفَّسَ",
    "text_en": "And by the dawn when it breathes.",
    "text_id": "Dan demi subuh apabila fajar mulai menyingsing.",
    "translation_credit": "Sahih International / Kemenag RI",
    "explain_en": "The dawn breathing is a metaphor for the revitalisation of the world and conscious awakening of the soul.",
    "explain_id": "Subuh yang bernapas adalah metafora pembaruan energi alam semesta dan kesadaran ruhani yang bangkit kembali.",
    "quran_detail": {
      "surah_no": 81,
      "surah_name": "At-Takwir",
      "surah_name_ar": "التكوير",
      "ayah": 18,
      "juz": 30
    },
    "hadith_detail": null,
    "source_url": "https://quran.com/81/18",
    "tags": ["dawn", "nature", "gratitude", "contemplation"]
  },
  {
    "id": "2026-10-05-p2",
    "date": "2026-10-05",
    "slot": 2,
    "phase_id": "p2_morning",
    "phase_name_en": "Mid-Morning",
    "phase_name_id": "Dhuha / Pagi Menjelang Siang",
    "time_range": "08:00-11:00",
    "topic_en": "Diligence & Ethical Sustenance",
    "topic_id": "Etos Kerja dan Rezeki yang Halal",
    "source_type": "hadith",
    "arabic": "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
    "text_en": "No one has ever eaten a better food than that which is earned by the work of his own hand.",
    "text_id": "Tidak ada seorang pun yang memakan makanan yang lebih baik daripada apa yang dihasilkan dari jerih payah tangannya sendiri.",
    "translation_credit": "Sahih al-Bukhari",
    "explain_en": "Honest livelihood and manual effort are consecrated acts of worship in daily affairs.",
    "explain_id": "Bekerja dengan jujur dan mengandalkan ikhtiar sendiri dipandang sangat mulia dan bernilai ibadah.",
    "quran_detail": null,
    "hadith_detail": {
      "collection": "Sahih al-Bukhari",
      "book": "Book of Sales (Kitab al-Buyu)",
      "hadith_no": 2072,
      "narrator": "Miqdam ibn Ma'dikarib",
      "grading": "Sahih (Authentic)",
      "grading_by": "Al-Bukhari"
    },
    "source_url": "https://sunnah.com/bukhari:2072",
    "tags": ["work", "sustenance", "integrity", "diligence"]
  }
]
```

---

## 9. Inspector & Multi-Format Copy Engine

When any segment or row is tapped:
1. The **Inspector Modal / Bottom Sheet** opens.
2. The corresponding row in the Data Sheet is highlighted with a pulse effect.
3. Quick copy triggers format the clipboard with one tap:

| Copy Action | Target Output Format |
|:---|:---|
| **Copy Arabic Only** | Raw diacritized Arabic text with Uthmani script font. |
| **Copy Translation (EN/ID)** | Translation text + Source reference. |
| **Copy Scholarly Citation** | Full formatted blockquote:<br>`"وَالصُّبْحِ إِذَا تَنَفَّسَ"`<br>— *And by the dawn when it breathes.* [QS. At-Takwir: 18] |
| **Copy Markdown Snippet** | GitHub-flavored markdown with source link. |

---

## 10. Technology Stack & Implementation Guardrails

- **Architecture:** 100% Zero-Backend, Zero-Dependency Static Single Page Web Application (Pure Vanilla JS, Semantic HTML5, Vanilla CSS).
- **Zero-Server Portability:** Must run out-of-the-box directly by double-clicking `index.html` (via `file://` protocol) or hosted on GitHub Pages / Netlify / Vercel without requiring `npm install`, Node.js, or any local dev server. Seed dataset (24 slots) is embedded directly into the JS bundle to bypass browser `file://` CORS restrictions while maintaining clean JSON structure.
- **Typography:**
  - Latin/UI: `Plus Jakarta Sans` / `Outfit` via Google Fonts with system font fallbacks (`system-ui`, `-apple-system`, `sans-serif`).
  - Arabic: `Amiri` and `Noto Naskh Arabic` via Google Fonts with `direction: rtl` and optimized line-height.
- **Rendering:** Inline SVG + dynamic DOM transforms for the Radial Valve dial to ensure crisp 60–120 FPS rotation, sub-pixel rendering, and zero pixelation on Retina/OLED mobile displays.
- **Persistence:** LocalStorage for user preferences (`activeTheme`, `zenModeEnabled`, `dividerRatio`, `iconMode`, `showTitles`).
- **Offline Capability:** 100% self-contained static assets, perfectly resilient to offline usage.

---

## 11. AI Implementation Checklist & Acceptance Criteria

When an AI developer takes this brief to code the project, it must meet these exact standards:

- [ ] **Radial Valve Mechanics:**
  - Dial rotates smoothly with pointer/touch events.
  - Snaps cleanly to 1 of 8 segments on release.
  - Displays current time and active phase in the central hub.
  - "Back to Now" button smoothly resets rotation to current clock time.
- [ ] **Zen Mode:**
  - Enabled by default.
  - Restricts visible text to $T_0$ and next 6 hours.
  - Past slots dimmed; slots beyond 6 hours masked.
  - Toast alert triggers on tapping masked slot with override option.
- [ ] **Responsive Split Screen:**
  - Draggable divider functioning seamlessly on both mouse and touch.
  - Mobile stacks vertically; Desktop divides horizontally.
- [ ] **Data Sheet & Inspector:**
  - Displays all 8 daily phases in structured rows.
  - Copy buttons instantly write formatted text to clipboard with toast confirmation.
  - Selecting a row highlights the radial segment and opens the detail inspector.
- [ ] **Theme Engine:**
  - Dynamic Auto mode changing with the 8 phase accents.
  - 3 static color presets (Sand, Medina Night, Pomegranate).
- [ ] **Sample Dataset:**
  - Bundled with a minimum of 24 verified slots (3 full days) conforming strictly to the JSON schema.
