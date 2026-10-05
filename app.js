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
    theme: localStorage.getItem("mct_theme") || "auto",
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
    timelineZoom: 1
  };

  // Fixed angular positions for Mode 8 (Radial 8 Compass points):
  // Slot 1 (Dawn/Pagi): Top (North, -90°)
  // Slot 2 (Dhuha): NE (-45°)
  // Slot 3 (Siang Terik): East (0°)
  // Slot 4 (Sore): SE (45°)
  // Slot 5 (Senja): South (90°)
  // Slot 6 (Malam Awal): SW (135°)
  // Slot 7 (Tengah Malam): West (180°)
  // Slot 8 (Sepertiga Malam Terakhir): NW (225° / -135°)
  const FIXED_SLOT_ANGLES = {
    1: -90,
    2: -45,
    3: 0,
    4: 45,
    5: 90,
    6: 135,
    7: 180,
    8: 225
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

    // Radial controls
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
    sheetTableBody: document.getElementById("citations-table-body"),
    sheetRowCount: document.getElementById("sheet-row-count"),

    // Inspector Drawer elements
    inspectorDrawer: document.getElementById("inspector-drawer"),
    drawerBackdrop: document.getElementById("drawer-backdrop"),
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
  // THEME ENGINE
  // ==========================================================================
  function applyTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem("mct_theme", themeName);
    dom.body.setAttribute("data-theme", themeName);
    dom.themeSelect.value = themeName;
    updateDynamicPhaseColor();
  }

  function updateDynamicPhaseColor() {
    if (state.theme !== "auto") return;

    const currentPhaseConfig = PHASES.find(p => p.slot === state.activeSlot) || PHASES[0];
    const accentColor = currentPhaseConfig.color;
    document.documentElement.style.setProperty("--phase-accent", accentColor);
    document.documentElement.style.setProperty("--phase-accent-glow", accentColor.replace(")", ", 0.35)").replace("hsl", "hsla"));
    document.documentElement.style.setProperty("--phase-accent-subtle", accentColor.replace(")", ", 0.12)").replace("hsl", "hsla"));
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

    // 3. Static Spoke Lines & Permanently Static Horizontal Labels
    dom.dialSpokesGroup.innerHTML = "";
    dom.dialLabelsGroup.innerHTML = "";
    const spokeRadius = 200;
    const labelRadius = 208;

    PHASES.forEach((phase) => {
      const midAngle = FIXED_SLOT_ANGLES[phase.slot];
      const rad = (midAngle * Math.PI) / 180;

      // Spoke line
      const spoke = document.createElementNS("http://www.w3.org/2000/svg", "line");
      spoke.setAttribute("id", `spoke-slot-${phase.slot}`);
      spoke.setAttribute("class", "radar-spoke-line");
      spoke.setAttribute("x1", outerRadius * Math.cos(rad));
      spoke.setAttribute("y1", outerRadius * Math.sin(rad));
      spoke.setAttribute("x2", spokeRadius * Math.cos(rad));
      spoke.setAttribute("y2", spokeRadius * Math.sin(rad));
      dom.dialSpokesGroup.appendChild(spoke);

      // Static Horizontal Label Group (ZERO TILT, ZERO ROTATION!)
      const lx = labelRadius * Math.cos(rad);
      const ly = labelRadius * Math.sin(rad);

      let textAnchor = "start";
      let offsetX = 0;
      let offsetY = 0;

      if (lx > 22) {
        textAnchor = "start";
        offsetX = 6;
      } else if (lx < -22) {
        textAnchor = "end";
        offsetX = -6;
      } else {
        textAnchor = "middle";
        offsetY = ly < 0 ? -12 : 16;
      }

      const labelG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      labelG.setAttribute("class", "dial-label-item");
      labelG.setAttribute("data-slot", phase.slot);
      labelG.setAttribute("id", `label-slot-${phase.slot}`);
      labelG.setAttribute("transform", `translate(${lx + offsetX}, ${ly + offsetY})`);

      const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textNode.setAttribute("class", "dial-label-text");
      textNode.setAttribute("text-anchor", textAnchor);
      labelG.appendChild(textNode);

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
      <g class="knob-pointer-needle" id="knob-pointer-needle">
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
      needle.style.transform = `rotate(${targetAngle + 90}deg)`;
      needle.style.transition = "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }

    PHASES.forEach((phase) => {
      const gWedge = document.getElementById(`segment-slot-${phase.slot}`);
      const spoke = document.getElementById(`spoke-slot-${phase.slot}`);
      const labelG = document.getElementById(`label-slot-${phase.slot}`);
      if (!gWedge || !spoke || !labelG) return;

      const path = gWedge.querySelector("path");
      const iconNode = gWedge.querySelector(".wedge-icon-symbol");
      const textNode = labelG.querySelector(".dial-label-text");
      const isCurrentActive = phase.slot === state.activeSlot;
      const isVisible = isSlotZenVisible(phase.slot);
      const isPast = isSlotPast(phase.slot);
      const citation = currentCitations.find(c => c.slot === phase.slot);

      // Reset classes
      gWedge.classList.remove("active", "is-zen-masked", "is-past");
      spoke.classList.remove("active");
      labelG.classList.remove("active", "is-zen-masked", "is-past");

      if (isCurrentActive) {
        gWedge.classList.add("active");
        spoke.classList.add("active");
        labelG.classList.add("active");
        path.setAttribute("fill", phase.color);
        path.setAttribute("stroke", "#ffffff");
        path.setAttribute("stroke-width", "3");
      } else {
        path.setAttribute("fill", "rgba(20, 25, 36, 0.82)");
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
        path.setAttribute("stroke-width", "1.5");
      }

      if (!isVisible && isZen) {
        gWedge.classList.add("is-zen-masked");
        labelG.classList.add("is-zen-masked");
      } else if (isPast) {
        gWedge.classList.add("is-past");
        labelG.classList.add("is-past");
      }

      // Icon display
      if (state.iconMode === "celestial") {
        iconNode.textContent = phase.icon;
        iconNode.style.display = "block";
      } else if (state.iconMode === "clock") {
        iconNode.textContent = phase.range.split("-")[0];
        iconNode.style.display = "block";
      } else {
        iconNode.style.display = "none";
      }

      // Static Horizontal text content
      const phaseName = state.lang === "id" ? phase.name_id.split("/")[0].trim() : phase.name_en.split("/")[0].trim();
      let topicPreview = "";
      if (citation && state.showTitles) {
        const fullTopic = state.lang === "id" ? citation.topic_id : citation.topic_en;
        topicPreview = fullTopic.length > 18 ? fullTopic.substring(0, 16) + "…" : fullTopic;
      }

      if (!isVisible && isZen) {
        textNode.innerHTML = `
          <tspan x="0" y="0" class="dial-label-title" fill="rgba(255,255,255,0.45)">🔒 •••</tspan>
          <tspan x="0" dy="13" class="dial-label-sub" fill="rgba(255,255,255,0.3)">Terselubung</tspan>
        `;
      } else {
        let titleContent = state.showLabels ? phaseName : "";
        let subContent = phase.range;
        if (state.showTitles && topicPreview) {
          subContent = topicPreview;
        }

        textNode.innerHTML = `
          <tspan x="0" y="0" class="dial-label-title" fill="${isCurrentActive ? 'var(--phase-accent)' : 'var(--text-primary)'}">${titleContent}</tspan>
          <tspan x="0" dy="13" class="dial-label-sub" fill="${isCurrentActive ? 'var(--text-primary)' : 'var(--text-secondary)'}">${subContent}</tspan>
        `;
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

      // Normalize so North (-90deg) is 0:
      let normalized = (deg + 90 + 360) % 360;
      let slotIdx = Math.round(normalized / 45) % 8;
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
        icon.textContent = isVisible ? phase.icon : "🔒";
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

      const phaseName = state.lang === "id" ? phase.name_id.split("/")[0].trim() : phase.name_en.split("/")[0].trim();
      const clipFileName = `${String(phase.slot).padStart(2, "0")}_${phaseName.replace(/\s+/g, "_")}_${isQuran ? "Quran" : "Hadith"}.mov`;
      const durationTC = `${String(durationH).padStart(2, "0")}:00:00:00`;
      let topic = citation ? (state.lang === "id" ? citation.topic_id : citation.topic_en) : "";

      if (!isVisible && state.zenMode) {
        clip.innerHTML = `
          <div class="pr-clip-header">
            <span class="pr-clip-label">🔒 ${clipFileName}</span>
            <span class="pr-clip-duration">${durationTC}</span>
          </div>
          <div class="pr-clip-preview" style="opacity: 0.5;">Terselubung (Zen Mode)</div>
        `;
      } else {
        clip.innerHTML = `
          <div class="pr-clip-header">
            <span class="pr-clip-label">${phase.icon} ${clipFileName}</span>
            <span class="pr-clip-duration">${durationTC}</span>
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
        waveBars += `<line x1="${xPos}%" y1="${27 - amp}" x2="${xPos}%" y2="${27 + amp}" stroke="#34d399" stroke-width="1.8" stroke-linecap="round" />`;
      }

      audioBlock.innerHTML = `
        <svg class="pr-audio-waveform-svg" viewBox="0 0 100 54" preserveAspectRatio="none">
          <line x1="0" y1="27" x2="100" y2="27" stroke="rgba(52, 211, 153, 0.3)" stroke-width="1" />
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
            <div class="cal-event-topic">${!isVisible && state.zenMode ? "🔒 Terselubung (Zen Mode)" : topicText}</div>
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
      dom.sheetRowCount.textContent = `${rows.length} Fase`;
    }

    rows.forEach(item => {
      const phase = PHASES.find(p => p.slot === item.slot) || PHASES[0];
      const isCurrentActive = item.slot === state.activeSlot;
      const isVisible = isSlotZenVisible(item.slot);

      const tr = document.createElement("tr");
      tr.className = `citation-row ${isCurrentActive ? "is-active-phase" : ""} ${!isVisible && state.zenMode ? "is-zen-masked" : ""}`;
      tr.setAttribute("data-slot", item.slot);

      const phaseName = state.lang === "id" ? phase.name_id : phase.name_en;
      const topicText = state.lang === "id" ? item.topic_id : item.topic_en;
      const isQuran = item.source_type === "quran";
      const typeTagClass = isQuran ? "quran" : "hadith";
      const typeLabel = isQuran ? "Qur'an" : "Hadits";

      tr.innerHTML = `
        <td>
          <div class="col-phase">
            <span class="phase-dot" style="background: ${phase.color};"></span>
            <span>${phaseName}</span>
          </div>
        </td>
        <td><span style="font-variant-numeric: tabular-nums; color: var(--text-secondary); font-size: 0.78rem;">${item.time_range}</span></td>
        <td><span class="col-type-tag ${typeTagClass}">${typeLabel}</span></td>
        <td class="col-topic">${topicText}</td>
        <td class="col-arabic-preview" title="${item.arabic}">${item.arabic}</td>
        <td>
          <div class="row-actions-group">
            <button class="quick-action-btn copy-arabic" title="Salin Teks Arab Sahaja">
              <span>عربي</span>
            </button>
            <button class="quick-action-btn copy-trans" title="Salin Terjemahan">
              <span>${state.lang.toUpperCase()}</span>
            </button>
            <button class="quick-action-btn copy-all" title="Salin Sitasi Lengkap">
              <span>📋 Lengkap</span>
            </button>
          </div>
        </td>
      `;

      tr.addEventListener("click", (e) => {
        if (e.target.closest(".quick-action-btn")) return;
        setActiveSlot(item.slot, false);
        openInspector(item.slot);
      });

      const btnCopyArabic = tr.querySelector(".copy-arabic");
      btnCopyArabic.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(item.arabic, "✓ Teks Arab berhasil disalin!");
      });

      const btnCopyTrans = tr.querySelector(".copy-trans");
      btnCopyTrans.addEventListener("click", (e) => {
        e.stopPropagation();
        const trText = state.lang === "id" ? item.text_id : item.text_en;
        copyToClipboard(trText, `✓ Terjemahan (${state.lang.toUpperCase()}) berhasil disalin!`);
      });

      const btnCopyAll = tr.querySelector(".copy-all");
      btnCopyAll.addEventListener("click", (e) => {
        e.stopPropagation();
        const fullCitation = formatScholarlyCitation(item);
        copyToClipboard(fullCitation, "✓ Sitasi ilmiah lengkap berhasil disalin!");
      });

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

    applyTheme(state.theme);
    dom.langSelect.value = state.lang;

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
