# Muslim Citation Timeline — Circadian Landscape & Solar/Lunar Bliss Engine (v04)
> **Document Version:** 4.0  
> **Status:** Implemented & Verified  
> **Target:** 100% Zero-Backend, Pure Client-Side Vector SVG & CSS3  
> **Evolution From:** `v03_selective-glassmorphism-styleguide.md`

---

## 1. Executive Summary & Design Heritage

### 1.1 The Concept: "The Sacred Bliss Landscape"
In version 4, the application introduces a living, dynamic landscape inspired by the iconic **Windows XP "Bliss"** panorama (rolling green hills and expansive open horizon), elevated into an interactive **Circadian Solar & Lunar Observatory**.

Rather than relying on static raster wallpaper photos that would bloat download size and look blurry on high-resolution displays, the landscape is engineered **100% in pure client-side SVG vector geometry and CSS gradients (Zero-Backend, 0 KB image assets)**.

### 1.2 Symbiosis with Selective Glassmorphism (from v03)
The entire landscape lives on the deepest layer (`z-index: -4`). When users interact with the app:
- **Through the Glass:** The translucent frosted frames of the Radial Dial, Sacred NLE Timeline, and Data Sheet allow the rolling green hills, moving clouds, sun, moon, and twinkling stars to be visible with realistic depth and light refraction.
- **Over the Glass (Protected Text):** Sacred Quranic verses, prophetic Hadith, SMPTE timecode digits, and Arabic calligraphy remain encased in **solid, opaque, high-contrast substrate plates**, maintaining uncompromised WCAG AAA readability.

---

## 2. Astronomical Solar & Lunar Cycle (8 Circadian Phases)

The celestial body (Sun or Moon), sky dome gradient, hill colors, and horizon lighting smoothly transform across the 8 phases:

```
            [ 3. DZUHUR / NOON ]
            High Zenith Brilliant Sun
                  (x: 720, y: 120)
                         ▲
     [ 2. DHUHA ]        │        [ 4. ASHAR ]
   Morning Solar Gold    │       Golden Hour Slant
    (x: 420, y: 260)     │        (x: 1040, y: 320)
          ▲              │              ▲
          │              │              │
[ 1. FAJR / DAWN ] ──────┴────── [ 5. MAGHRIB / SUNSET ]
Sun Cresting Horizon              Sun Sinking in Ridge
 (x: 240, y: 530)                  (x: 1200, y: 550)
══════════════════════════════════════════════════════════ [HORIZON RIDGE]
[ 8. TAHAJJUD ]          │        [ 6. ISYA / NIGHT ]
Waning Teal Crescent     │       Waxing Silver Crescent
 (x: 360, y: 280)        │        (x: 1080, y: 220)
                         ▼
           [ 7. TENGAH MALAM / MIDNIGHT ]
            Full Moon & 75 Twinkling Stars
                  (x: 720, y: 150)
```

---

## 3. Comprehensive Phase Palette & Vector Specifications

| Phase | Time Window | Celestial Body | Sky Gradient Palette | Rolling Hills Illumination | Atmospheric Mood |
|:---|:---|:---|:---|:---|:---|
| **🌅 1. Pagi / Fajar** | 05:00–08:00 | **Waking Sun (x:240, y:530)**<br>Golden disk breaking horizon ridge | Night violet to peach/amber<br>`#0d1326` $\rightarrow$ `#281b33` $\rightarrow$ `#6e3b26` | Deep purplish-olive shadows with warm golden rim light on eastern slopes | Awakening, gratitude, the dawn when it breathes |
| **☀️ 2. Dhuha** | 08:00–11:00 | **Ascending Sun (x:420, y:260)**<br>Warm yellow sun with radiant corona | Morning sapphire blue<br>`#1e3a63` $\rightarrow$ `#295887` $\rightarrow$ `#5391bf` | Fresh vibrant morning green<br>`#357041` $\rightarrow$ `#5ba85a` | Industry, morning sustenance, work ethic |
| **🌞 3. Siang / Dzuhur** | 11:00–14:00 | **Zenith High Sun (x:720, y:120)**<br>Brilliant white-gold sunburst | Pure crystal azure<br>`#104c8a` $\rightarrow$ `#206bb5` $\rightarrow$ `#5aa5e6` | **Classic Windows XP Bliss Green:**<br>Radiant emerald `#52c45f` with full noon sunlight | Zenith peak, seeking refuge, prayer pause |
| **🌤️ 4. Sore / Ashar** | 14:00–17:00 | **Slanting Sun (x:1040, y:320)**<br>Warm bronze-orange golden hour | Amber dusk twilight<br>`#22314d` $\rightarrow$ `#463d59` $\rightarrow$ `#875747` | Warm olive-terracotta hills with long shadows stretching west | Time passing, perseverance, reflection |
| **🌇 5. Senja / Maghrib** | 17:00–19:00 | **Setting Sun (x:1200, y:550)**<br>Crimson orb sinking into hill ridge | Sunset drama (*Syafaq Ahmar*)<br>`#1b1433` $\rightarrow$ `#4a1939` $\rightarrow$ `#943831` | Deep silhouette hills with burning magenta/rose rim lighting along crests | Dusk, forgiveness, family gathering |
| **🌌 6. Malam / Isya** | 19:00–22:00 | **Crescent Moon (x:1080, y:220)**<br>Waxing silver-blue crescent | Deep cosmic indigo<br>`#080c1d` $\rightarrow$ `#121a36` $\rightarrow$ `#1f2a4f` | Moonlit indigo-slate hills (`#182430` $\rightarrow$ `#273a4d`) with cool silver highlights | Blue hour into starry stillness, fellowship |
| **🌙 7. Tengah Malam** | 22:00–02:00 | **Full Lunar Orb (x:720, y:150)**<br>Silver-violet moon with crater detail | Nocturne violet<br>`#05060d` $\rightarrow$ `#0d0e1e` $\rightarrow$ `#17152b` | Deep dark obsidian-violet hills (`#131324` $\rightarrow$ `#211f3d`) under 75 twinkling stars | Contemplation of the heavens, deep rest |
| **✨ 8. Sepertiga Malam** | 02:00–05:00 | **Waning Moon (x:360, y:280)**<br>Ethereal teal crescent | Mystical pre-dawn cyan<br>`#040912` $\rightarrow$ `#091724` $\rightarrow$ `#102a3a` | Ethereal deep teal-slate hills (`#10222a` $\rightarrow$ `#1c3a47`) awaiting dawn | Tahajjud, intimate prayer, divine mercy |

---

## 4. Technical Architecture: SVG Vector Geometry

The backdrop is rendered inside an SVG canvas (`viewBox="0 0 1440 900"`, `preserveAspectRatio="xMidYMid slice"`):

### 4.1 Rolling Hills Geometry (Windows XP Bliss Silhouette)
- **Distant Ridge (`#hill-back`):**
  `M 0 580 Q 360 490 740 560 T 1440 530 L 1440 900 L 0 900 Z`
- **Middle Rolling Hill (`#hill-mid`):**
  `M 0 640 Q 420 550 900 630 T 1440 590 L 1440 900 L 0 900 Z`
- **Foreground Lush Hill (`#hill-front`):**
  `M 0 710 Q 340 620 780 690 T 1440 660 L 1440 900 L 0 900 Z`

### 4.2 Dynamic Procedural Starfield
- 75 procedural stars generated dynamically in `#landscape-stars` during initialization.
- Random distribution across the upper sky dome (`cy < 450px`).
- Animated via CSS `@keyframes starTwinkle` (opacity oscillation between 0.25 and 0.95).
- Opacity automatically toggles from `0` (daylight) to `0.95` (midnight).

### 4.3 Celestial Rendering Engine (`#celestial-body-group`)
- **Sun Mode:** Multi-stage rendering with outer Gaussian blur corona halo, core solar disk, and 4 orthogonal radial light rays.
- **Moon Mode:** 
  - Full Moon: Lunar disk with soft Gaussian halo and low-opacity crater markers.
  - Crescent Moon: Exact mathematical arc subtraction using SVG path `A` (elliptical arc) commands for crescent horn geometry.

---

## 5. Implementation Guardrails

1. **Zero External Assets:** 0 KB images, 0 raster files. The entire Bliss landscape is built with pure vectors, ensuring instant load time and crisp sharpness on any display (4K, Retina, OLED).
2. **Smooth Scrubbing Transitions:** SVG gradient stop colors and celestial transforms update seamlessly as the user rotates the Radial Dial, scrubs the Premiere Playhead, or lets the live clock tick.
3. **Graceful Static Theme Degradation:** If the user switches to static presets (*Desert Sand*, *Medina Night*, *Pomegranate*), the landscape automatically dims to 22% opacity with 50% grayscale desaturation, allowing the selected monochromatic color scheme to take center stage.
