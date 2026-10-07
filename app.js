/**
 * Muslim Citation Timeline — Core Application Engine (v2.1)
 * Pure Vanilla JS, Zero Dependencies, Zero Build Step Required.
 * Runs instantly from file:// or any static host.
 */

(function () {
  'use strict';

  // ==========================================================================
  // CONFIGURATION & SEED DATA CHECK
  // ==========================================================================
  const CITATIONS = window.CITATIONS_DATA || [];
  const PHASES = window.PHASES_CONFIG || [];

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const state = {
    selectedDate: "2026-10-05", // Default: Today (Seed center)
    activeSlot: 1,             // Currently selected or focused slot (1-8)
    liveSlot: 1,               // Real-time circadian slot based on device clock
    isLiveMode: true,          // True if following live clock, false if scrubbed
    activeView: localStorage.getItem("mct_active_view") || "radial", // 'radial' (Mode 0: O shape) | 'circle0' (Mode 8: oo shape) | 'timeline' | 'calendar'
    focusMode: null,           // null | 'visual' | 'data'
    zenMode: true,             // Default: ON ("no spoilers" rule)
    showLabels: true,          // Toggle text labels
    iconMode: "celestial",     // 'celestial' | 'clock' | 'none'
    showTitles: true,          // Toggle citation titles
    theme: localStorage.getItem("mct_theme") || "sky",
    lang: localStorage.getItem("mct_lang") || "id",
    searchQuery: "",
    unlockedZenSlots: new Set(), // Set of slots temporarily unlocked by user
    isDraggingDial: false,
    dragStartAngle: 0,
    hasMovedDial: false,
    isDraggingPlayhead: false,
    isDraggingDivider: false,
    // Mode 0 (Circle 0 - 2x Loop)
    circle0Loop: 1,            // 1 for AM (00:00 - 12:00), 2 for PM (12:00 - 24:00)
    circle0Angle: 0,           // Current angle of hand (0 to 360 deg)
    isDraggingCircle0: false,
    lastCircle0Angle: 0,
    // Premiere Pro Timeline
    snapEnabled: true,
    timelineZoom: 1,
    // Scriptural Source & Hadith Authenticity Filters
    sourceFilter: "all",       // 'all' | 'quran' | 'hadith'
    hadithMinGrade: 1,         // 1: Muttafaqun 'Alayh / Sahih High, 2: Sahih, 3: Hasan, 4: Dha'if
    hadithMaxGrade: 4,         // Range max grade
    // Sheet Sorting & Grouping
    sheetSortBy: "phase",      // 'phase' | 'type' | 'topic' | 'len'
    sheetSortOrder: "asc",     // 'asc' | 'desc'
    // Inspector Drawer Mode ('left' | 'center' | 'right')
    drawerMode: localStorage.getItem("mct_drawer_mode") || "right"
  };

  // Fixed angular positions for Mode 0 Radial Dial (laid out as real 24h clock):
  // Siang / Dzuhur (Slot 3) di posisi jam 12 (North: -90°)
  // Tengah Malam (Slot 7) di posisi jam 6 (South: +90°)
  // Rotasi searah jarum jam: 8 sektor × 45° = 360°
  const FIXED_SLOT_ANGLES = {
    1: 180,    // Pagi / Fajar          → Posisi Jam 9 (Barat / 06:00)
    2: -135,   // Dhuha                 → Posisi Jam 10:30 (Barat Laut / 09:00)
    3: -90,    // Siang Terik / Dzuhur  → Posisi Jam 12 (Utara / 12:00)
    4: -45,    // Sore Hari / Ashar     → Posisi Jam 1:30 (Timur Laut / 15:00)
    5: 0,      // Senja / Maghrib       → Posisi Jam 3 (Timur / 18:00)
    6: 45,     // Malam Awal / Isya     → Posisi Jam 4:30 (Tenggara / 21:00)
    7: 90,     // Tengah Malam          → Posisi Jam 6 (Selatan / 00:00)
    8: 135     // Sepertiga Malam Akhir → Posisi Jam 7:30 (Barat Daya / 03:00)
  };

  // Premiere clip label colors matching Adobe Premiere Pro NLE color scheme
  const PREMIERE_CLIP_COLORS = {
    1: { bg: "#0d47a1", border: "#29b6f6", label: "Cerulean" },   // Fajr
    2: { bg: "#1b5e20", border: "#66bb6a", label: "Forest" },     // Dhuha
    3: { bg: "#b71c1c", border: "#ef5350", label: "Rose" },       // Dzuhur
    4: { bg: "#e65100", border: "#ffa726", label: "Mango" },      // Ashar
    5: { bg: "#4a148c", border: "#ab47bc", label: "Iris" },       // Maghrib
    6: { bg: "#004d40", border: "#26a69a", label: "Teal" },       // Isya
    7: { bg: "#212121", border: "#78909c", label: "Slate" },      // Tengah Malam
    8: { bg: "#311b92", border: "#7e57c2", label: "Purple" }      // Sepertiga Malam
  };

  // ==========================================================================
  // DOM ELEMENT SELECTORS
  // ==========================================================================
  const dom = {
    body: document.body,
    splitWorkspace: document.getElementById("split-workspace"),
    paneVisual: document.getElementById("pane-visual"),
    paneData: document.getElementById("pane-data"),
    splitDivider: document.getElementById("split-divider"),
    
    // Header controls
    viewSwitcherBtns: document.querySelectorAll("#view-switcher .view-tab-btn"),
    dateButtons: document.querySelectorAll("#date-selector-group .date-btn"),
    langSelect: document.getElementById("lang-select"),
    themeSelect: document.getElementById("theme-select"),
    brandSymbol: document.getElementById("brand-symbol"),

    // Focus/Collapse Buttons
    btnFocusVisual: document.getElementById("btn-focus-visual"),
    btnFocusData: document.getElementById("btn-focus-data"),

    // View Containers (Radial 8, Circle 0, Premiere Timeline, Google Calendar)
    viewContainers: {
      radial: document.getElementById("view-container-radial"),
      circle0: document.getElementById("view-container-circle0"),
      timeline: document.getElementById("view-container-timeline"),
      calendar: document.getElementById("view-container-calendar"),
      journey: document.getElementById("view-container-journey")
    },

    // Radial controls & Source / Hadith Filter
    sourceFilterBtns: document.querySelectorAll("#source-filter-group .source-toggle-btn"),
    hadithSliderWrap: document.getElementById("hadith-range-slider-wrap"),
    hadithMinSlider: document.getElementById("hadith-min-slider"),
    hadithMaxSlider: document.getElementById("hadith-max-slider"),
    hadithSliderLabel: document.getElementById("hadith-slider-range-label"),
    hadithSliderHighlight: document.getElementById("hadith-slider-highlight"),
    toggleLabelsBtn: document.getElementById("toggle-labels-btn"),
    iconModeSelect: document.getElementById("icon-mode-select"),
    toggleTitlesBtn: document.getElementById("toggle-titles-btn"),
    toggleZenBtn: document.getElementById("toggle-zen-btn"),

    // Dial elements (Mode 8: Static Washing Machine Dial Selector)
    radialStage: document.getElementById("radial-stage"),
    radialDialWrapper: document.getElementById("radial-dial-wrapper"),
    radialSvg: document.getElementById("radial-svg"),
    radarGridGroup: document.getElementById("radar-grid-group"),
    dialWedgesGroup: document.getElementById("dial-wedges-group"),
    dialSpokesGroup: document.getElementById("dial-spokes-group"),
    dialPointerNeedleGroup: document.getElementById("dial-pointer-needle-group"),
    dialLabelsGroup: document.getElementById("dial-labels-group"),
    dialCenterHub: document.getElementById("dial-center-hub"),
    hubModeBadge: document.getElementById("hub-mode-badge"),
    hubLiveClock: document.getElementById("hub-live-clock"),
    hubPhaseTitle: document.getElementById("hub-phase-title"),
    hubPhaseRange: document.getElementById("hub-phase-range"),
    backToNowBtn: document.getElementById("back-to-now-btn"),

    // Mode 0 (Circle 0: Two-Time Rotation Dial 2x12h)
    circle0Stage: document.getElementById("circle0-stage"),
    circle0DialWrapper: document.getElementById("circle0-dial-wrapper"),
    circle0Svg: document.getElementById("circle0-svg"),
    circle0TicksGroup: document.getElementById("circle0-ticks-group"),
    circle0NodesGroup: document.getElementById("circle0-nodes-group"),
    circle0HandGroup: document.getElementById("circle0-hand-group"),
    circle0CenterHub: document.getElementById("circle0-center-hub"),
    circle0LoopBadge: document.getElementById("circle0-loop-badge"),
    circle0LoopText: document.getElementById("circle0-loop-text"),
    circle0Clock: document.getElementById("circle0-clock"),
    circle0PhaseName: document.getElementById("circle0-phase-name"),

    // Premiere Pro Timeline elements
    premiereTimecodeDigits: document.getElementById("premiere-timecode-digits"),
    btnTlPrev: document.getElementById("btn-tl-prev"),
    btnTlLive: document.getElementById("btn-tl-live"),
    btnTlNext: document.getElementById("btn-tl-next"),
    prMagnetBtn: document.getElementById("pr-magnet-btn"),
    premiereTracksBoard: document.getElementById("premiere-tracks-board"),
    premiereRuler: document.getElementById("premiere-ruler"),
    premiereCitationsLane: document.getElementById("premiere-citations-lane"),
    premiereAmbientLane: document.getElementById("premiere-ambient-lane"),
    premierePlayhead: document.getElementById("premiere-playhead"),
    zoomScrollThumb: document.getElementById("zoom-scroll-thumb"),

    // Google Calendar elements
    calendarDayGrid: document.getElementById("calendar-day-grid"),
    calTodayTitle: document.getElementById("cal-today-title"),

    // Sheet elements
    sheetSearchInput: document.getElementById("sheet-search-input"),
    sheetSortSelect: document.getElementById("sheet-sort-select"),
    sheetTableBody: document.getElementById("citations-table-body"),
    sheetRowCount: document.getElementById("sheet-row-count"),
    thSortables: document.querySelectorAll(".th-sortable"),

    // Inspector Drawer elements
    inspectorDrawer: document.getElementById("inspector-drawer"),
    drawerBackdrop: document.getElementById("drawer-backdrop"),
    drawerModeToggle: document.getElementById("drawer-mode-toggle"),
    drawerModeBtns: document.querySelectorAll(".drawer-mode-btn"),
    closeDrawerBtn: document.getElementById("close-drawer-btn"),
    inspectorHeaderTitle: document.getElementById("inspector-header-title"),
    inspectorPhaseBadge: document.getElementById("inspector-phase-badge"),
    inspectorPhaseName: document.getElementById("inspector-phase-name"),
    inspectorArabicText: document.getElementById("inspector-arabic-text"),
    inspectorReferenceTag: document.getElementById("inspector-reference-tag"),
    inspectorSourceLabel: document.getElementById("inspector-source-label"),
    inspectorMetaType: document.getElementById("inspector-meta-type"),
    inspectorMetaTime: document.getElementById("inspector-meta-time"),
    inspectorMetaGrading: document.getElementById("inspector-meta-grading"),
    inspectorTextId: document.getElementById("inspector-text-id"),
    inspectorTextEn: document.getElementById("inspector-text-en"),
    inspectorCredit: document.getElementById("inspector-credit"),
    inspectorExplainId: document.getElementById("inspector-explain-id"),
    inspectorExplainEn: document.getElementById("inspector-explain-en"),
    inspectorTagsContainer: document.getElementById("inspector-tags-container"),
    inspectorCopyBtn: document.getElementById("inspector-copy-btn"),
    inspectorSourceLink: document.getElementById("inspector-source-link"),

    // Toast Container
    toastContainer: document.getElementById("toast-container")
  };

  // ==========================================================================
  // HELPER UTILITIES
  // ==========================================================================
  function showToast(message, icon = "✓") {
    if (!dom.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      toast.style.transition = "all 0.25s ease-out";
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage);
      }).catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast(successMessage);
    } catch (e) {
      showToast("Gagal menyalin teks", "⚠️");
    }
    document.body.removeChild(textarea);
  }

  // Calculate circadian slot from 24h decimal or integer hour
  function getSlotFromHour(hour) {
    const h = ((hour % 24) + 24) % 24;
    if (h >= 5 && h < 8) return 1;    // Fajr / Dawn (05:00 - 08:00)
    if (h >= 8 && h < 11) return 2;   // Mid-Morning (08:00 - 11:00)
    if (h >= 11 && h < 14) return 3;  // High Noon (11:00 - 14:00)
    if (h >= 14 && h < 17) return 4;  // Late Afternoon (14:00 - 17:00)
    if (h >= 17 && h < 19) return 5;  // Sunset (17:00 - 19:00)
    if (h >= 19 && h < 22) return 6;  // Early Night (19:00 - 22:00)
    if (h >= 22 || h < 2) return 7;   // Midnight (22:00 - 02:00)
    return 8;                         // Pre-Dawn (02:00 - 05:00)
  }

  // Determine if a slot is visible under Zen Mode rules
  function isSlotZenVisible(slot) {
    if (!state.zenMode) return true;
    if (state.unlockedZenSlots.has(slot)) return true;

    const baseSlot = state.isLiveMode ? state.liveSlot : state.activeSlot;
    if (slot === baseSlot) return true;

    // Next 6 hours = next 2 slots
    const next1 = (baseSlot % 8) + 1;
    const next2 = ((baseSlot + 1) % 8) + 1;
    if (slot === next1 || slot === next2) return true;

    // Past slots are visible
    if (slot < baseSlot) return true;

    return false; // Distant future beyond 6h masked
  }

  function isSlotPast(slot) {
    const baseSlot = state.isLiveMode ? state.liveSlot : state.activeSlot;
    return slot < baseSlot;
  }

  // Hadith Authenticity Grading Levels:
  // 1: Muttafaqun 'Alayh / Sahih High (Bukhari & Muslim)
  // 2: Sahih (Bukhari, Muslim, Sunan)
  // 3: Hasan / Hasan Sahih
  // 4: Dha'if
  function getHadithGradeLevel(citation) {
    if (!citation || citation.source_type !== "hadith" || !citation.hadith_detail) return 0;
    const grading = (citation.hadith_detail.grading || "").toLowerCase();
    if (grading.includes("muttafaq") || (grading.includes("sahih") && grading.includes("bukhari") && grading.includes("muslim"))) {
      return 1;
    }
    if (grading.includes("hasan sahih") || grading.includes("hasan")) {
      return 3;
    }
    if (grading.includes("daif") || grading.includes("dhaif") || grading.includes("lemah")) {
      return 4;
    }
    if (grading.includes("sahih") || grading.includes("authentic")) {
      return 2;
    }
    return 2; // Default baseline sahih
  }

  const HADITH_GRADE_NAMES = {
    1: "Shahih Tertinggi",
    2: "Shahih",
    3: "Hasan",
    4: "Dha'if"
  };

  // Evaluate if citation matches scriptural source and hadith grade filter
  function isCitationFilterMatched(citation) {
    if (!citation) return false;
    
    // 1. Scriptural source check
    if (state.sourceFilter === "quran" && citation.source_type !== "quran") {
      return false;
    }
    if (state.sourceFilter === "hadith" && citation.source_type !== "hadith") {
      return false;
    }

    // 2. Hadith authenticity range check (if it's a hadith)
    if (citation.source_type === "hadith") {
      const level = getHadithGradeLevel(citation);
      if (level < state.hadithMinGrade || level > state.hadithMaxGrade) {
        return false;
      }
    }

    return true;
  }

  // Calculate Text-Length Metrics (Character count of English translation)
  function getCitationTextLength(citation) {
    if (!citation || !citation.text_en) return 0;
    return citation.text_en.length;
  }

  // Format full scholarly citation for copying
  function formatScholarlyCitation(citation) {
    const isQuran = citation.source_type === "quran";
    let ref = "";
    if (isQuran && citation.quran_detail) {
      ref = `[QS. ${citation.quran_detail.surah_name}: ${citation.quran_detail.ayah}]`;
    } else if (citation.hadith_detail) {
      ref = `[HR. ${citation.hadith_detail.collection} No. ${citation.hadith_detail.hadith_no}, Derajat: ${citation.hadith_detail.grading}]`;
    }

    const trText = state.lang === "id" ? citation.text_id : citation.text_en;
    const explain = state.lang === "id" ? citation.explain_id : citation.explain_en;

    return `"${citation.arabic}"\n\nArtinya:\n"${trText}"\n${ref}\n\nHikmah Fase (${citation.time_range}):\n${explain}\n\nSumber: ${citation.source_url}`;
  }

  // Format seconds to SMPTE Timecode (HH;MM;SS;FF at 29.97 fps)
  function formatSMPTETimecode(hourDecimal) {
    const totalSeconds = Math.max(0, Math.min(86399, hourDecimal * 3600));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const fractionalSeconds = (totalSeconds % 1);
    const frames = Math.floor(fractionalSeconds * 30);

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    const ff = String(frames).padStart(2, "0");
    return `${hh};${mm};${ss};${ff}`;
  }

  // ==========================================================================
  // CLOCK & TIME ENGINE
  // ==========================================================================
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const timeStr = `${hh}:${mm}:${ss}`;

    // Live clock in Mode 8 hub
    if (dom.hubLiveClock) dom.hubLiveClock.textContent = timeStr;

    // Timecode in Premiere
    if (state.isLiveMode && dom.premiereTimecodeDigits) {
      const decHours = hours + minutes / 60 + seconds / 3600;
      dom.premiereTimecodeDigits.textContent = formatSMPTETimecode(decHours);
    }

    // Mode 0 Clock
    if (state.isLiveMode && dom.circle0Clock) {
      dom.circle0Clock.textContent = `${hh}:${mm}`;
    }

    const computedSlot = getSlotFromHour(hours);
    if (computedSlot !== state.liveSlot) {
      state.liveSlot = computedSlot;
      if (state.isLiveMode) {
        setActiveSlot(computedSlot, true);
      }
    }

    // Live sync for Premiere Timeline
    if (state.isLiveMode && state.activeView === "timeline") {
      const currentFraction = (hours + minutes / 60 + seconds / 3600) / 24;
      updatePlayheadPosition(currentFraction * 100);
    }

    // Live sync for Circle 0
    if (state.isLiveMode && state.activeView === "circle0") {
      updateCircle0State();
    }
  }

  // ==========================================================================
  // THEME ENGINE & DYNAMIC SKY ATMOSPHERE
  // ==========================================================================
  // 8 Dynamic Celestial Sky & Sun Atmospheres (for "sky" theme)
  const SKY_ATMOSPHERES = {
    1: { // Pagi / Fajar (Dawn 05:00-08:00) - Sunrise break on eastern horizon
      bg: "radial-gradient(ellipse 130% 90% at 20% 100%, #3a1f18 0%, #1e152d 42%, #0a0d18 100%)",
      glow: "radial-gradient(circle 500px at 20% 95%, rgba(245, 158, 11, 0.32), transparent 70%)",
      glass: "rgba(18, 22, 36, 0.74)"
    },
    2: { // Dhuha (Mid-Morning 08:00-11:00) - Morning solar gold rising
      bg: "radial-gradient(ellipse 120% 85% at 30% 25%, #1d2c42 0%, #101c2e 50%, #090f1a 100%)",
      glow: "radial-gradient(circle 540px at 30% 20%, rgba(234, 179, 8, 0.26), transparent 70%)",
      glass: "rgba(16, 24, 38, 0.74)"
    },
    3: { // Siang Terik / Dzuhur (Noon 11:00-14:00) - High sun zenith azure
      bg: "radial-gradient(ellipse 110% 80% at 50% 0%, #0e345c 0%, #0a213e 50%, #050f1c 100%)",
      glow: "radial-gradient(circle 600px at 50% 5%, rgba(56, 189, 248, 0.32), transparent 70%)",
      glass: "rgba(14, 26, 44, 0.74)"
    },
    4: { // Sore Hari / Ashar (Afternoon 14:00-17:00) - Slanting golden hour / terracotta
      bg: "radial-gradient(ellipse 120% 85% at 75% 40%, #38221b 0%, #1c1526 50%, #0b0c16 100%)",
      glow: "radial-gradient(circle 520px at 75% 40%, rgba(249, 115, 22, 0.28), transparent 70%)",
      glass: "rgba(22, 18, 30, 0.75)"
    },
    5: { // Senja / Maghrib (Sunset 17:00-19:00) - Sunset dusk crimson / twilight rose
      bg: "radial-gradient(ellipse 130% 90% at 85% 100%, #461424 0%, #22102c 45%, #0b0916 100%)",
      glow: "radial-gradient(circle 520px at 85% 95%, rgba(244, 63, 94, 0.35), transparent 70%)",
      glass: "rgba(24, 14, 26, 0.75)"
    },
    6: { // Malam Awal / Isya (Early Night 19:00-22:00) - Indigo blue hour
      bg: "radial-gradient(ellipse 110% 90% at 50% 50%, #111738 0%, #0a0d24 55%, #050712 100%)",
      glow: "radial-gradient(circle 480px at 50% 55%, rgba(99, 102, 241, 0.22), transparent 70%)",
      glass: "rgba(14, 18, 34, 0.76)"
    },
    7: { // Tengah Malam (Midnight 22:00-02:00) - Nocturne violet stillness
      bg: "radial-gradient(ellipse 110% 90% at 50% 75%, #140f26 0%, #0a0914 55%, #04040a 100%)",
      glow: "radial-gradient(circle 460px at 50% 75%, rgba(168, 85, 247, 0.18), transparent 70%)",
      glass: "rgba(14, 12, 24, 0.78)"
    },
    8: { // Sepertiga Malam / Tahajjud (Pre-Dawn 02:00-05:00) - Ethereal mystical teal
      bg: "radial-gradient(ellipse 110% 90% at 30% 85%, #0c232e 0%, #06131b 50%, #03080e 100%)",
      glow: "radial-gradient(circle 480px at 30% 85%, rgba(20, 184, 166, 0.22), transparent 70%)",
      glass: "rgba(12, 20, 26, 0.78)"
    }
  };

  function applyTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem("mct_theme", themeName);
    dom.body.setAttribute("data-theme", themeName);
    dom.themeSelect.value = themeName;
    updateDynamicPhaseColor();
  }

  function updateDynamicPhaseColor() {
    const currentPhaseConfig = PHASES.find(p => p.slot === state.activeSlot) || PHASES[0];
    const accentColor = currentPhaseConfig.color;

    // Both "sky" and "auto" themes dynamically sync accents with active circadian phase
    if (state.theme === "sky" || state.theme === "auto") {
      document.documentElement.style.setProperty("--phase-accent", accentColor);
      document.documentElement.style.setProperty("--phase-accent-glow", accentColor.replace(")", ", 0.35)").replace("hsl", "hsla"));
      document.documentElement.style.setProperty("--phase-accent-subtle", accentColor.replace(")", ", 0.12)").replace("hsl", "hsla"));
    }

    // Dynamic Celestial Sky & Sun Lighting Layer
    if (state.theme === "sky") {
      const sky = SKY_ATMOSPHERES[state.activeSlot] || SKY_ATMOSPHERES[1];
      document.documentElement.style.setProperty("--sky-bg-gradient", sky.bg);
      document.documentElement.style.setProperty("--sky-sun-glow", sky.glow);
      document.documentElement.style.setProperty("--bg-surface-glass", sky.glass);
    } else {
      document.documentElement.style.removeProperty("--sky-bg-gradient");
      document.documentElement.style.removeProperty("--sky-sun-glow");
      document.documentElement.style.removeProperty("--bg-surface-glass");
    }

    updateLandscapeBackdrop();
  }

  // Windows XP Bliss-Style Circadian Landscape Specifications
  const LANDSCAPE_SPECS = {
    1: { // Pagi / Fajar (Dawn) - Sun rising from eastern horizon
      sky: { top: "#0d1326", mid: "#281b33", bottom: "#6e3b26" },
      hills: {
        back: { top: "#2d342f", bottom: "#131a15" },
        mid:  { top: "#3b483c", bottom: "#1a241c" },
        front:{ top: "#4a5948", bottom: "#223024" }
      },
      celestial: {
        type: "sun",
        x: 240, y: 530,
        color: "#fbbf24", glow: "rgba(251, 191, 36, 0.45)",
        radius: 36, hasRays: true
      },
      starsOpacity: 0.15,
      cloudsOpacity: 0.35,
      hazeColor: "rgba(245, 158, 11, 0.12)"
    },
    2: { // Dhuha (Mid-Morning) - Morning solar gold, fresh lush green hills
      sky: { top: "#1e3a63", mid: "#295887", bottom: "#5391bf" },
      hills: {
        back: { top: "#357041", bottom: "#1b4023" },
        mid:  { top: "#468c4d", bottom: "#23542b" },
        front:{ top: "#5ba85a", bottom: "#2c6b32" }
      },
      celestial: {
        type: "sun",
        x: 420, y: 260,
        color: "#fef08a", glow: "rgba(250, 204, 21, 0.5)",
        radius: 40, hasRays: true
      },
      starsOpacity: 0,
      cloudsOpacity: 0.5,
      hazeColor: "rgba(255, 255, 255, 0.08)"
    },
    3: { // Siang Terik / Dzuhur (High Noon) - Zenith brilliant sun, classic Bliss vibrant greens
      sky: { top: "#104c8a", mid: "#206bb5", bottom: "#5aa5e6" },
      hills: {
        back: { top: "#2d753c", bottom: "#184722" },
        mid:  { top: "#3ea34e", bottom: "#1e5e2a" },
        front:{ top: "#52c45f", bottom: "#267533" }
      },
      celestial: {
        type: "sun",
        x: 720, y: 120,
        color: "#ffffff", glow: "rgba(255, 255, 255, 0.65)",
        radius: 44, hasRays: true
      },
      starsOpacity: 0,
      cloudsOpacity: 0.65,
      hazeColor: "rgba(255, 255, 255, 0.12)"
    },
    4: { // Sore Hari / Ashar (Late Afternoon) - Golden hour, warm amber hills
      sky: { top: "#22314d", mid: "#463d59", bottom: "#875747" },
      hills: {
        back: { top: "#425c38", bottom: "#23331d" },
        mid:  { top: "#59753e", bottom: "#2e421e" },
        front:{ top: "#789146", bottom: "#3b5220" }
      },
      celestial: {
        type: "sun",
        x: 1040, y: 320,
        color: "#fdba74", glow: "rgba(251, 146, 60, 0.45)",
        radius: 42, hasRays: true
      },
      starsOpacity: 0,
      cloudsOpacity: 0.45,
      hazeColor: "rgba(249, 115, 22, 0.15)"
    },
    5: { // Senja / Maghrib (Sunset) - Sun sinking into hill ridge, crimson twilight
      sky: { top: "#1b1433", mid: "#4a1939", bottom: "#943831" },
      hills: {
        back: { top: "#302830", bottom: "#161218" },
        mid:  { top: "#3d2a35", bottom: "#1c141a" },
        front:{ top: "#4d2e38", bottom: "#24151b" }
      },
      celestial: {
        type: "sun",
        x: 1200, y: 550,
        color: "#f43f5e", glow: "rgba(244, 63, 94, 0.55)",
        radius: 40, hasRays: false
      },
      starsOpacity: 0.2,
      cloudsOpacity: 0.4,
      hazeColor: "rgba(244, 63, 94, 0.2)"
    },
    6: { // Malam Awal / Isya (Early Night) - Blue hour, crescent moon rising
      sky: { top: "#080c1d", mid: "#121a36", bottom: "#1f2a4f" },
      hills: {
        back: { top: "#182430", bottom: "#0c1218" },
        mid:  { top: "#1e2e3d", bottom: "#0f171f" },
        front:{ top: "#273a4d", bottom: "#141e26" }
      },
      celestial: {
        type: "moon",
        x: 1080, y: 220,
        color: "#e0e7ff", glow: "rgba(199, 210, 254, 0.4)",
        radius: 28, phase: "crescent-waxing"
      },
      starsOpacity: 0.75,
      cloudsOpacity: 0.25,
      hazeColor: "rgba(99, 102, 241, 0.08)"
    },
    7: { // Tengah Malam (Midnight) - Nocturne violet, full moon overhead, starry night
      sky: { top: "#05060d", mid: "#0d0e1e", bottom: "#17152b" },
      hills: {
        back: { top: "#131324", bottom: "#090912" },
        mid:  { top: "#19182e", bottom: "#0c0c17" },
        front:{ top: "#211f3d", bottom: "#100f1f" }
      },
      celestial: {
        type: "moon",
        x: 720, y: 150,
        color: "#f5f3ff", glow: "rgba(216, 180, 254, 0.45)",
        radius: 32, phase: "full"
      },
      starsOpacity: 0.95,
      cloudsOpacity: 0.15,
      hazeColor: "rgba(168, 85, 247, 0.06)"
    },
    8: { // Sepertiga Malam Terakhir / Tahajjud (Pre-Dawn) - Mystical ethereal teal
      sky: { top: "#040912", mid: "#091724", bottom: "#102a3a" },
      hills: {
        back: { top: "#10222a", bottom: "#081115" },
        mid:  { top: "#162d38", bottom: "#0b171c" },
        front:{ top: "#1c3a47", bottom: "#0e1d24" }
      },
      celestial: {
        type: "moon",
        x: 360, y: 280,
        color: "#ccfbf1", glow: "rgba(94, 234, 212, 0.4)",
        radius: 26, phase: "crescent-waning"
      },
      starsOpacity: 0.85,
      cloudsOpacity: 0.2,
      hazeColor: "rgba(20, 184, 166, 0.08)"
    }
  };

  function initStarfield() {
    const starG = document.getElementById("landscape-stars");
    if (!starG || starG.children.length > 0) return;
    for (let i = 0; i < 75; i++) {
      const cx = (Math.random() * 1440).toFixed(1);
      const cy = (Math.random() * 450).toFixed(1);
      const r = (0.7 + Math.random() * 1.5).toFixed(1);
      const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      star.setAttribute("cx", cx);
      star.setAttribute("cy", cy);
      star.setAttribute("r", r);
      star.setAttribute("fill", "#ffffff");
      star.setAttribute("opacity", (0.3 + Math.random() * 0.7).toFixed(2));
      starG.appendChild(star);
    }
  }

  function updateLandscapeBackdrop() {
    const backdrop = document.getElementById("circadian-landscape-backdrop");
    if (!backdrop) return;

    if (state.theme !== "sky" && state.theme !== "auto") {
      backdrop.style.opacity = "0.22";
      backdrop.style.filter = "grayscale(50%)";
      return;
    } else {
      backdrop.style.opacity = "1";
      backdrop.style.filter = "none";
    }

    const spec = LANDSCAPE_SPECS[state.activeSlot] || LANDSCAPE_SPECS[1];

    // 1. Sky Gradient Stops
    const skyTop = document.getElementById("sky-stop-top");
    const skyMid = document.getElementById("sky-stop-mid");
    const skyBottom = document.getElementById("sky-stop-bottom");
    if (skyTop && skyMid && skyBottom) {
      skyTop.setAttribute("stop-color", spec.sky.top);
      skyMid.setAttribute("stop-color", spec.sky.mid);
      skyBottom.setAttribute("stop-color", spec.sky.bottom);
    }

    // 2. Rolling Hill Gradients
    const setGrad = (prefix, hillObj) => {
      const s0 = document.getElementById(`${prefix}-stop-0`);
      const s1 = document.getElementById(`${prefix}-stop-1`);
      if (s0 && s1) {
        s0.setAttribute("stop-color", hillObj.top);
        s1.setAttribute("stop-color", hillObj.bottom);
      }
    };
    setGrad("hill-back", spec.hills.back);
    setGrad("hill-mid", spec.hills.mid);
    setGrad("hill-front", spec.hills.front);

    // 3. Celestial Body (Sun or Moon) with Realistic Radiant Gradient Glow
    const celG = document.getElementById("celestial-body-group");
    if (celG) {
      if (spec.celestial.type === "sun") {
        celG.innerHTML = `
          <!-- Deep outer atmosphere solar aura -->
          <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius * 3.8}" fill="url(#sun-aura-grad)" filter="url(#celestial-glow)" opacity="0.85" />
          <!-- Mid solar corona halo -->
          <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius * 2.0}" fill="url(#sun-aura-grad)" opacity="0.95" />
          <!-- Radiant Sun Body with highlight sphere -->
          <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius}" fill="url(#sun-body-grad)" filter="drop-shadow(0 0 16px rgba(255, 179, 0, 0.8))" />
          <!-- Core specular glow -->
          <circle cx="${spec.celestial.x - spec.celestial.radius * 0.22}" cy="${spec.celestial.y - spec.celestial.radius * 0.25}" r="${spec.celestial.radius * 0.45}" fill="#ffffff" opacity="0.65" />
          ${spec.celestial.hasRays ? `
            <g stroke="#fff176" stroke-width="2.5" opacity="0.6" stroke-linecap="round" filter="drop-shadow(0 0 4px #ffb300)">
              <line x1="${spec.celestial.x}" y1="${spec.celestial.y - spec.celestial.radius - 12}" x2="${spec.celestial.x}" y2="${spec.celestial.y - spec.celestial.radius - 28}" />
              <line x1="${spec.celestial.x}" y1="${spec.celestial.y + spec.celestial.radius + 12}" x2="${spec.celestial.x}" y2="${spec.celestial.y + spec.celestial.radius + 28}" />
              <line x1="${spec.celestial.x - spec.celestial.radius - 12}" y1="${spec.celestial.y}" x2="${spec.celestial.x - spec.celestial.radius - 28}" y2="${spec.celestial.y}" />
              <line x1="${spec.celestial.x + spec.celestial.radius + 12}" y1="${spec.celestial.y}" x2="${spec.celestial.x + spec.celestial.radius + 28}" y2="${spec.celestial.y}" />
            </g>
          ` : ""}
        `;
      } else {
        // Moon with Ethereal Lunar Aura
        celG.innerHTML = `
          <!-- Outer Lunar Ambient Halo -->
          <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius * 3.4}" fill="url(#moon-aura-grad)" filter="url(#celestial-glow)" opacity="0.8" />
          <!-- Mid Lunar Corona -->
          <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius * 1.8}" fill="url(#moon-aura-grad)" opacity="0.85" />
          ${spec.celestial.phase === "full" ? `
            <!-- Full Moon Body -->
            <circle cx="${spec.celestial.x}" cy="${spec.celestial.y}" r="${spec.celestial.radius}" fill="url(#moon-body-grad)" filter="drop-shadow(0 0 14px rgba(224, 231, 255, 0.75))" />
            <!-- Soft Lunar Mare / Craters -->
            <circle cx="${spec.celestial.x - 7}" cy="${spec.celestial.y - 6}" r="5" fill="rgba(71, 85, 105, 0.18)" />
            <circle cx="${spec.celestial.x + 9}" cy="${spec.celestial.y + 8}" r="6.5" fill="rgba(71, 85, 105, 0.15)" />
            <circle cx="${spec.celestial.x + 4}" cy="${spec.celestial.y - 8}" r="4" fill="rgba(71, 85, 105, 0.12)" />
          ` : `
            <!-- Crescent Moon with Radial Shading -->
            <path d="M ${spec.celestial.x} ${spec.celestial.y - spec.celestial.radius} 
                     A ${spec.celestial.radius} ${spec.celestial.radius} 0 0 0 ${spec.celestial.x} ${spec.celestial.y + spec.celestial.radius} 
                     A ${spec.celestial.radius * 0.72} ${spec.celestial.radius} 0 0 1 ${spec.celestial.x} ${spec.celestial.y - spec.celestial.radius} Z" 
                  fill="url(#moon-body-grad)" filter="drop-shadow(0 0 12px rgba(224, 231, 255, 0.8))" />
          `}
        `;
      }
    }

    // 4. Starfield & Clouds Opacity
    const starG = document.getElementById("landscape-stars");
    if (starG) starG.setAttribute("opacity", spec.starsOpacity);

    const clouds = document.getElementById("landscape-clouds");
    if (clouds) clouds.setAttribute("opacity", spec.cloudsOpacity);

    const haze = document.getElementById("landscape-haze");
    if (haze) haze.setAttribute("fill", spec.hazeColor);
  }

  // ==========================================================================
  // VIEW SWITCHER & PANE FOCUS/COLLAPSE ENGINE
  // ==========================================================================
  function setupViewSwitcher() {
    dom.viewSwitcherBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        switchView(view);
      });
    });

    // Restore saved view or default to radial
    switchView(state.activeView);
  }

  function switchView(viewName) {
    state.activeView = viewName;
    localStorage.setItem("mct_active_view", viewName);

    // Update active tab button
    dom.viewSwitcherBtns.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-view") === viewName);
    });

    // Update active view container
    Object.keys(dom.viewContainers).forEach(key => {
      if (dom.viewContainers[key]) {
        dom.viewContainers[key].classList.toggle("active", key === viewName);
      }
    });

    // Render respective view
    if (viewName === "radial") {
      updateRadialDialState();
    } else if (viewName === "circle0") {
      renderCircle0();
    } else if (viewName === "timeline") {
      renderPremiereTimeline();
    } else if (viewName === "calendar") {
      renderGoogleCalendar();
    } else if (viewName === "journey") {
      // window.MCTJourney is provided by src/journey-dist/journey.js (IIFE)
      if (window.MCTJourney) {
        window.MCTJourney.mount(document.getElementById("journey-root"));
      }
    }
  }

  function setupSplitFocusToggles() {
    // Focus Visual Pane (Collapses Data Sheet)
    dom.btnFocusVisual.addEventListener("click", () => {
      if (state.focusMode === "visual") {
        state.focusMode = null;
        dom.splitWorkspace.classList.remove("focus-visual");
        dom.btnFocusVisual.querySelector(".focus-text").textContent = "Fokus Visual";
        dom.btnFocusVisual.querySelector(".focus-icon").textContent = "⤢";
      } else {
        state.focusMode = "visual";
        dom.splitWorkspace.classList.remove("focus-data");
        dom.splitWorkspace.classList.add("focus-visual");
        dom.btnFocusVisual.querySelector(".focus-text").textContent = "Kembalikan Layar";
        dom.btnFocusVisual.querySelector(".focus-icon").textContent = "⤡";
      }
    });

    // Focus Data Sheet Pane (Collapses Visual Instrument)
    dom.btnFocusData.addEventListener("click", () => {
      if (state.focusMode === "data") {
        state.focusMode = null;
        dom.splitWorkspace.classList.remove("focus-data");
        dom.btnFocusData.querySelector(".focus-text").textContent = "Fokus Data";
        dom.btnFocusData.querySelector(".focus-icon").textContent = "⤢";
      } else {
        state.focusMode = "data";
        dom.splitWorkspace.classList.remove("focus-visual");
        dom.splitWorkspace.classList.add("focus-data");
        dom.btnFocusData.querySelector(".focus-text").textContent = "Kembalikan Layar";
        dom.btnFocusData.querySelector(".focus-icon").textContent = "⤡";
      }
    });
  }

  // ==========================================================================
  // VIEW 1: MODE 0 — RADIAL (O = 1 LINGKARAN / SINGLE RING)
  // 0 = O = satu lingkaran donat 8 fase sirkadian.
  // 8 TITIK WAKTU & LABEL = STATIS HORIZONTAL PERMANEN, TIDAK PERNAH BERPUTAR!
  // HANYA JARUM PENUNJUK KNOB SELECTOR YANG BERPUTAR (GAYA MESIN CUCI).
  // ZERO ROTATION PADA LABEL. ANTI-PUSING!
  // ==========================================================================
  function renderRadialDial() {
    if (!dom.radialSvg) return;

    // 1. Radar web rings background
    dom.radarGridGroup.innerHTML = "";
    const gridRadii = [80, 115, 145, 175, 205];
    gridRadii.forEach((r, idx) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
      circle.setAttribute("r", r);
      circle.setAttribute("class", "radar-web-ring");
      if (idx === gridRadii.length - 1) {
        circle.style.stroke = "rgba(255, 255, 255, 0.14)";
        circle.style.strokeDasharray = "3 4";
      }
      dom.radarGridGroup.appendChild(circle);
    });

    // 2. Static 8 Wedges (Fixed compass positions: N, NE, E, SE, S, SW, W, NW)
    dom.dialWedgesGroup.innerHTML = "";
    const outerRadius = 175;
    const innerRadius = 115;
    const segmentAngle = 360 / 8; // 45°

    PHASES.forEach((phase) => {
      const midAngle = FIXED_SLOT_ANGLES[phase.slot];
      const startAngle = midAngle - segmentAngle / 2;
      const endAngle = midAngle + segmentAngle / 2;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = outerRadius * Math.cos(startRad);
      const y1 = outerRadius * Math.sin(startRad);
      const x2 = outerRadius * Math.cos(endRad);
      const y2 = outerRadius * Math.sin(endRad);

      const x3 = innerRadius * Math.cos(endRad);
      const y3 = innerRadius * Math.sin(endRad);
      const x4 = innerRadius * Math.cos(startRad);
      const y4 = innerRadius * Math.sin(startRad);

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}`,
        `Z`
      ].join(" ");

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "dial-segment");
      g.setAttribute("data-slot", phase.slot);
      g.setAttribute("id", `segment-slot-${phase.slot}`);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "rgba(20, 25, 36, 0.85)");
      path.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
      path.setAttribute("stroke-width", "1.5");
      g.appendChild(path);

      // Icon symbol inside static wedge
      const midRad = (midAngle * Math.PI) / 180;
      const iconRadius = (outerRadius + innerRadius) / 2;
      const ix = iconRadius * Math.cos(midRad);
      const iy = iconRadius * Math.sin(midRad);

      const iconNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
      iconNode.setAttribute("x", ix);
      iconNode.setAttribute("y", iy);
      iconNode.setAttribute("text-anchor", "middle");
      iconNode.setAttribute("dominant-baseline", "central");
      iconNode.setAttribute("class", "wedge-icon-symbol");
      iconNode.setAttribute("font-size", "15");
      iconNode.setAttribute("pointer-events", "none");
      iconNode.textContent = phase.icon;
      g.appendChild(iconNode);

      dom.dialWedgesGroup.appendChild(g);

      // Click handler on static wedge
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.hasMovedDial) return;
        handleSegmentClick(phase.slot);
      });
    });

    // 3. Static Spoke Lines & Text-Length Organ Callouts (ZERO TILT, ZERO ROTATION!)
    dom.dialSpokesGroup.innerHTML = "";
    dom.dialLabelsGroup.innerHTML = "";

    PHASES.forEach((phase) => {
      // Spoke Stem Line (variable length based on text length)
      const spoke = document.createElementNS("http://www.w3.org/2000/svg", "line");
      spoke.setAttribute("id", `spoke-slot-${phase.slot}`);
      spoke.setAttribute("class", "radar-spoke-line organ-spoke-stem");
      dom.dialSpokesGroup.appendChild(spoke);

      // Organ Tip Node Circle
      const nodeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      nodeCircle.setAttribute("id", `organ-node-${phase.slot}`);
      nodeCircle.setAttribute("class", "organ-spoke-node");
      nodeCircle.setAttribute("r", "3.5");
      dom.dialSpokesGroup.appendChild(nodeCircle);

      // Organ Callout Capsule Group (Horizontal, Never Tilted)
      const labelG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      labelG.setAttribute("class", "dial-label-item organ-callout-item");
      labelG.setAttribute("data-slot", phase.slot);
      labelG.setAttribute("id", `label-slot-${phase.slot}`);

      // ForeignObject for glassmorphic HTML pill badge
      const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      fo.setAttribute("id", `fo-slot-${phase.slot}`);
      fo.setAttribute("class", "organ-fo");
      fo.innerHTML = `
        <div class="organ-callout-pill" id="pill-slot-${phase.slot}">
          <div class="organ-pill-top">
            <span class="organ-type-tag" id="pill-tag-${phase.slot}"></span>
            <span class="organ-length-badge" id="pill-len-${phase.slot}"></span>
          </div>
          <div class="organ-topic-label" id="pill-topic-${phase.slot}"></div>
        </div>
      `;
      labelG.appendChild(fo);

      dom.dialLabelsGroup.appendChild(labelG);

      // Click handler on static label
      labelG.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.hasMovedDial) return;
        handleSegmentClick(phase.slot);
      });
    });

    // 4. Washing Machine Selector Pointer Needle
    dom.dialPointerNeedleGroup.innerHTML = `
      <g class="knob-pointer-needle" id="knob-pointer-needle" style="transform-origin: 0px 0px;">
        <line x1="0" y1="0" x2="0" y2="-112" class="knob-needle-line" stroke="var(--phase-accent)" stroke-width="3.5" stroke-linecap="round" />
        <polygon points="-7,-100 0,-116 7,-100" class="knob-needle-tip" fill="var(--phase-accent)" />
        <circle cx="0" cy="-116" r="3.5" fill="#fff" />
      </g>
    `;

    updateRadialDialState();
  }

  function updateRadialDialState() {
    if (!dom.radialSvg) return;
    const isZen = state.zenMode;
    const currentCitations = getCitationsForDate(state.selectedDate);

    // Update washing machine selector needle angle to point to active slot
    const targetAngle = FIXED_SLOT_ANGLES[state.activeSlot];
    const needle = document.getElementById("knob-pointer-needle");
    if (needle) {
      // Offset by +90deg because line is pointing up (-90deg neutral)
      needle.style.transformOrigin = "0px 0px";
      needle.style.transform = `rotate(${targetAngle + 90}deg)`;
      needle.style.transition = "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }

    const outerRadius = 175;

    // Calculate length range across current citations for organ spoke scaling
    const lengths = currentCitations
      .filter(c => isCitationFilterMatched(c))
      .map(c => getCitationTextLength(c))
      .filter(l => l > 0);
    const minLen = lengths.length ? Math.min(...lengths) : 35;
    const maxLen = lengths.length ? Math.max(...lengths) : 220;
    const lenRange = Math.max(1, maxLen - minLen);

    PHASES.forEach((phase) => {
      const gWedge = document.getElementById(`segment-slot-${phase.slot}`);
      const spoke = document.getElementById(`spoke-slot-${phase.slot}`);
      const organNode = document.getElementById(`organ-node-${phase.slot}`);
      const labelG = document.getElementById(`label-slot-${phase.slot}`);
      const fo = document.getElementById(`fo-slot-${phase.slot}`);
      const pill = document.getElementById(`pill-slot-${phase.slot}`);
      const pillTag = document.getElementById(`pill-tag-${phase.slot}`);
      const pillTopic = document.getElementById(`pill-topic-${phase.slot}`);
      const pillLen = document.getElementById(`pill-len-${phase.slot}`);
      if (!gWedge || !spoke || !labelG) return;

      const path = gWedge.querySelector("path");
      const iconNode = gWedge.querySelector(".wedge-icon-symbol");
      const isCurrentActive = phase.slot === state.activeSlot;
      const isVisible = isSlotZenVisible(phase.slot);
      const isPast = isSlotPast(phase.slot);
      const citation = currentCitations.find(c => c.slot === phase.slot);
      const isFilterMatched = isCitationFilterMatched(citation);

      // Reset classes
      gWedge.classList.remove("active", "is-zen-masked", "is-past", "is-filtered-out");
      spoke.classList.remove("active", "is-filtered-out");
      if (organNode) organNode.classList.remove("active", "is-filtered-out");
      labelG.classList.remove("active", "is-zen-masked", "is-past", "is-filtered-out");
      if (pill) pill.classList.remove("active", "is-zen-masked", "is-past", "is-filtered-out");

      if (isCurrentActive) {
        gWedge.classList.add("active");
        spoke.classList.add("active");
        labelG.classList.add("active");
        if (pill) pill.classList.add("active");
        if (path) {
          path.setAttribute("fill", phase.color.replace(")", ", 0.28)").replace("hsl", "hsla"));
          path.setAttribute("stroke", phase.color);
          path.setAttribute("stroke-width", "2.5");
        }
      } else {
        if (path) {
          path.setAttribute("fill", "rgba(20, 25, 36, 0.45)");
          path.setAttribute("stroke", "rgba(255, 255, 255, 0.08)");
          path.setAttribute("stroke-width", "1.2");
        }
      }

      if (!isVisible && isZen) {
        gWedge.classList.add("is-zen-masked");
        labelG.classList.add("is-zen-masked");
        if (pill) pill.classList.add("is-zen-masked");
      } else if (isPast) {
        gWedge.classList.add("is-past");
        labelG.classList.add("is-past");
      }

      // Calculate Organ Stem Extension Radius based on English text character count
      const textLen = citation ? getCitationTextLength(citation) : 0;
      let ratio = 0.2;
      if (isFilterMatched && textLen > 0) {
        ratio = Math.max(0, Math.min(1, (textLen - minLen) / lenRange));
      }
      // Spoke extends from base 184px up to 238px
      const spokeRadius = isFilterMatched ? (184 + Math.round(ratio * 54)) : 180;

      const midAngle = FIXED_SLOT_ANGLES[phase.slot];
      const rad = (midAngle * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const x1 = outerRadius * cosA;
      const y1 = outerRadius * sinA;
      const x2 = spokeRadius * cosA;
      const y2 = spokeRadius * sinA;

      spoke.setAttribute("x1", x1);
      spoke.setAttribute("y1", y1);
      spoke.setAttribute("x2", x2);
      spoke.setAttribute("y2", y2);

      if (organNode) {
        organNode.setAttribute("cx", x2);
        organNode.setAttribute("cy", y2);
        organNode.setAttribute("fill", isCurrentActive ? phase.color : "rgba(255, 255, 255, 0.4)");
      }

      // Position ForeignObject Capsule at Spoke Tip
      if (fo) {
        const foW = 210;
        const foH = 52;
        let foX = 0;
        let foY = 0;

        if (cosA > 0.35) {
          // East / North-East / South-East -> Pill to the right
          foX = x2 + 8;
          foY = y2 - foH / 2;
        } else if (cosA < -0.35) {
          // West / North-West / South-West -> Pill to the left
          foX = x2 - 8 - foW;
          foY = y2 - foH / 2;
        } else {
          // Siang (North) or Tengah Malam (South)
          foX = x2 - foW / 2;
          foY = sinA < 0 ? (y2 - foH - 8) : (y2 + 8);
        }

        fo.setAttribute("x", Math.round(foX));
        fo.setAttribute("y", Math.round(foY));
        fo.setAttribute("width", foW);
        fo.setAttribute("height", foH);
      }

      // Icon display
      if (iconNode) {
        if (state.iconMode === "celestial") {
          iconNode.textContent = phase.icon;
          iconNode.style.display = "block";
        } else if (state.iconMode === "clock") {
          iconNode.textContent = phase.range.split("-")[0];
          iconNode.style.display = "block";
        } else {
          iconNode.style.display = "none";
        }
      }

      // Organ Capsule Content
      if (!isFilterMatched) {
        // Ghost wireframe state
        gWedge.classList.add("is-filtered-out");
        spoke.classList.add("is-filtered-out");
        if (organNode) organNode.classList.add("is-filtered-out");
        labelG.classList.add("is-filtered-out");
        if (pill) pill.classList.add("is-filtered-out");

        if (pillTag) {
          pillTag.className = "organ-type-tag";
          pillTag.textContent = "TERFILTER";
        }
        if (pillTopic) {
          pillTopic.textContent = state.lang === "id" ? phase.name_id : phase.name_en;
        }
        if (pillLen) {
          pillLen.textContent = "—";
        }
      } else if (!isVisible && isZen) {
        // Zen masked state
        if (pillTag) {
          pillTag.className = "organ-type-tag";
          pillTag.textContent = "TERKUNCI";
        }
        if (pillTopic) {
          pillTopic.textContent = "···";
        }
        if (pillLen) {
          pillLen.textContent = phase.range;
        }
      } else {
        // Normal active state with citation data
        const isQuran = citation && citation.source_type === "quran";
        const gradeLvl = getHadithGradeLevel(citation);
        const gradeName = isQuran ? "QUR'AN" : (HADITH_GRADE_NAMES[gradeLvl] || "HADITS");

        if (pillTag) {
          pillTag.className = `organ-type-tag ${isQuran ? "quran" : "hadith"}`;
          pillTag.textContent = gradeName;
        }

        if (pillTopic) {
          const topicStr = citation 
            ? (state.lang === "id" ? citation.topic_id : citation.topic_en)
            : (state.lang === "id" ? phase.name_id : phase.name_en);
          pillTopic.textContent = topicStr;
          pillTopic.title = topicStr;
        }

        if (pillLen) {
          pillLen.textContent = `${textLen} ch`;
          pillLen.title = `Panjang naskah: ${textLen} karakter English`;
        }
      }

      if (pill) {
        pill.style.display = state.showLabels ? "inline-flex" : "none";
      }
    });

    // Update Central Hub
    const activePhase = PHASES.find(p => p.slot === state.activeSlot) || PHASES[0];
    dom.hubPhaseTitle.textContent = state.lang === "id" ? activePhase.name_id : activePhase.name_en;
    dom.hubPhaseRange.textContent = activePhase.range;

    if (state.isLiveMode) {
      dom.hubModeBadge.className = "hub-status-badge live";
      dom.hubModeBadge.textContent = "● LIVE";
      dom.backToNowBtn.style.display = "none";
    } else {
      dom.hubModeBadge.className = "hub-status-badge scrubbed";
      dom.hubModeBadge.textContent = "◌ SCRUBBED";
      dom.backToNowBtn.style.display = "flex";
    }

    updateDynamicPhaseColor();
  }

  // Dial Gestures for Mode 8 Washing Machine Selector
  function setupWashingMachineGestures() {
    const dial = dom.radialDialWrapper;
    if (!dial) return;

    function getSlotFromPointer(e) {
      const rect = dial.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const rad = Math.atan2(clientY - centerY, clientX - centerX);
      let deg = (rad * 180) / Math.PI;

      // Normalize so North (top/-90°) is 0, then offset by +2 slots so slot 3 maps to top
      let normalized = (deg + 90 + 360) % 360;
      let slotIdx = (Math.round(normalized / 45) + 2) % 8;
      return slotIdx + 1;
    }

    function onPointerDown(e) {
      if (e.target.closest("#dial-center-hub") || e.target.closest("#back-to-now-btn")) return;
      state.isDraggingDial = true;
      state.hasMovedDial = false;
      const slot = getSlotFromPointer(e);
      if (slot !== state.activeSlot) {
        state.hasMovedDial = true;
        setActiveSlot(slot, false);
        if (navigator.vibrate) navigator.vibrate(8);
      }
    }

    function onPointerMove(e) {
      if (!state.isDraggingDial) return;
      const slot = getSlotFromPointer(e);
      if (slot !== state.activeSlot) {
        state.hasMovedDial = true;
        setActiveSlot(slot, false);
        if (navigator.vibrate) navigator.vibrate(8);
      }
    }

    function onPointerUp() {
      state.isDraggingDial = false;
    }

    dial.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    dial.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  }

  // ==========================================================================
  // VIEW 2: MODE 8 — DUAL RING SIDE BY SIDE (oo)
  // 8 = oo = DUA LINGKARAN BERDAMPINGAN HORIZONTAL
  // o kiri  = AM ring (00:00–12:00): Fajar, Dhuha, Dzuhur, Sepertiga Malam (late)
  // o kanan = PM ring (12:00–24:00): Ashar, Maghrib, Isya, Tengah Malam
  // Kedua ring dirender SEKALIGUS di layar — bukan bergantian.
  // ==========================================================================
  function renderCircle0() {
    const amSvg  = document.getElementById("ring8-am-svg");
    const pmSvg  = document.getElementById("ring8-pm-svg");
    if (!amSvg || !pmSvg) return;

    const currentCitations = getCitationsForDate(state.selectedDate);
    const R = 110;   // ring radius
    const TICK_OUT = 124;
    const TICK_IN  = 116;

    // ---- Helper: render one 12-hour ring into an SVG ----
    function renderOneRing(svg, isAM) {
      const ticksG  = svg.querySelector("g:nth-child(1)");
      const nodesG  = svg.querySelector("g:nth-child(2)");
      const handG   = svg.querySelector("g:nth-child(3)");
      if (!ticksG || !nodesG || !handG) return;
      ticksG.innerHTML = "";
      nodesG.innerHTML = "";
      handG.innerHTML  = "";

      // Background track circle
      const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      track.setAttribute("cx", "0"); track.setAttribute("cy", "0");
      track.setAttribute("r", R);
      track.setAttribute("fill", "none");
      track.setAttribute("stroke", isAM ? "rgba(255,200,80,0.25)" : "rgba(120,160,255,0.22)");
      track.setAttribute("stroke-width", "18");
      ticksG.appendChild(track);

      // Subtle inner fill glow
      const fill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      fill.setAttribute("cx", "0"); fill.setAttribute("cy", "0");
      fill.setAttribute("r", R - 12);
      fill.setAttribute("fill", isAM ? "rgba(255,200,80,0.04)" : "rgba(100,140,255,0.04)");
      ticksG.appendChild(fill);

      // Hour ticks + labels (12 positions on each ring)
      for (let h = 0; h < 12; h++) {
        const deg = h * 30;
        const rad = ((deg - 90) * Math.PI) / 180;
        const isCard = deg % 90 === 0; // cardinal tick

        // Tick mark
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", (isCard ? TICK_IN - 4 : TICK_IN) * Math.cos(rad));
        tick.setAttribute("y1", (isCard ? TICK_IN - 4 : TICK_IN) * Math.sin(rad));
        tick.setAttribute("x2", TICK_OUT * Math.cos(rad));
        tick.setAttribute("y2", TICK_OUT * Math.sin(rad));
        tick.setAttribute("stroke", isCard ? (isAM ? "#ffc840" : "#8ab0ff") : "rgba(255,255,255,0.28)");
        tick.setAttribute("stroke-width", isCard ? "2.5" : "1.2");
        ticksG.appendChild(tick);

        // Hour label (AM: 12,1,2..11 → PM: 12,13,14..23)
        const hourNum = h === 0 ? 12 : h;
        const label   = isAM ? `${hourNum}` : `${h === 0 ? "24" : h + 12}`;
        const lRad = rad;
        const lx = 96 * Math.cos(lRad);
        const ly = 96 * Math.sin(lRad);
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", lx); txt.setAttribute("y", ly);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("dominant-baseline", "central");
        txt.setAttribute("fill", isCard ? (isAM ? "#ffc840" : "#8ab0ff") : "rgba(255,255,255,0.55)");
        txt.setAttribute("font-size", isCard ? "13" : "10");
        txt.setAttribute("font-weight", isCard ? "800" : "600");
        txt.setAttribute("font-family", "var(--font-ui)");
        txt.textContent = label;
        ticksG.appendChild(txt);
      }

      // Citation nodes — only phases belonging to this ring
      PHASES.forEach(phase => {
        // Which ring does this phase belong to?
        const belongsAM = (phase.slot === 1 || phase.slot === 2 || phase.slot === 8);
        const belongsPM = (phase.slot === 3 || phase.slot === 4 || phase.slot === 5 || phase.slot === 6 || phase.slot === 7);
        if (isAM && !belongsAM) return;
        if (!isAM && !belongsPM) return;

        const isActive  = phase.slot === state.activeSlot;
        const isVisible = isSlotZenVisible(phase.slot);

        // Convert phase time to angle on 12h ring
        let midH = phase.slot === 7
          ? (isAM ? 0 : 23.5)   // Midnight near 12 on PM ring (23:30)
          : (phase.startHour + phase.endHour) / 2;

        // Slot 3 (Dzuhur) starts PM: clamp to PM ring
        if (phase.slot === 3) midH = Math.max(midH, 12); // ensure it's on PM ring

        const hour12 = midH % 12;
        const nodeDeg = hour12 * 30;
        const nodeRad = ((nodeDeg - 90) * Math.PI) / 180;
        const nx = R * Math.cos(nodeRad);
        const ny = R * Math.sin(nodeRad);

        const nodeG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        nodeG.setAttribute("class", `ring8-node ${isActive ? "ring8-node-active" : ""}`);
        nodeG.setAttribute("data-slot", phase.slot);
        nodeG.style.cursor = "pointer";

        // Outer halo
        const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        halo.setAttribute("cx", nx); halo.setAttribute("cy", ny);
        halo.setAttribute("r", isActive ? "15" : "10");
        halo.setAttribute("fill", phase.color);
        halo.setAttribute("opacity", isActive ? "0.95" : "0.58");
        if (isActive) {
          halo.setAttribute("stroke", "#ffffff");
          halo.setAttribute("stroke-width", "2");
        }
        nodeG.appendChild(halo);

        // Icon
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "text");
        icon.setAttribute("x", nx); icon.setAttribute("y", ny);
        icon.setAttribute("text-anchor", "middle");
        icon.setAttribute("dominant-baseline", "central");
        icon.setAttribute("font-size", isActive ? "11" : "8");
        icon.setAttribute("pointer-events", "none");
        icon.textContent = isVisible ? phase.icon : "···";
        nodeG.appendChild(icon);

        nodeG.addEventListener("click", (e) => {
          e.stopPropagation();
          handleSegmentClick(phase.slot);
          updateMode8DualRingState();
        });

        nodesG.appendChild(nodeG);
      });

      // Rotating hand — point to current time for this ring
      const now = new Date();
      const h   = now.getHours();
      const m   = now.getMinutes();
      // AM ring: active when h<12; PM ring: active when h>=12
      const ringIsActive = isAM ? (h < 12) : (h >= 12);
      const hand12H = isAM
        ? (h < 12 ? h + m / 60 : 0)
        : (h >= 12 ? (h - 12) + m / 60 : 0);
      const handAngle = hand12H * 30;
      const handRad = ((handAngle - 90) * Math.PI) / 180;
      const handTipX = (R - 10) * Math.cos(handRad);
      const handTipY = (R - 10) * Math.sin(handRad);

      const handColor = isAM ? "#ffc840" : "#8ab0ff";
      handG.innerHTML = `
        <circle cx="0" cy="0" r="7" fill="${handColor}" opacity="${ringIsActive ? "0.9" : "0.25"}" />
        <circle cx="0" cy="0" r="3.5" fill="#fff" />
        <line x1="0" y1="0" x2="${handTipX}" y2="${handTipY}"
          stroke="${handColor}" stroke-width="${ringIsActive ? 3 : 1.5}"
          stroke-linecap="round"
          opacity="${ringIsActive ? 1 : 0.3}"
        />
        <circle cx="${handTipX}" cy="${handTipY}" r="${ringIsActive ? 4 : 2}"
          fill="${handColor}" opacity="${ringIsActive ? 0.9 : 0.25}" />
      `;
    }

    // Render both rings simultaneously
    renderOneRing(amSvg, true);
    renderOneRing(pmSvg, false);

    updateMode8DualRingState();
    setupMode8Gestures();
  }

  // Update the digital readout hubs on both rings
  function updateCircle0State() {
    updateMode8DualRingState();
  }

  function updateMode8DualRingState() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const mm = String(m).padStart(2, "0");

    const amTimeEl  = document.getElementById("ring8-am-time");
    const amPhaseEl = document.getElementById("ring8-am-phase");
    const pmTimeEl  = document.getElementById("ring8-pm-time");
    const pmPhaseEl = document.getElementById("ring8-pm-phase");
    const amPanel   = document.getElementById("ring8-am-panel");
    const pmPanel   = document.getElementById("ring8-pm-panel");

    const activePhase = PHASES.find(p => p.slot === state.activeSlot) || PHASES[0];
    const phaseName   = state.lang === "id" ? activePhase.name_id : activePhase.name_en;

    if (state.isLiveMode) {
      if (h < 12) {
        // Live: AM is now
        if (amTimeEl) amTimeEl.textContent = `${String(h).padStart(2,"0")}:${mm}`;
        if (amPhaseEl) amPhaseEl.textContent = `${activePhase.icon} ${phaseName}`;
        if (pmTimeEl) pmTimeEl.textContent = "—";
        if (pmPhaseEl) pmPhaseEl.textContent = "Waktu PM";
      } else {
        // Live: PM is now
        if (pmTimeEl) pmTimeEl.textContent = `${String(h).padStart(2,"0")}:${mm}`;
        if (pmPhaseEl) pmPhaseEl.textContent = `${activePhase.icon} ${phaseName}`;
        if (amTimeEl) amTimeEl.textContent = "—";
        if (amPhaseEl) amPhaseEl.textContent = "Waktu AM";
      }
    } else {
      // Scrub mode: show active phase on correct ring
      const belongsAM = (activePhase.slot === 1 || activePhase.slot === 2 || activePhase.slot === 8);
      if (belongsAM) {
        if (amTimeEl) amTimeEl.textContent = activePhase.range.split("-")[0].trim();
        if (amPhaseEl) amPhaseEl.textContent = `${activePhase.icon} ${phaseName}`;
        if (pmTimeEl) pmTimeEl.textContent = "—";
        if (pmPhaseEl) pmPhaseEl.textContent = "";
      } else {
        if (pmTimeEl) pmTimeEl.textContent = activePhase.range.split("-")[0].trim();
        if (pmPhaseEl) pmPhaseEl.textContent = `${activePhase.icon} ${phaseName}`;
        if (amTimeEl) amTimeEl.textContent = "—";
        if (amPhaseEl) amPhaseEl.textContent = "";
      }
    }

    // Highlight which ring is "now"
    const nowIsAM = new Date().getHours() < 12;
    if (amPanel) amPanel.classList.toggle("is-active-ring", nowIsAM);
    if (pmPanel) pmPanel.classList.toggle("is-active-ring", !nowIsAM);
  }

  // Click on either ring SVG background to scrub
  function setupCircle0Gestures() {
    setupMode8Gestures();
  }

  let _mode8GesturesSetup = false;
  function setupMode8Gestures() {
    if (_mode8GesturesSetup) return;
    _mode8GesturesSetup = true;

    function scrubRing(svg, isAM, clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rad = Math.atan2(clientY - cy, clientX - cx);
      let angle = ((rad * 180) / Math.PI + 90 + 360) % 360;
      const hours12 = (angle / 360) * 12;
      const total24H = isAM ? hours12 : 12 + hours12;
      const slot = getSlotFromHour(Math.floor(total24H));
      if (slot !== state.activeSlot) {
        setActiveSlot(slot, false);
        state.isLiveMode = false;
        if (navigator.vibrate) navigator.vibrate(8);
        updateMode8DualRingState();
      }
    }

    ["ring8-am-svg", "ring8-pm-svg"].forEach(id => {
      const svg = document.getElementById(id);
      if (!svg) return;
      const isAM = id.includes("am");

      svg.addEventListener("click", (e) => {
        scrubRing(svg, isAM, e.clientX, e.clientY);
      });

      let dragging = false;
      svg.addEventListener("mousedown",  (e) => { dragging = true; scrubRing(svg, isAM, e.clientX, e.clientY); });
      window.addEventListener("mousemove", (e) => { if (dragging) scrubRing(svg, isAM, e.clientX, e.clientY); });
      window.addEventListener("mouseup",   ()  => { dragging = false; });

      svg.addEventListener("touchstart", (e) => { e.preventDefault(); dragging = true; scrubRing(svg, isAM, e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      window.addEventListener("touchmove", (e) => { if (dragging) scrubRing(svg, isAM, e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
      window.addEventListener("touchend",  ()  => { dragging = false; });
    });
  }

  // ==========================================================================
  // VIEW 3: TIMELINE LIKE PREMIERE PRO VIDEO EDITOR
  // Authentic Adobe Premiere Pro NLE Panel with:
  // - Sequence tab header & tools ribbon (V, A, B, C, H, 🧲)
  // - SMPTE timecode (00;08;24;15 at 29.97 fps)
  // - Track headers (V2, V1, A1, A2) with Target, Eye, Lock, Mute, Solo
  // - Track V1 colored clips with labels, duration timecodes, and topics
  // - Track A1 audio waveform visualization
  // - Draggable CTI Playhead with magnetic snapping to cuts
  // - Bottom zoom navigator scrollbar
  // ==========================================================================
  function renderPremiereTimeline() {
    if (!dom.premiereTracksBoard) return;
    const currentCitations = getCitationsForDate(state.selectedDate);

    // 1. Build Pixel Time Ruler (ticks every 2 hours with half-hour subdivisions)
    dom.premiereRuler.innerHTML = "";
    for (let h = 0; h < 24; h += 2) {
      const tickItem = document.createElement("div");
      tickItem.className = "pr-ruler-tick-item";
      tickItem.textContent = `${String(h).padStart(2, "0")}:00:00:00`;
      dom.premiereRuler.appendChild(tickItem);
    }

    // 2. Build Track V1 (Colored Premiere Pro Citation Clips)
    dom.premiereCitationsLane.innerHTML = "";
    PHASES.forEach(phase => {
      const citation = currentCitations.find(c => c.slot === phase.slot);
      const isVisible = isSlotZenVisible(phase.slot);
      const isCurrentActive = phase.slot === state.activeSlot;
      const isQuran = citation && citation.source_type === "quran";

      // Calculate width and duration:
      let startH = phase.startHour;
      let endH = phase.endHour;
      let durationH = endH > startH ? endH - startH : (24 - startH + endH);
      let widthPercent = (durationH / 24) * 100;

      const clip = document.createElement("div");
      clip.className = `premiere-clip-block ${isCurrentActive ? "active" : ""}`;
      clip.style.width = `${widthPercent}%`;
      clip.setAttribute("data-slot", phase.slot);

      // Premiere NLE clip colors
      const colorScheme = PREMIERE_CLIP_COLORS[phase.slot] || { bg: "#2388ee", border: "#fff" };
      clip.style.background = `linear-gradient(180deg, ${colorScheme.bg} 0%, rgba(20, 20, 20, 0.95) 100%)`;
      clip.style.borderTop = `3px solid ${colorScheme.border}`;

      const phaseName = state.lang === "id" ? phase.name_id : phase.name_en;
      let topic = citation ? (state.lang === "id" ? citation.topic_id : citation.topic_en) : "";

      if (!isVisible && state.zenMode) {
        clip.innerHTML = `
          <div class="pr-clip-header">
            <span class="pr-clip-label">${phase.icon} ${phaseName}</span>
            <span class="pr-clip-duration">${phase.range}</span>
          </div>
          <div class="pr-clip-preview" style="opacity: 0.35;">···</div>
        `;
      } else {
        clip.innerHTML = `
          <div class="pr-clip-header">
            <span class="pr-clip-label">${phase.icon} ${phaseName}</span>
            <span class="pr-clip-duration">${phase.range}</span>
          </div>
          <div class="pr-clip-preview">${topic || phase.range}</div>
        `;
      }

      clip.addEventListener("click", () => {
        handleSegmentClick(phase.slot);
      });

      dom.premiereCitationsLane.appendChild(clip);
    });

    // 3. Build Track A1 (Audio Waveforms)
    dom.premiereAmbientLane.innerHTML = "";
    PHASES.forEach(phase => {
      let startH = phase.startHour;
      let endH = phase.endHour;
      let durationH = endH > startH ? endH - startH : (24 - startH + endH);
      let widthPercent = (durationH / 24) * 100;

      const audioBlock = document.createElement("div");
      audioBlock.className = "pr-audio-clip-block";
      audioBlock.style.width = `${widthPercent}%`;
      audioBlock.style.opacity = phase.slot === state.activeSlot ? "0.95" : "0.55";

      // Generate SVG audio waveform peaks
      let waveBars = "";
      const numBars = Math.max(10, Math.floor(durationH * 7));
      for (let i = 0; i < numBars; i++) {
        // Pseudo-random but deterministic waveform height based on phase
        const amp = 10 + Math.sin((i + phase.slot * 3) * 0.7) * 8 + Math.cos(i * 1.3) * 6;
        const xPos = (i / numBars) * 100;
        waveBars += `<line x1="${xPos}%" y1="${27 - amp}" x2="${xPos}%" y2="${27 + amp}" stroke="var(--phase-accent)" stroke-width="1.8" stroke-linecap="round" />`;
      }

      audioBlock.innerHTML = `
        <svg class="pr-audio-waveform-svg" viewBox="0 0 100 54" preserveAspectRatio="none">
          <line x1="0" y1="27" x2="100" y2="27" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1" />
          ${waveBars}
        </svg>
      `;

      dom.premiereAmbientLane.appendChild(audioBlock);
    });

    // 4. Update Playhead position
    if (state.isLiveMode) {
      const now = new Date();
      const decHours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
      updatePlayheadPosition((decHours / 24) * 100);
      if (dom.premiereTimecodeDigits) dom.premiereTimecodeDigits.textContent = formatSMPTETimecode(decHours);
    } else {
      const activePhase = PHASES.find(p => p.slot === state.activeSlot) || PHASES[0];
      const centerHour = activePhase.startHour < activePhase.endHour 
        ? (activePhase.startHour + activePhase.endHour) / 2 
        : ((activePhase.startHour + (activePhase.endHour + 24)) / 2) % 24;
      updatePlayheadPosition((centerHour / 24) * 100);
      if (dom.premiereTimecodeDigits) dom.premiereTimecodeDigits.textContent = formatSMPTETimecode(centerHour);
    }
  }

  function updatePlayheadPosition(percent) {
    if (!dom.premierePlayhead) return;
    percent = Math.max(0, Math.min(100, percent));
    dom.premierePlayhead.style.left = `${percent}%`;
  }

  function setupPremiereTimelineGestures() {
    const board = dom.premiereTracksBoard;
    if (!board) return;

    // Magnet snapping helper (find nearest phase boundary)
    const clipCutPercents = [0];
    let cumulative = 0;
    PHASES.forEach(p => {
      let dur = p.endHour > p.startHour ? p.endHour - p.startHour : (24 - p.startHour + p.endHour);
      cumulative += (dur / 24) * 100;
      clipCutPercents.push(cumulative);
    });

    function scrubTimeline(clientX) {
      const rect = board.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      let percent = (relativeX / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));

      // Snap to cut points if Magnet tool is ON
      if (state.snapEnabled) {
        for (const cut of clipCutPercents) {
          if (Math.abs(percent - cut) < 1.4) {
            percent = cut;
            break;
          }
        }
      }

      updatePlayheadPosition(percent);

      // Convert percentage to hours (0 - 24)
      const hourDecimal = (percent / 100) * 24;
      const targetSlot = getSlotFromHour(Math.floor(hourDecimal));

      if (targetSlot !== state.activeSlot) {
        setActiveSlot(targetSlot, false);
        if (navigator.vibrate) navigator.vibrate(8);
      }

      // Update SMPTE Timecode display
      if (dom.premiereTimecodeDigits) {
        dom.premiereTimecodeDigits.textContent = formatSMPTETimecode(hourDecimal);
      }
    }

    function onTimelineDown(e) {
      state.isDraggingPlayhead = true;
      scrubTimeline(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onTimelineMove(e) {
      if (!state.isDraggingPlayhead) return;
      scrubTimeline(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onTimelineUp() {
      state.isDraggingPlayhead = false;
    }

    board.addEventListener("mousedown", onTimelineDown);
    window.addEventListener("mousemove", onTimelineMove);
    window.addEventListener("mouseup", onTimelineUp);

    board.addEventListener("touchstart", onTimelineDown, { passive: false });
    window.addEventListener("touchmove", onTimelineMove, { passive: false });
    window.addEventListener("touchend", onTimelineUp);

    // Transport buttons
    if (dom.btnTlPrev) {
      dom.btnTlPrev.addEventListener("click", () => {
        const prevSlot = state.activeSlot === 1 ? 8 : state.activeSlot - 1;
        setActiveSlot(prevSlot, false);
      });
    }

    if (dom.btnTlNext) {
      dom.btnTlNext.addEventListener("click", () => {
        const nextSlot = state.activeSlot === 8 ? 1 : state.activeSlot + 1;
        setActiveSlot(nextSlot, false);
      });
    }

    if (dom.btnTlLive) {
      dom.btnTlLive.addEventListener("click", () => {
        setActiveSlot(state.liveSlot, true);
        showToast("Terkunci ke Live CTI Playhead", "⏱️");
      });
    }

    // Magnet Snap toggle
    if (dom.prMagnetBtn) {
      dom.prMagnetBtn.addEventListener("click", () => {
        state.snapEnabled = !state.snapEnabled;
        dom.prMagnetBtn.classList.toggle("active", state.snapEnabled);
        showToast(state.snapEnabled ? "Magnet Snap: ON (Menempel pada batas klip)" : "Magnet Snap: OFF", "🧲");
      });
    }
  }

  // ==========================================================================
  // VIEW 4: GOOGLE CALENDAR SCHEDULE GRID
  // ==========================================================================
  function renderGoogleCalendar() {
    if (!dom.calendarDayGrid) return;
    dom.calendarDayGrid.innerHTML = "";
    const currentCitations = getCitationsForDate(state.selectedDate);

    // Header date display
    if (dom.calTodayTitle) {
      dom.calTodayTitle.textContent = state.selectedDate === "2026-10-05" 
        ? "Hari Ini — Senin, 05 Oktober 2026" 
        : (state.selectedDate === "2026-10-04" ? "Kemarin — Minggu, 04 Oktober 2026" : "Besok — Selasa, 06 Oktober 2026");
    }

    PHASES.forEach(phase => {
      const citation = currentCitations.find(c => c.slot === phase.slot);
      const isVisible = isSlotZenVisible(phase.slot);
      const isCurrentActive = phase.slot === state.activeSlot;
      const isQuran = citation && citation.source_type === "quran";

      const row = document.createElement("div");
      row.className = "cal-time-row";

      const phaseName = state.lang === "id" ? phase.name_id : phase.name_en;
      const topicText = citation ? (state.lang === "id" ? citation.topic_id : citation.topic_en) : "";
      const arabicSnippet = citation ? citation.arabic : "";

      row.innerHTML = `
        <div class="cal-hour-label">${phase.range.split("-")[0]}</div>
        <div class="cal-event-card ${isCurrentActive ? "active" : ""}" style="border-left-color: ${phase.color};">
          <div class="cal-event-title-wrap">
            <div class="cal-event-name">
              <span>${phase.icon}</span> 
              <span>${phaseName}</span>
              ${citation ? `<span class="col-type-tag ${isQuran ? 'quran' : 'hadith'}" style="margin-left:6px;">${isQuran ? "Qur'an" : "Hadits"}</span>` : ""}
            </div>
            <div class="cal-event-topic">${!isVisible && state.zenMode ? "···" : topicText}</div>
          </div>
          ${!isVisible && state.zenMode ? "" : `<div class="cal-event-arabic">${arabicSnippet}</div>`}
        </div>
      `;

      row.addEventListener("click", () => {
        handleSegmentClick(phase.slot);
      });

      dom.calendarDayGrid.appendChild(row);
    });
  }

  // ==========================================================================
  // SEGMENT CLICK & ZEN DIALOGUE
  // ==========================================================================
  function handleSegmentClick(slot) {
    const isVisible = isSlotZenVisible(slot);
    if (!isVisible && state.zenMode) {
      const phase = PHASES.find(p => p.slot === slot);
      const phaseName = state.lang === "id" ? phase.name_id : phase.name_en;
      
      const confirmReveal = confirm(
        `🍃 Zen Mode Aktif\n\nFase "${phaseName}" (${phase.range}) berada lebih dari 6 jam di masa depan untuk mencegah spoiler hikmah.\n\nApakah Anda ingin membuka segmen ini sekarang?`
      );

      if (confirmReveal) {
        state.unlockedZenSlots.add(slot);
        setActiveSlot(slot, false);
        openInspector(slot);
      }
      return;
    }

    setActiveSlot(slot, false);
    openInspector(slot);
  }

  function setActiveSlot(slot, isLive = false) {
    state.activeSlot = slot;
    state.isLiveMode = isLive;

    updateRadialDialState();
    renderDataSheet();

    if (state.activeView === "circle0") {
      updateCircle0State();
    } else if (state.activeView === "timeline") {
      renderPremiereTimeline();
    } else if (state.activeView === "calendar") {
      renderGoogleCalendar();
    }
  }

  // ==========================================================================
  // DATA SHEET LENS (EXCEL-STYLE TABLE)
  // ==========================================================================
  function getCitationsForDate(dateStr) {
    return CITATIONS.filter(c => c.date === dateStr);
  }

  function renderDataSheet() {
    if (!dom.sheetTableBody) return;
    dom.sheetTableBody.innerHTML = "";
    let rows = getCitationsForDate(state.selectedDate);

    // Apply Scriptural Source & Hadith Authenticity Filter
    rows = rows.filter(isCitationFilterMatched);

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      rows = rows.filter(r => 
        r.topic_en.toLowerCase().includes(q) ||
        r.topic_id.toLowerCase().includes(q) ||
        r.arabic.toLowerCase().includes(q) ||
        r.text_en.toLowerCase().includes(q) ||
        r.text_id.toLowerCase().includes(q) ||
        (r.quran_detail && r.quran_detail.surah_name.toLowerCase().includes(q)) ||
        (r.hadith_detail && r.hadith_detail.collection.toLowerCase().includes(q))
      );
    }

    if (dom.sheetRowCount) {
      dom.sheetRowCount.textContent = `${rows.length} Data Sitasi`;
    }

    if (rows.length === 0) {
      const emptyTr = document.createElement("tr");
      emptyTr.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.85rem;">
          Tidak ada naskah yang cocok dengan filter "${state.sourceFilter.toUpperCase()}" dan rentang derajat saat ini.
        </td>
      `;
      dom.sheetTableBody.appendChild(emptyTr);
      return;
    }

    // Sort rows according to state.sheetSortBy and state.sheetSortOrder
    rows.sort((a, b) => {
      let cmp = 0;
      if (state.sheetSortBy === "phase") {
        cmp = a.slot - b.slot;
      } else if (state.sheetSortBy === "type") {
        cmp = a.source_type.localeCompare(b.source_type);
      } else if (state.sheetSortBy === "topic") {
        const topicA = (state.lang === "id" ? a.topic_id : a.topic_en) || "";
        const topicB = (state.lang === "id" ? b.topic_id : b.topic_en) || "";
        cmp = topicA.localeCompare(topicB);
      } else if (state.sheetSortBy === "len") {
        const lenA = (a.arabic || "").length + (a.text_id || "").length;
        const lenB = (b.arabic || "").length + (b.text_id || "").length;
        cmp = lenA - lenB;
      }
      return state.sheetSortOrder === "desc" ? -cmp : cmp;
    });

    let currentPhaseSlot = null;

    rows.forEach(item => {
      const phase = PHASES.find(p => p.slot === item.slot) || PHASES[0];
      const isCurrentActive = item.slot === state.activeSlot;
      const isVisible = isSlotZenVisible(item.slot);

      const phaseName = state.lang === "id" ? phase.name_id : phase.name_en;
      const topicText = state.lang === "id" ? item.topic_id : item.topic_en;
      const isQuran = item.source_type === "quran";
      const typeTagClass = isQuran ? "quran" : "hadith";
      const typeLabel = isQuran ? "Al-Qur'an" : "Hadits";

      // If sorting by phase, render section header banner row for each phase group
      if (state.sheetSortBy === "phase" && currentPhaseSlot !== item.slot) {
        currentPhaseSlot = item.slot;
        const groupTr = document.createElement("tr");
        groupTr.className = "section-group-row";
        groupTr.innerHTML = `
          <td colspan="4" class="section-phase-banner">
            <div class="section-banner-content">
              <div class="section-banner-title">
                <span class="section-phase-name">${phase.icon} ${phaseName}</span>
                <span class="section-time-pill">${phase.range || item.time_range}</span>
                ${isCurrentActive ? '<span class="section-active-badge">● Fase Aktif</span>' : ''}
              </div>
              <div class="section-banner-meta">
                <span class="section-organ-hint">${phase.organ || ""} • ${phase.focus || ""}</span>
              </div>
            </div>
          </td>
        `;
        dom.sheetTableBody.appendChild(groupTr);
      }

      // Build refSnippet & grading
      let refSnippet = "";
      let gradingBadgeHtml = "";
      if (isQuran && item.quran_detail) {
        refSnippet = `QS. ${item.quran_detail.surah_name}: ${item.quran_detail.ayah}`;
      } else if (item.hadith_detail) {
        refSnippet = `HR. ${item.hadith_detail.collection} No. ${item.hadith_detail.hadith_no}`;
        gradingBadgeHtml = `<span class="col-grading-badge">${item.hadith_detail.grading}</span>`;
      }

      const tr = document.createElement("tr");
      tr.className = `citation-row ${isCurrentActive ? "is-active-phase" : ""} ${!isVisible && state.zenMode ? "is-zen-masked" : ""}`;
      tr.setAttribute("data-slot", item.slot);

      tr.innerHTML = `
        <!-- Col 1: Jenis -->
        <td class="cell-copyable" data-copy-type="type" title="Klik untuk salin jenis & referensi">
          <div class="col-type-wrap">
            <span class="col-type-tag ${typeTagClass}">${typeLabel}</span>
            <span class="col-type-ref">${refSnippet}</span>
            ${gradingBadgeHtml}
          </div>
        </td>

        <!-- Col 2: Topik Kontemplasi -->
        <td class="cell-copyable" data-copy-type="topic" title="Klik untuk salin topik kontemplasi">
          <span class="col-topic">${topicText}</span>
          ${state.sheetSortBy !== "phase" ? `<span class="col-topic-phase-tag">${phase.icon} ${phaseName} (${item.time_range})</span>` : ""}
        </td>

        <!-- Col 3: Teks Arab (Right Aligned) -->
        <td class="cell-copyable col-arabic-cell" data-copy-type="arabic" title="Klik untuk salin teks Arab" style="text-align: right;">
          <span class="col-arabic-preview" dir="rtl" title="${item.arabic}">${item.arabic}</span>
        </td>

        <!-- Col 4: Sticky Action Column Freeze (Far Right) -->
        <td class="col-sticky-actions">
          <div class="table-actions-cluster">
            <button class="tbl-btn btn-detail" title="Buka Detail di Panel Inspector">
              <span>🔍 Detail</span>
            </button>
            <button class="tbl-btn btn-copy-row" title="Salin Seluruh Baris Ini (Format Lengkap)">
              <span>📋 Salin Baris</span>
            </button>
            <a href="${item.source_url}" target="_blank" rel="noopener noreferrer" class="tbl-btn btn-source" title="Buka Sumber Asli">
              <span>↗ Sumber</span>
            </a>
          </div>
        </td>
      `;

      // Cell-level copy click listeners
      const copyableCells = tr.querySelectorAll(".cell-copyable");
      copyableCells.forEach(cell => {
        cell.addEventListener("click", (e) => {
          e.stopPropagation();
          const copyType = cell.getAttribute("data-copy-type");
          if (copyType === "type") {
            const copyContent = `${typeLabel} (${refSnippet}${item.hadith_detail ? ', ' + item.hadith_detail.grading : ''})`;
            copyToClipboard(copyContent, "📋 Jenis & referensi berhasil disalin!");
          } else if (copyType === "topic") {
            copyToClipboard(topicText, "📋 Topik kontemplasi berhasil disalin!");
          } else if (copyType === "arabic") {
            copyToClipboard(item.arabic, "📋 Teks Arab berhasil disalin!");
          }
        });
      });

      // Sticky Action Buttons
      const btnDetail = tr.querySelector(".btn-detail");
      if (btnDetail) {
        btnDetail.addEventListener("click", (e) => {
          e.stopPropagation();
          setActiveSlot(item.slot, false);
          openInspector(item.slot);
        });
      }

      const btnCopyRow = tr.querySelector(".btn-copy-row");
      if (btnCopyRow) {
        btnCopyRow.addEventListener("click", (e) => {
          e.stopPropagation();
          const trText = state.lang === "id" ? item.text_id : item.text_en;
          const fullRowText = `[Fase ${item.slot}: ${phaseName} (${item.time_range})] ${typeLabel} - ${refSnippet}\nTopik: ${topicText}\nArab: ${item.arabic}\nTerjemahan: "${trText}"\nSumber: ${item.source_url}`;
          copyToClipboard(fullRowText, "📋 Seluruh baris berhasil disalin!");
        });
      }

      dom.sheetTableBody.appendChild(tr);
    });
  }

  // ==========================================================================
  // INSPECTOR DRAWER / DETAIL PANEL
  // ==========================================================================
  function openInspector(slot) {
    const currentCitations = getCitationsForDate(state.selectedDate);
    const citation = currentCitations.find(c => c.slot === slot);
    if (!citation) return;

    const phase = PHASES.find(p => p.slot === slot) || PHASES[0];
    const isQuran = citation.source_type === "quran";

    dom.inspectorPhaseBadge.textContent = `Fase ${citation.slot}`;
    dom.inspectorPhaseName.textContent = state.lang === "id" ? phase.name_id : phase.name_en;
    dom.inspectorArabicText.textContent = citation.arabic;
    
    if (isQuran && citation.quran_detail) {
      dom.inspectorSourceLabel.textContent = `QS. ${citation.quran_detail.surah_name} (${citation.quran_detail.surah_no}): Ayat ${citation.quran_detail.ayah} [Juz ${citation.quran_detail.juz}]`;
      dom.inspectorMetaType.textContent = "Al-Qur'an Al-Karim";
      dom.inspectorMetaType.className = "meta-pill highlight";
      dom.inspectorMetaGrading.style.display = "none";
    } else if (citation.hadith_detail) {
      dom.inspectorSourceLabel.textContent = `HR. ${citation.hadith_detail.collection} No. ${citation.hadith_detail.hadith_no}`;
      dom.inspectorMetaType.textContent = "Hadits Nabawi";
      dom.inspectorMetaType.className = "meta-pill highlight";
      dom.inspectorMetaGrading.style.display = "inline-block";
      dom.inspectorMetaGrading.textContent = `Derajat: ${citation.hadith_detail.grading}`;
    }

    dom.inspectorMetaTime.textContent = citation.time_range;
    dom.inspectorTextId.textContent = citation.text_id;
    dom.inspectorTextEn.textContent = `"${citation.text_en}"`;
    dom.inspectorCredit.textContent = `Penerjemah: ${citation.translation_credit}`;

    dom.inspectorExplainId.textContent = citation.explain_id;
    dom.inspectorExplainEn.textContent = citation.explain_en;

    dom.inspectorTagsContainer.innerHTML = "";
    if (citation.tags) {
      citation.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "meta-pill";
        span.textContent = `#${tag}`;
        dom.inspectorTagsContainer.appendChild(span);
      });
    }

    dom.inspectorSourceLink.href = citation.source_url;
    dom.inspectorSourceLink.textContent = isQuran ? "🔗 Verifikasi di Quran.com" : "🔗 Verifikasi di Sunnah.com";

    dom.inspectorCopyBtn.onclick = () => {
      const formatted = formatScholarlyCitation(citation);
      copyToClipboard(formatted, "✓ Sitasi ilmiah lengkap berhasil disalin!");
    };

    dom.inspectorDrawer.classList.add("is-open");
    dom.drawerBackdrop.classList.add("is-visible");
  }

  function closeInspector() {
    dom.inspectorDrawer.classList.remove("is-open");
    dom.drawerBackdrop.classList.remove("is-visible");
  }

  // ==========================================================================
  // INSPECTOR DRAWER DISPLAY MODE (LEFT / CENTER / RIGHT)
  // ==========================================================================
  function setDrawerMode(mode) {
    if (!["left", "center", "right"].includes(mode)) mode = "right";
    state.drawerMode = mode;
    localStorage.setItem("mct_drawer_mode", mode);

    if (dom.inspectorDrawer) {
      dom.inspectorDrawer.classList.remove("drawer-mode-right", "drawer-mode-left", "drawer-mode-center");
      dom.inspectorDrawer.classList.add(`drawer-mode-${mode}`);
    }

    if (dom.drawerModeBtns) {
      dom.drawerModeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
      });
    }
  }

  function updateSortHeaderIndicators() {
    const indType = document.getElementById("sort-ind-type");
    const indTopic = document.getElementById("sort-ind-topic");
    if (indType) {
      indType.textContent = state.sheetSortBy === "type" ? (state.sheetSortOrder === "asc" ? "▲" : "▼") : "↕";
      const thType = indType.closest("th");
      if (thType) thType.classList.toggle("active", state.sheetSortBy === "type");
    }
    if (indTopic) {
      indTopic.textContent = state.sheetSortBy === "topic" ? (state.sheetSortOrder === "asc" ? "▲" : "▼") : "↕";
      const thTopic = indTopic.closest("th");
      if (thTopic) thTopic.classList.toggle("active", state.sheetSortBy === "topic");
    }
  }

  // ==========================================================================
  // DRAGGABLE DIVIDER
  // ==========================================================================
  function setupDraggableDivider() {
    const divider = dom.splitDivider;
    const workspace = dom.splitWorkspace;
    if (!divider || !workspace) return;

    function onDividerDown() {
      state.isDraggingDivider = true;
      divider.classList.add("is-dragging");
      dom.body.style.userSelect = "none";
    }

    function onDividerMove(e) {
      if (!state.isDraggingDivider) return;
      if (state.focusMode) return;

      const rect = workspace.getBoundingClientRect();
      const isMobile = window.innerWidth <= 900;

      if (isMobile) {
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const relativeY = clientY - rect.top;
        let percentage = (relativeY / rect.height) * 100;
        percentage = Math.max(25, Math.min(75, percentage));
        dom.paneVisual.style.flex = `0 0 ${percentage}%`;
        localStorage.setItem("mct_divider_y", percentage);
      } else {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const relativeX = clientX - rect.left;
        let percentage = (relativeX / rect.width) * 100;
        percentage = Math.max(25, Math.min(75, percentage));
        dom.paneVisual.style.flex = `0 0 ${percentage}%`;
        localStorage.setItem("mct_divider_x", percentage);
      }
    }

    function onDividerUp() {
      if (!state.isDraggingDivider) return;
      state.isDraggingDivider = false;
      divider.classList.remove("is-dragging");
      dom.body.style.userSelect = "";
    }

    divider.addEventListener("mousedown", onDividerDown);
    window.addEventListener("mousemove", onDividerMove);
    window.addEventListener("mouseup", onDividerUp);

    divider.addEventListener("touchstart", onDividerDown, { passive: false });
    window.addEventListener("touchmove", onDividerMove, { passive: false });
    window.addEventListener("touchend", onDividerUp);

    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      const savedY = localStorage.getItem("mct_divider_y");
      if (savedY) dom.paneVisual.style.flex = `0 0 ${savedY}%`;
    } else {
      const savedX = localStorage.getItem("mct_divider_x");
      if (savedX) dom.paneVisual.style.flex = `0 0 ${savedX}%`;
    }
  }

  // ==========================================================================
  // EVENT LISTENERS & INITIALIZATION
  // ==========================================================================
  function setupEventListeners() {
    // Date selector buttons
    dom.dateButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        dom.dateButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedDate = btn.getAttribute("data-date");
        updateRadialDialState();
        renderDataSheet();
        if (state.activeView === "circle0") renderCircle0();
        if (state.activeView === "timeline") renderPremiereTimeline();
        if (state.activeView === "calendar") renderGoogleCalendar();
      });
    });

    // Scriptural Source Filter Buttons (All / Quran / Hadith)
    dom.sourceFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        dom.sourceFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.sourceFilter = btn.getAttribute("data-source");

        // Dynamic Hadith Range Slider visibility
        if (state.sourceFilter === "quran") {
          if (dom.hadithSliderWrap) dom.hadithSliderWrap.classList.add("is-hidden");
        } else {
          if (dom.hadithSliderWrap) dom.hadithSliderWrap.classList.remove("is-hidden");
        }

        updateRadialDialState();
        renderDataSheet();
        if (state.activeView === "circle0") renderCircle0();
        if (state.activeView === "timeline") renderPremiereTimeline();
        if (state.activeView === "calendar") renderGoogleCalendar();
      });
    });

    // Dual-Handle Hadith Authenticity Slider
    function updateHadithSliderUI() {
      if (!dom.hadithMinSlider || !dom.hadithMaxSlider) return;
      let minVal = parseInt(dom.hadithMinSlider.value);
      let maxVal = parseInt(dom.hadithMaxSlider.value);
      if (minVal > maxVal) {
        const tmp = minVal;
        minVal = maxVal;
        maxVal = tmp;
      }
      state.hadithMinGrade = minVal;
      state.hadithMaxGrade = maxVal;

      // Update highlight track (1..4 maps to 0%..100%)
      const leftPct = ((minVal - 1) / 3) * 100;
      const rightPct = ((4 - maxVal) / 3) * 100;
      if (dom.hadithSliderHighlight) {
        dom.hadithSliderHighlight.style.left = `${leftPct}%`;
        dom.hadithSliderHighlight.style.right = `${rightPct}%`;
      }

      // Update text label
      if (dom.hadithSliderLabel) {
        const minName = HADITH_GRADE_NAMES[minVal] || "Shahih";
        const maxName = HADITH_GRADE_NAMES[maxVal] || "Dha'if";
        dom.hadithSliderLabel.textContent = minVal === maxVal ? minName : `${minName} – ${maxName}`;
      }

      updateRadialDialState();
      renderDataSheet();
      if (state.activeView === "circle0") renderCircle0();
      if (state.activeView === "timeline") renderPremiereTimeline();
      if (state.activeView === "calendar") renderGoogleCalendar();
    }

    if (dom.hadithMinSlider && dom.hadithMaxSlider) {
      dom.hadithMinSlider.addEventListener("input", () => {
        let minVal = parseInt(dom.hadithMinSlider.value);
        let maxVal = parseInt(dom.hadithMaxSlider.value);
        if (minVal > maxVal) {
          dom.hadithMaxSlider.value = minVal;
        }
        updateHadithSliderUI();
      });

      dom.hadithMaxSlider.addEventListener("input", () => {
        let minVal = parseInt(dom.hadithMinSlider.value);
        let maxVal = parseInt(dom.hadithMaxSlider.value);
        if (maxVal < minVal) {
          dom.hadithMinSlider.value = maxVal;
        }
        updateHadithSliderUI();
      });
    }

    // Theme selector
    dom.themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });

    // Language selector
    dom.langSelect.addEventListener("change", (e) => {
      state.lang = e.target.value;
      localStorage.setItem("mct_lang", state.lang);
      updateRadialDialState();
      renderDataSheet();
      if (state.activeView === "circle0") renderCircle0();
      if (state.activeView === "timeline") renderPremiereTimeline();
      if (state.activeView === "calendar") renderGoogleCalendar();
    });

    // Radial Controls
    dom.toggleLabelsBtn.addEventListener("click", () => {
      state.showLabels = !state.showLabels;
      dom.toggleLabelsBtn.classList.toggle("active", state.showLabels);
      dom.toggleLabelsBtn.querySelector(".pill-label").textContent = `Label: ${state.showLabels ? "ON" : "OFF"}`;
      updateRadialDialState();
    });

    dom.iconModeSelect.addEventListener("change", (e) => {
      state.iconMode = e.target.value;
      updateRadialDialState();
    });

    dom.toggleTitlesBtn.addEventListener("click", () => {
      state.showTitles = !state.showTitles;
      dom.toggleTitlesBtn.classList.toggle("active", state.showTitles);
      dom.toggleTitlesBtn.querySelector(".pill-label").textContent = `Topik: ${state.showTitles ? "ON" : "OFF"}`;
      updateRadialDialState();
    });

    dom.toggleZenBtn.addEventListener("click", () => {
      state.zenMode = !state.zenMode;
      dom.toggleZenBtn.classList.toggle("active", state.zenMode);
      dom.toggleZenBtn.querySelector(".pill-label").textContent = `Zen: ${state.zenMode ? "ON" : "OFF"}`;
      showToast(state.zenMode ? "Zen Mode Aktif (No Spoilers)" : "Zen Mode Nonaktif (Semua Terbuka)", "🍃");
      updateRadialDialState();
      renderDataSheet();
      if (state.activeView === "circle0") renderCircle0();
      if (state.activeView === "timeline") renderPremiereTimeline();
      if (state.activeView === "calendar") renderGoogleCalendar();
    });

    // Center Hub Click
    dom.dialCenterHub.addEventListener("click", (e) => {
      if (e.target.closest("#back-to-now-btn")) return;
      openInspector(state.activeSlot);
    });

    // Back to Now Button
    dom.backToNowBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setActiveSlot(state.liveSlot, true);
      showToast("Kembali ke waktu sekarang", "🧭");
    });

    // Circle 0 Hub Click
    if (dom.circle0CenterHub) {
      dom.circle0CenterHub.addEventListener("click", (e) => {
        if (e.target.closest("#circle0-loop-badge")) return;
        openInspector(state.activeSlot);
      });
    }

    // Sheet Search
    dom.sheetSearchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderDataSheet();
    });

    // Sheet Sort Select
    if (dom.sheetSortSelect) {
      dom.sheetSortSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const parts = val.split("_");
        state.sheetSortBy = parts[0];
        state.sheetSortOrder = parts[1] || "asc";
        updateSortHeaderIndicators();
        renderDataSheet();
      });
    }

    // Sheet Sortable Header Click
    if (dom.thSortables) {
      dom.thSortables.forEach(th => {
        th.addEventListener("click", () => {
          const sortField = th.getAttribute("data-sort");
          if (state.sheetSortBy === sortField) {
            state.sheetSortOrder = state.sheetSortOrder === "asc" ? "desc" : "asc";
          } else {
            state.sheetSortBy = sortField;
            state.sheetSortOrder = "asc";
          }
          if (dom.sheetSortSelect) {
            dom.sheetSortSelect.value = `${state.sheetSortBy}_${state.sheetSortOrder}`;
          }
          updateSortHeaderIndicators();
          renderDataSheet();
        });
      });
    }

    // Drawer Mode Toggle Buttons (Left, Center Popup, Right)
    if (dom.drawerModeBtns) {
      dom.drawerModeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const mode = btn.getAttribute("data-mode");
          setDrawerMode(mode);
        });
      });
    }

    // Drawer close buttons
    dom.closeDrawerBtn.addEventListener("click", closeInspector);
    dom.drawerBackdrop.addEventListener("click", closeInspector);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeInspector();
    });
  }

  // ==========================================================================
  // BOOTSTRAP APPLICATION
  // ==========================================================================
  function init() {
    const currentHour = new Date().getHours();
    state.liveSlot = getSlotFromHour(currentHour);
    state.activeSlot = state.liveSlot;

    initStarfield();
    applyTheme(state.theme);
    dom.langSelect.value = state.lang;
    setDrawerMode(state.drawerMode);
    updateSortHeaderIndicators();

    // Render Views
    renderRadialDial();
    renderDataSheet();

    // Setup Components & Interactions
    setupViewSwitcher();
    setupSplitFocusToggles();
    setupWashingMachineGestures();
    setupCircle0Gestures();
    setupPremiereTimelineGestures();
    setupDraggableDivider();
    setupEventListeners();

    // Initial Live Sync
    setActiveSlot(state.liveSlot, true);

    // Live Clock Interval
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Run on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
