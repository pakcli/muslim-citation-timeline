/**
 * Muslim Citation Timeline — Core Application Engine (v2.0)
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
    isLiveMode: true,          // True if following live clock, false if scrubbed via valve
    rotationAngle: 0,          // Valve dial angle in degrees
    zenMode: true,             // Default: ON ("no spoilers" rule)
    showLabels: true,          // Toggle text labels on dial
    iconMode: "celestial",     // 'celestial' | 'clock' | 'none'
    showTitles: true,          // Toggle citation titles on dial
    theme: localStorage.getItem("mct_theme") || "auto",
    lang: localStorage.getItem("mct_lang") || "id",
    searchQuery: "",
    unlockedZenSlots: new Set(), // Set of slots temporarily unlocked by user
    isDraggingDial: false,
    dragStartAngle: 0,
    dragStartRotation: 0,
    hasMovedDial: false,
    isDraggingDivider: false
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
    dateButtons: document.querySelectorAll("#date-selector-group .date-btn"),
    langSelect: document.getElementById("lang-select"),
    themeSelect: document.getElementById("theme-select"),
    brandSymbol: document.getElementById("brand-symbol"),

    // Radial controls
    toggleLabelsBtn: document.getElementById("toggle-labels-btn"),
    iconModeSelect: document.getElementById("icon-mode-select"),
    toggleTitlesBtn: document.getElementById("toggle-titles-btn"),
    toggleZenBtn: document.getElementById("toggle-zen-btn"),

    // Dial elements
    radialStage: document.getElementById("radial-stage"),
    radialDialWrapper: document.getElementById("radial-dial-wrapper"),
    radialSvg: document.getElementById("radial-svg"),
    dialWheelGroup: document.getElementById("dial-wheel-group"),
    dialCenterHub: document.getElementById("dial-center-hub"),
    hubModeBadge: document.getElementById("hub-mode-badge"),
    hubLiveClock: document.getElementById("hub-live-clock"),
    hubPhaseTitle: document.getElementById("hub-phase-title"),
    hubPhaseRange: document.getElementById("hub-phase-range"),
    backToNowBtn: document.getElementById("back-to-now-btn"),

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

  // Calculate circadian slot from hour (0-23)
  function getSlotFromHour(hour) {
    if (hour >= 5 && hour < 8) return 1;    // Fajr / Dawn
    if (hour >= 8 && hour < 11) return 2;   // Mid-Morning
    if (hour >= 11 && hour < 14) return 3;  // High Noon
    if (hour >= 14 && hour < 17) return 4;  // Late Afternoon
    if (hour >= 17 && hour < 19) return 5;  // Sunset
    if (hour >= 19 && hour < 22) return 6;  // Early Night
    if (hour >= 22 || hour < 2) return 7;   // Midnight
    return 8;                               // Pre-Dawn (02:00 - 05:00)
  }

  // Determine if a slot is visible under Zen Mode rules
  function isSlotZenVisible(slot) {
    if (!state.zenMode) return true;
    if (state.unlockedZenSlots.has(slot)) return true;

    const baseSlot = state.isLiveMode ? state.liveSlot : state.activeSlot;
    // Current slot
    if (slot === baseSlot) return true;

    // Past slots are visible (though dimmed)
    // Next 6 hours = next 2 slots
    const next1 = (baseSlot % 8) + 1;
    const next2 = ((baseSlot + 1) % 8) + 1;
    if (slot === next1 || slot === next2) return true;

    // Past slots calculation
    // A slot is "past" if it occurred earlier today relative to baseSlot
    const diff = (slot - baseSlot + 8) % 8;
    if (diff > 2 && diff < 8) {
      // It's in the past or far future. In Zen mode, past is visible (dimmed),
      // while future beyond 6h is masked.
      // Let's define past slots: diff > 2.
      // Slots that happened before today's baseSlot:
      if (slot < baseSlot) return true; // It's past!
      return false; // Beyond 6 hours in future!
    }

    return false;
  }

  function isSlotPast(slot) {
    const baseSlot = state.isLiveMode ? state.liveSlot : state.activeSlot;
    return slot < baseSlot;
  }

  // Format full citation for copying
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
    dom.hubLiveClock.textContent = `${hh}:${mm}:${ss}`;

    const computedSlot = getSlotFromHour(hours);
    if (computedSlot !== state.liveSlot) {
      state.liveSlot = computedSlot;
      if (state.isLiveMode) {
        setActiveSlot(computedSlot, false);
      }
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
  // RADIAL VALVE DIAL SVG RENDERING
  // ==========================================================================
  function renderRadialDial() {
    dom.dialWheelGroup.innerHTML = "";

    const outerRadius = 195;
    const innerRadius = 112;
    const segmentAngle = 360 / 8; // 45 degrees per segment

    PHASES.forEach((phase, index) => {
      // Slot 1 is at 12 o'clock (-90 degrees), so offset by -90 - segmentAngle/2
      const startAngle = index * segmentAngle - 90 - (segmentAngle / 2);
      const endAngle = startAngle + segmentAngle;

      // Convert polar to cartesian coordinates
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

      // SVG path for annular sector
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

      // Mid angle for text positioning
      const midAngle = startAngle + segmentAngle / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = (outerRadius + innerRadius) / 2;
      const tx = textRadius * Math.cos(midRad);
      const ty = textRadius * Math.sin(midRad);

      // Label & Icon container
      const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textNode.setAttribute("x", tx);
      textNode.setAttribute("y", ty);
      textNode.setAttribute("text-anchor", "middle");
      textNode.setAttribute("dominant-baseline", "central");
      textNode.setAttribute("fill", "#f8fafc");
      textNode.setAttribute("font-size", "11");
      textNode.setAttribute("font-weight", "600");
      textNode.setAttribute("pointer-events", "none");

      g.appendChild(textNode);
      dom.dialWheelGroup.appendChild(g);

      // Click handler on segment
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.hasMovedDial) return; // Ignore if user was dragging valve
        handleSegmentClick(phase.slot);
      });
    });

    updateRadialDialState();
  }

  function updateRadialDialState() {
    const isZen = state.zenMode;
    const currentCitations = getCitationsForDate(state.selectedDate);

    PHASES.forEach((phase) => {
      const g = document.getElementById(`segment-slot-${phase.slot}`);
      if (!g) return;

      const path = g.querySelector("path");
      const textNode = g.querySelector("text");
      const isCurrentActive = phase.slot === state.activeSlot;
      const isVisible = isSlotZenVisible(phase.slot);
      const isPast = isSlotPast(phase.slot);
      const citation = currentCitations.find(c => c.slot === phase.slot);

      // Reset classes
      g.classList.remove("active", "is-zen-masked", "is-past");

      if (isCurrentActive) {
        g.classList.add("active");
        path.setAttribute("fill", phase.color);
        path.setAttribute("stroke", "#ffffff");
        path.setAttribute("stroke-width", "3");
      } else {
        path.setAttribute("fill", "rgba(20, 25, 36, 0.82)");
        path.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
        path.setAttribute("stroke-width", "1.5");
      }

      if (!isVisible && isZen) {
        g.classList.add("is-zen-masked");
      } else if (isPast) {
        g.classList.add("is-past");
      }

      // Content inside segment
      let iconSymbol = "";
      if (state.iconMode === "celestial") {
        iconSymbol = phase.icon;
      } else if (state.iconMode === "clock") {
        iconSymbol = phase.range.split("-")[0];
      }

      const phaseName = state.lang === "id" ? phase.name_id.split("/")[0].trim() : phase.name_en.split("/")[0].trim();
      let topicPreview = "";
      if (citation && state.showTitles) {
        const fullTopic = state.lang === "id" ? citation.topic_id : citation.topic_en;
        topicPreview = fullTopic.length > 14 ? fullTopic.substring(0, 12) + "…" : fullTopic;
      }

      if (!isVisible && isZen) {
        textNode.innerHTML = `<tspan font-size="13">🔒</tspan><tspan dy="14" x="${textNode.getAttribute("x")}" font-size="9" fill="rgba(255,255,255,0.5)">•••</tspan>`;
      } else {
        let content = "";
        if (iconSymbol && state.iconMode !== "none") {
          content += `<tspan font-size="12">${iconSymbol}</tspan> `;
        }
        if (state.showLabels) {
          content += `<tspan font-size="10.5" fill="${isCurrentActive ? '#000000' : '#ffffff'}">${phaseName}</tspan>`;
        }
        if (state.showTitles && topicPreview) {
          content += `<tspan dy="12" x="${textNode.getAttribute("x")}" font-size="8.5" fill="${isCurrentActive ? '#111827' : 'rgba(255,255,255,0.7)'}">${topicPreview}</tspan>`;
        }
        textNode.innerHTML = content;
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

  // ==========================================================================
  // VALVE ROTARY DRAG PHYSICS
  // ==========================================================================
  function setupValveRotaryGestures() {
    const dial = dom.radialDialWrapper;

    function getAngleFromPointer(e) {
      const rect = dial.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const rad = Math.atan2(clientY - centerY, clientX - centerX);
      let deg = (rad * 180) / Math.PI;
      return deg;
    }

    function onPointerDown(e) {
      // Don't intercept clicks inside center hub
      if (e.target.closest("#dial-center-hub") || e.target.closest("#back-to-now-btn")) return;

      state.isDraggingDial = true;
      state.hasMovedDial = false;
      state.dragStartAngle = getAngleFromPointer(e);
      state.dragStartRotation = state.rotationAngle;
      dom.radialSvg.classList.add("is-dragging");
    }

    function onPointerMove(e) {
      if (!state.isDraggingDial) return;

      const currentAngle = getAngleFromPointer(e);
      let angleDiff = currentAngle - state.dragStartAngle;

      // Detect deliberate movement (> 5 degrees)
      if (Math.abs(angleDiff) > 4) {
        state.hasMovedDial = true;
      }

      state.rotationAngle = state.dragStartRotation + angleDiff;
      dom.radialSvg.style.transform = `rotate(${state.rotationAngle}deg)`;

      // Calculate which slot is currently at 12 o'clock
      // Each slot is 45 degrees. Neutral angle is 0.
      let normalizedAngle = (-state.rotationAngle) % 360;
      if (normalizedAngle < 0) normalizedAngle += 360;

      const calculatedSlot = (Math.round(normalizedAngle / 45) % 8) + 1;
      if (calculatedSlot !== state.activeSlot) {
        state.activeSlot = calculatedSlot;
        state.isLiveMode = false;
        if (navigator.vibrate) navigator.vibrate(8); // Haptic tick!
        updateRadialDialState();
        renderDataSheet();
      }
    }

    function onPointerUp() {
      if (!state.isDraggingDial) return;
      state.isDraggingDial = false;
      dom.radialSvg.classList.remove("is-dragging");

      if (state.hasMovedDial) {
        // Snap to nearest 45 degree phase boundary with spring animation
        const snappedSlot = state.activeSlot;
        const targetAngle = -(snappedSlot - 1) * 45;
        state.rotationAngle = targetAngle;
        dom.radialSvg.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)";
        dom.radialSvg.style.transform = `rotate(${targetAngle}deg)`;
        setTimeout(() => {
          dom.radialSvg.style.transition = "transform 0.08s ease-out";
        }, 300);
      }
    }

    // Attach unified pointer events
    dial.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    dial.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  }

  // ==========================================================================
  // SEGMENT CLICK & ZEN DIALOGUE
  // ==========================================================================
  function handleSegmentClick(slot) {
    const isVisible = isSlotZenVisible(slot);
    if (!isVisible && state.zenMode) {
      // Gentle Zen dialogue
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
    if (isLive) {
      state.isLiveMode = true;
      state.rotationAngle = -(slot - 1) * 45;
      dom.radialSvg.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      dom.radialSvg.style.transform = `rotate(${state.rotationAngle}deg)`;
      setTimeout(() => {
        dom.radialSvg.style.transition = "transform 0.08s ease-out";
      }, 360);
    } else {
      state.isLiveMode = false;
    }

    updateRadialDialState();
    renderDataSheet();
  }

  // ==========================================================================
  // DATA SHEET LENS (EXCEL-STYLE TABLE)
  // ==========================================================================
  function getCitationsForDate(dateStr) {
    return CITATIONS.filter(c => c.date === dateStr);
  }

  function renderDataSheet() {
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

    dom.sheetRowCount.textContent = `${rows.length} Fase`;

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

      // Row click opens inspector
      tr.addEventListener("click", (e) => {
        if (e.target.closest(".quick-action-btn")) return; // Let buttons handle their own click
        setActiveSlot(item.slot, false);
        openInspector(item.slot);
      });

      // Quick action button listeners
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

    // Tags
    dom.inspectorTagsContainer.innerHTML = "";
    if (citation.tags) {
      citation.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "meta-pill";
        span.textContent = `#${tag}`;
        dom.inspectorTagsContainer.appendChild(span);
      });
    }

    // Source External Link
    dom.inspectorSourceLink.href = citation.source_url;
    dom.inspectorSourceLink.textContent = isQuran ? "🔗 Verifikasi di Quran.com" : "🔗 Verifikasi di Sunnah.com";

    // Set up copy button inside inspector
    dom.inspectorCopyBtn.onclick = () => {
      const formatted = formatScholarlyCitation(citation);
      copyToClipboard(formatted, "✓ Sitasi ilmiah lengkap berhasil disalin!");
    };

    // Open Drawer
    dom.inspectorDrawer.classList.add("is-open");
    dom.drawerBackdrop.classList.add("is-visible");
  }

  function closeInspector() {
    dom.inspectorDrawer.classList.remove("is-open");
    dom.drawerBackdrop.classList.remove("is-visible");
  }

  // ==========================================================================
  // DRAGGABLE DIVIDER (RESPONSIVE SPLIT PANE)
  // ==========================================================================
  function setupDraggableDivider() {
    const divider = dom.splitDivider;
    const workspace = dom.splitWorkspace;

    function onDividerDown(e) {
      state.isDraggingDivider = true;
      divider.classList.add("is-dragging");
      dom.body.style.userSelect = "none";
    }

    function onDividerMove(e) {
      if (!state.isDraggingDivider) return;

      const rect = workspace.getBoundingClientRect();
      const isMobile = window.innerWidth <= 900;

      if (isMobile) {
        // Vertical dragging
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const relativeY = clientY - rect.top;
        let percentage = (relativeY / rect.height) * 100;
        percentage = Math.max(30, Math.min(75, percentage));
        dom.paneVisual.style.flex = `0 0 ${percentage}%`;
        localStorage.setItem("mct_divider_y", percentage);
      } else {
        // Horizontal dragging
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const relativeX = clientX - rect.left;
        let percentage = (relativeX / rect.width) * 100;
        percentage = Math.max(30, Math.min(70, percentage));
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

    // Restore saved divider position
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
    // Date buttons
    dom.dateButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        dom.dateButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedDate = btn.getAttribute("data-date");
        updateRadialDialState();
        renderDataSheet();
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
    // 1. Initial live slot calculation
    const currentHour = new Date().getHours();
    state.liveSlot = getSlotFromHour(currentHour);
    state.activeSlot = state.liveSlot;

    // 2. Setup themes & language
    applyTheme(state.theme);
    dom.langSelect.value = state.lang;

    // 3. Render Views
    renderRadialDial();
    renderDataSheet();

    // 4. Setup Interactions
    setupValveRotaryGestures();
    setupDraggableDivider();
    setupEventListeners();

    // 5. Align dial rotation to live slot
    setActiveSlot(state.liveSlot, true);

    // 6. Live Clock Interval
    updateClock();
    setInterval(updateClock, 1000);

    // Initial greeting toast
    setTimeout(() => {
      showToast("Muslim Citation Timeline aktif • Zen Mode menyala", "✨");
    }, 450);
  }

  // Run on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
