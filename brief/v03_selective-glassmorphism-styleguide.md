# Muslim Citation Timeline — Selective Glassmorphism Design Brief & Style Guide (v03)
> **Document Version:** 3.0  
> **Status:** Implemented & Verified  
> **Target:** Zero-Backend Client-Side Web Application  
> **Evolution From:** `v02_ai-prompt-brief.md`

---

## 1. Executive Summary & Design Philosophy

### 1.1 The Concept: "Selective Glassmorphism" (Protected Text Substrates)
Standard glassmorphism often suffers from a critical usability flaw: **when text sits directly on transparent or blurred glass, shifting backgrounds and bright lighting wash out the typography**, causing eye strain and poor readability.

In a contemplative Islamic application that features sacred Arabic scripture (*Uthmani script with intricate diacritics / harakat*), **uncompromised legibility is paramount**.

**Selective Glassmorphism** solves this by establishing a strict architectural separation:
1. **The Ambient Glass Chrome (Translucent & Atmospheric):** Structural frames, split pane borders, timeline rulers, track lanes, dial rings, and drawer backdrops use deep frosted glass (`backdrop-filter: blur(20px–28px)`) that lets the dynamic celestial sky and sun trajectory shine through.
2. **The Protected Text Substrates (Solid & High-Contrast):** Text elements and their direct containers (center hub clock, Arabic citation cards, translation boxes, clip header pills, and table topic capsules) are **excluded from transparency**. They sit on solid, high-contrast substrate plates (`var(--bg-surface-elevated)` or deep contrast capsules with crisp micro-borders and soft ambient shadows).

---

## 2. The 3-Tier Layered Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: PROTECTED TEXT SUBSTRATES                                    │
│  - Arabic Scripture Plate (Solid #151d34 / #1b2232, AAA contrast)      │
│  - Dial Center Hub Plate (Solid elevated disk, sharp clock & phase)    │
│  - Timeline Clip Capsules (Solid contrast pills for text & timecode)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Floating on top
┌───────────────────────────────────▼────────────────────────────────────┐
│  LAYER 1: AMBIENT GLASS CHROME (TRANSLUCENT & FROSTED)                 │
│  - Frosted Split Panes (backdrop-filter: blur(20px))                   │
│  - NLE Timeline Frame & Canvas (translucent track beds)                │
│  - Radial 8 Ring & Concentric Spider Grid                              │
│  - Inspector Drawer Shell (blur(28px) glass panel)                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Viewing through
┌───────────────────────────────────▼────────────────────────────────────┐
│  LAYER 0: DYNAMIC CIRCADIAN SKY ATMOSPHERE ENGINE                      │
│  - Real-time solar trajectory & altitude lighting                      │
│  - Horizon-to-zenith atmospheric radial gradients                      │
│  - Solar aura halo shifting from East (Dawn) to Zenith to West (Dusk)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Implementation Breakdown

### 3.1 Mode 0: Radial 8 Dial & Center Hub
- **Glass Chrome:** The outer 8 donut wedges and concentric radar web rings are semi-translucent (`rgba(20, 25, 36, 0.82)`), letting the ambient celestial sky shine through.
- **Protected Substrate (`.dial-center-hub`):**
  - Background: `var(--bg-surface-elevated)` (opaque solid backing plate).
  - Clock Badge (`.hub-live-clock`): High-contrast dark capsule (`rgba(0, 0, 0, 0.45)`) with inset shadow and crisp 1px border.
  - Phase Title & Status: Pure white and vibrant phase accent colors floating over solid substrate.

### 3.2 View 3: Sacred NLE Timeline Panel
- **Glass Chrome (`.premiere-panel-frame`):**
  - Frame & Tab Bar: Translucent frosted glass with `backdrop-filter: blur(20px)`.
  - Tracks Canvas & Ruler: Transparent canvas revealing the dynamic sky background.
  - CTI Playhead Needle: Dynamic laser line powered by `var(--phase-accent)`.
- **Protected Substrates:**
  - Clip Block Headers (`.pr-clip-header`): Dark solid pill (`rgba(0, 0, 0, 0.45)`) ensuring clip filenames and duration timecode remain 100% sharp.
  - Clip Preview Content (`.pr-clip-preview`): Solid contrast backing (`rgba(0, 0, 0, 0.38)`).
  - Timecode Display (`.pr-timecode-box`): Solid dark well (`rgba(0, 0, 0, 0.35)`) with glowing neon digits (`var(--phase-accent)`).

### 3.3 Data Sheet Grid (Excel-Grade Lens)
- **Glass Chrome:** Table frame and rows sit on translucent glass surface.
- **Protected Substrates:**
  - Topic Text (`.col-topic`): Contained in subtle contrast pill (`rgba(0, 0, 0, 0.22)`) with micro-border.
  - Arabic Preview (`.col-arabic-preview`): Solid contrast capsule (`rgba(0, 0, 0, 0.32)`) ensuring Arabic diacritics are crisp and distinct.

### 3.4 Inspector Drawer (Scripture Meditation Modal)
- **Glass Chrome (`.inspector-drawer`):**
  - Side modal body uses heavy frosted glass (`backdrop-filter: blur(28px)`, opacity 0.85).
- **Protected Substrates:**
  - Arabic Scripture Card (`.inspector-arabic-card`): Solid, deep elevated substrate plate (`var(--bg-surface-elevated)`) with `1.65rem` Amiri font, `line-height: 2.1`, and inner ambient glow.
  - Translation & Tafsir (`.inspector-card-section`): Solid elevated card (`var(--bg-surface-elevated)`) preventing long-form commentary from being washed out by background light.

---

## 4. The 8 Dynamic Sky Atmospheres (Palette Specs)

When the theme is set to **`🌤️ Langit Sirkadian (Dynamic Sky)`**, the CSS variables `--sky-bg-gradient`, `--sky-sun-glow`, and `--phase-accent` automatically morph across the 8 phases:

| Phase | Window | Sky Atmosphere Gradient (`--sky-bg-gradient`) | Sun Glow Aura (`--sky-sun-glow`) | Accent Color |
|:---|:---|:---|:---|:---|
| **🌅 Pagi / Fajar** | 05:00–08:00 | `radial-gradient(ellipse at 20% 100%, #3a1f18 0%, #1e152d 42%, #0a0d18 100%)` | Sunrise amber at 20% 95% | `hsl(42, 92%, 55%)` |
| **☀️ Dhuha** | 08:00–11:00 | `radial-gradient(ellipse at 30% 25%, #1d2c42 0%, #101c2e 50%, #090f1a 100%)` | Solar gold at 30% 20% | `hsl(48, 96%, 53%)` |
| **🌞 Siang / Dzuhur** | 11:00–14:00 | `radial-gradient(ellipse at 50% 0%, #0e345c 0%, #0a213e 50%, #050f1c 100%)` | High zenith azure at 50% 5% | `hsl(198, 88%, 48%)` |
| **🌤️ Sore / Ashar** | 14:00–17:00 | `radial-gradient(ellipse at 75% 40%, #38221b 0%, #1c1526 50%, #0b0c16 100%)` | Golden slant at 75% 40% | `hsl(24, 85%, 52%)` |
| **🌇 Senja / Maghrib** | 17:00–19:00 | `radial-gradient(ellipse at 85% 100%, #461424 0%, #22102c 45%, #0b0916 100%)` | Crimson dusk at 85% 95% | `hsl(340, 75%, 56%)` |
| **🌌 Malam / Isya** | 19:00–22:00 | `radial-gradient(ellipse at 50% 50%, #111738 0%, #0a0d24 55%, #050712 100%)` | Indigo blue hour at 50% 55% | `hsl(228, 62%, 54%)` |
| **🌙 Tengah Malam** | 22:00–02:00 | `radial-gradient(ellipse at 50% 75%, #140f26 0%, #0a0914 55%, #04040a 100%)` | Nocturne violet at 50% 75% | `hsl(265, 50%, 48%)` |
| **✨ Sepertiga Malam** | 02:00–05:00 | `radial-gradient(ellipse at 30% 85%, #0c232e 0%, #06131b 50%, #03080e 100%)` | Ethereal teal at 30% 85% | `hsl(182, 70%, 46%)` |

---

## 5. Technical Verification & Performance Standards

1. **Hardware Acceleration:** All blur effects use CSS `backdrop-filter: blur(...)` and `-webkit-backdrop-filter`, rendering smoothly at 60 FPS on mobile GPU without paint bottlenecks.
2. **Contrast Ratio Compliance:** Text on protected substrates strictly achieves **WCAG AAA standard (> 7:1)** for sacred Arabic texts and **WCAG AA (> 4.5:1)** for secondary metadata.
3. **Zero-Server Resilience:** 100% vanilla CSS variables and semantic DOM transforms; requires zero JavaScript runtime libraries or graphics frameworks.
