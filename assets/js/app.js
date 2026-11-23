(function () {
  const STORAGE_KEY = "hq_criativa_letramento_v2";
  const MAX_HISTORY = 30;
  const PANEL_W = 400;
  const PANEL_H = 340;
  const DRAW_SCALE = 2; // 800 x 680 canvas de desenho livre

  let uidCounter = Date.now();
  function nextId(prefix) {
    uidCounter += 1;
    return `${prefix}-${uidCounter}`;
  }

  function createEmptyPanel(sceneId) {
    return {
      sceneId: sceneId || "classroom",
      drawingDataUrl: null,
      items: [],
    };
  }

  function createDefaultState() {
    return {
      title: "Fake news não passa por aqui",
      authors: "",
      panelCount: 3,
      layoutMode: "row",
      activePanelIndex: 0,
      selectedItemId: null,
      panels: [
        createEmptyPanel("classroom"),
        createEmptyPanel("library"),
        createEmptyPanel("digital"),
        createEmptyPanel("square"),
      ],
    };
  }

  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  let state = loadSavedState() || createDefaultState();
  let undoStack = [];
  let activeSidebarTab = "scenes";
  let activeSceneFilter = "Todos";
  let charSidebarMode = "add";
  let pendingExpression = "happy";
  let pendingPose = "standing";
  let pendingFraming = "full";
  let pendingBubbleDraft = {
    type: "speech",
    text: "Oi! Vamos checar essa fonte?",
    fontSize: 15,
    fontFamily: "sans",
    tailDir: "left",
  };
  let focusMode = false;

  // Estado da aba Desenhar
  let drawTool = "pencil"; // "move" | "pencil" | "pen" | "brush" | "eraser"
  let drawColor = "#111827";
  let drawSize = 2;
  let shapeFillColor = "#7C3AED";
  let shapeStrokeColor = "#111827";
  let activeSidebarDragPayload = null;

  // DOM
  const titleInput = document.getElementById("hqTitleInput");
  const authorsInput = document.getElementById("hqAuthorsInput");
  const layoutButtons = document.querySelectorAll("[data-layout-count]");
  const layoutModeGroup = document.getElementById("layoutModeGroup");
  const panelJumpTabs = document.getElementById("panelJumpTabs");
  const btnMovePanelPrev = document.getElementById("btnMovePanelPrev");
  const btnMovePanelNext = document.getElementById("btnMovePanelNext");
  const btnDuplicatePanel = document.getElementById("btnDuplicatePanel");
  const btnFocusMode = document.getElementById("btnFocusMode");
  const comicPanelsEl = document.getElementById("comicPanels");
  const sidebarTabButtons = document.querySelectorAll("[data-sidebar-tab]");
  const sidebarBodyEl = document.getElementById("sidebarBody");
  const inspectorEl = document.getElementById("elementInspector");

  const btnUndo = document.getElementById("btnUndo");
  const btnClearPanel = document.getElementById("btnClearPanel");
  const btnNewStrip = document.getElementById("btnNewStrip");
  const btnDownloadPng = document.getElementById("btnDownloadPng");
  const btnThemeIdeas = document.getElementById("btnThemeIdeas");
  const themesModal = document.getElementById("themesModal");
  const themesListEl = document.getElementById("themesList");
  const btnCloseThemes = document.getElementById("btnCloseThemes");
  const confirmModal = document.getElementById("confirmModal");
  const confirmModalTitle = document.getElementById("confirmModalTitle");
  const confirmModalMessage = document.getElementById("confirmModalMessage");
  const btnConfirmClose = document.getElementById("btnConfirmClose");
  const btnConfirmCancel = document.getElementById("btnConfirmCancel");
  const btnConfirmOk = document.getElementById("btnConfirmOk");
  const toastEl = document.getElementById("statusToast");

  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.panels) || parsed.panels.length < 4) return null;
      parsed.layoutMode = window.HQExporter
        ? window.HQExporter.normalizeLayoutMode(parsed.panelCount, parsed.layoutMode)
        : "row";
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function pushUndoSnapshot() {
    undoStack.push(
      cloneData({
        title: state.title,
        authors: state.authors,
        panelCount: state.panelCount,
        layoutMode: state.layoutMode,
        activePanelIndex: state.activePanelIndex,
        selectedItemId: state.selectedItemId,
        panels: state.panels,
      })
    );
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    updateUndoButton();
  }

  function updateUndoButton() {
    if (!btnUndo) return;
    btnUndo.disabled = undoStack.length === 0;
  }

  function undo() {
    if (!undoStack.length) return;
    state = undoStack.pop();
    syncBufferFromState();
    persistState();
    renderAll();
    showToast("Ação desfeita");
  }

  function getActivePanel() {
    const idx = Math.min(Math.max(0, state.activePanelIndex), state.panelCount - 1);
    state.activePanelIndex = idx;
    return state.panels[idx];
  }

  function getSelectedItem() {
    if (!state.selectedItemId) return null;
    const panel = getActivePanel();
    return panel.items.find((it) => it.id === state.selectedItemId) || null;
  }

  function getItemLabel(item) {
    if (!item) return "";
    if (item.kind === "character") {
      const d = HQArt.CHARACTER_DEFAULTS[item.assetId];
      return d ? d.name : "Personagem";
    }
    if (item.kind === "object") {
      const o = HQArt.OBJECTS.find((x) => x.id === item.assetId);
      return o ? o.name : "Objeto";
    }
    if (item.kind === "emoji") return `Reação ${item.emoji || ""}`;
    if (item.kind === "shape") {
      const s = HQArt.SHAPES.find((x) => x.id === item.assetId);
      return s ? `Forma: ${s.name}` : "Forma";
    }
    return "Balão";
  }

  function isDrawingActive() {
    return activeSidebarTab === "draw" && drawTool !== "move";
  }

  // ---------------------------------------------------------------------------
  // SELECTION BOX GEOMETRY + INCREMENTAL OVERLAY SYNC (SEM DESTRUIR O SVG!)
  // ---------------------------------------------------------------------------
  function getItemBox(item) {
    const sc = Number(item.scale) || 1;
    let hw = 44 * sc;
    let hh = 44 * sc;
    let offsetY = 0;
    if (item.kind === "character") {
      const isAnim = Boolean(
        item.isAnimal ||
          (HQArt.CHARACTER_DEFAULTS[item.assetId] && HQArt.CHARACTER_DEFAULTS[item.assetId].isAnimal)
      );
      if (isAnim) {
        hw = 46 * sc;
        hh = 68 * sc;
        offsetY = -6 * sc;
      } else {
        hw = 52 * sc;
        hh = item.framing === "half" ? 102 * sc : 128 * sc;
        offsetY = item.framing === "half" ? -12 * sc : 10 * sc;
      }
    } else if (item.kind === "bubble") {
      const info = HQArt.renderBubbleMarkup(item);
      hw = (info.boxW / 2 + 8) * sc;
      hh = (info.boxH / 2 + 12) * sc;
      offsetY = 6 * sc;
    } else if (item.kind === "emoji") {
      hw = 30 * sc;
      hh = 30 * sc;
      offsetY = 0;
    } else if (item.kind === "shape") {
      hw = 36 * sc;
      hh = 36 * sc;
      offsetY = 0;
    }
    const x = item.x - hw;
    const y = item.y + offsetY - hh;
    const w = hw * 2;
    const h = hh * 2;
    return { x, y, w, h };
  }

  function syncSelectionOverlay() {
    const frames = comicPanelsEl ? comicPanelsEl.querySelectorAll(".comic-panel-frame") : [];
    frames.forEach((frame, idx) => {
      const isActive = idx === state.activePanelIndex;
      frame.classList.toggle("is-active", isActive);
      const svg = frame.querySelector("svg.comic-panel-svg");
      if (svg) {
        const oldBox = svg.querySelector(".selection-halo-rect");
        if (oldBox) oldBox.remove();
      }
      const oldTb = frame.querySelector(".selection-quick-bar");
      if (oldTb) oldTb.remove();

      if (!isActive || !state.selectedItemId || isDrawingActive()) return;
      const sel = state.panels[idx].items.find((it) => it.id === state.selectedItemId);
      if (!sel || !svg) return;

      const box = getItemBox(sel);
      const rectEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectEl.setAttribute("class", "selection-halo-rect");
      rectEl.setAttribute("x", Math.round(box.x));
      rectEl.setAttribute("y", Math.round(box.y));
      rectEl.setAttribute("width", Math.round(box.w));
      rectEl.setAttribute("height", Math.round(box.h));
      rectEl.setAttribute("rx", "6");
      rectEl.setAttribute("fill", "none");
      rectEl.setAttribute("stroke", "#C84B31");
      rectEl.setAttribute("stroke-width", "2.2");
      rectEl.setAttribute("stroke-dasharray", "6 4");
      rectEl.setAttribute("pointer-events", "none");
      svg.appendChild(rectEl);

      // Controles rápidos junto à borda de seleção: Diminuir (-), Aumentar (+), Inverter, Excluir
      const bar = document.createElement("div");
      bar.className = "selection-quick-bar";
      const pctX = Math.min(82, Math.max(18, ((box.x + box.w / 2) / PANEL_W) * 100));
      const topAnchor = box.y > 46 ? ((box.y - 6) / PANEL_H) * 100 : ((box.y + box.h + 32) / PANEL_H) * 100;
      const pctY = Math.min(92, Math.max(8, topAnchor));
      bar.style.left = `${pctX.toFixed(1)}%`;
      bar.style.top = `${pctY.toFixed(1)}%`;

      bar.innerHTML = `
        <button type="button" class="sq-btn" data-sq="down" title="Diminuir tamanho" aria-label="Diminuir tamanho">−</button>
        <button type="button" class="sq-btn" data-sq="up" title="Aumentar tamanho" aria-label="Aumentar tamanho">+</button>
        <button type="button" class="sq-btn" data-sq="flip" title="Inverter direção" aria-label="Inverter direção">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/></svg>
        </button>
        <button type="button" class="sq-btn is-danger" data-sq="delete" title="Excluir item" aria-label="Excluir item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      `;

      bar.addEventListener("pointerdown", (ev) => ev.stopPropagation());
      bar.querySelectorAll("[data-sq]").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const act = btn.getAttribute("data-sq");
          if (act === "down" || act === "up") {
            pushUndoSnapshot();
            const delta = act === "up" ? 0.1 : -0.1;
            sel.scale = Number(Math.min(1.8, Math.max(0.45, (Number(sel.scale) || 1) + delta)).toFixed(2));
            updateLiveItemTransform(svg, sel);
            syncSelectionOverlay();
            persistState();
          } else if (act === "flip") {
            pushUndoSnapshot();
            sel.flip = !sel.flip;
            updateLiveItemTransform(svg, sel);
            syncSelectionOverlay();
            persistState();
          } else if (act === "delete") {
            removeSelectedElement();
          }
        });
      });

      frame.appendChild(bar);
    });
  }

  function updateLiveItemTransform(svg, item) {
    if (!svg || !item) return;
    const g = svg.querySelector(`[data-item-id="${CSS.escape(item.id)}"]`);
    if (!g) return;
    const sc = Number(item.scale) || 1;
    const flip = item.flip ? -1 : 1;
    g.setAttribute(
      "transform",
      `translate(${Math.round(item.x)} ${Math.round(item.y)}) scale(${(sc * flip).toFixed(3)} ${sc.toFixed(3)})`
    );
  }

  // ---------------------------------------------------------------------------
  // RENDERING PANELS & CANVAS DRAWING OVERLAY
  // ---------------------------------------------------------------------------
  function getLayoutOptionsForCount(panelCount) {
    if (panelCount === 4) {
      return [
        { id: "grid", label: "Grade 2×2" },
        { id: "row", label: "Horizontal (4 col.)" },
        { id: "col", label: "Vertical (4 lin.)" },
      ];
    }
    const unit = panelCount === 2 ? "2" : "3";
    return [
      { id: "row", label: `Horizontal (${unit} col.)` },
      { id: "col", label: `Vertical (${unit} lin.)` },
    ];
  }

  function renderHeaderInputs() {
    if (titleInput && titleInput.value !== state.title) titleInput.value = state.title || "";
    if (authorsInput && authorsInput.value !== state.authors) authorsInput.value = state.authors || "";
    layoutButtons.forEach((btn) => {
      const n = Number(btn.getAttribute("data-layout-count"));
      const active = n === state.panelCount;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    if (layoutModeGroup) {
      const currentMode = HQExporter.normalizeLayoutMode(state.panelCount, state.layoutMode);
      state.layoutMode = currentMode;
      const opts = getLayoutOptionsForCount(state.panelCount);
      layoutModeGroup.innerHTML = opts
        .map(
          (o) =>
            `<button type="button" class="seg-btn${currentMode === o.id ? " is-active" : ""}" data-layout-mode="${o.id}" aria-pressed="${
              currentMode === o.id
            }">${o.label}</button>`
        )
        .join("");
      layoutModeGroup.querySelectorAll("[data-layout-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const nextMode = btn.getAttribute("data-layout-mode");
          if (nextMode === state.layoutMode) return;
          pushUndoSnapshot();
          state.layoutMode = nextMode;
          persistState();
          renderAll();
        });
      });
    }

    if (btnFocusMode) {
      btnFocusMode.classList.toggle("is-active", focusMode);
      btnFocusMode.setAttribute("aria-pressed", String(focusMode));
      const sp = btnFocusMode.querySelector("span");
      if (sp) {
        sp.textContent = focusMode
          ? "Visualização Completa da Tirinha"
          : "Modo Foco (Editar quadro ampliado)";
      }
    }

    updateUndoButton();
  }

  function updatePanelOrderButtons() {
    if (btnMovePanelPrev) btnMovePanelPrev.disabled = state.activePanelIndex <= 0;
    if (btnMovePanelNext) btnMovePanelNext.disabled = state.activePanelIndex >= state.panelCount - 1;
  }

  function movePanelAt(fromIndex, delta) {
    const toIndex = fromIndex + delta;
    if (fromIndex < 0 || fromIndex >= state.panelCount || toIndex < 0 || toIndex >= state.panelCount) return;
    pushUndoSnapshot();
    const tmp = state.panels[fromIndex];
    state.panels[fromIndex] = state.panels[toIndex];
    state.panels[toIndex] = tmp;

    const bufA = liveDrawBufferMap.get(fromIndex);
    const bufB = liveDrawBufferMap.get(toIndex);
    if (bufA) liveDrawBufferMap.set(toIndex, bufA);
    else liveDrawBufferMap.delete(toIndex);
    if (bufB) liveDrawBufferMap.set(fromIndex, bufB);
    else liveDrawBufferMap.delete(fromIndex);

    state.activePanelIndex = toIndex;
    state.selectedItemId = null;
    persistState();
    renderAll();
    showToast(`Quadro ${fromIndex + 1} movido para Quadro ${toIndex + 1}`);
  }

  function renderPanelJumpTabs() {
    if (!panelJumpTabs) return;
    panelJumpTabs.innerHTML = "";
    for (let i = 0; i < state.panelCount; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "panel-pill" + (i === state.activePanelIndex ? " is-active" : "");
      btn.textContent = `Quadro ${i + 1}`;
      btn.addEventListener("click", () => {
        state.activePanelIndex = i;
        state.selectedItemId = null;
        persistState();
        renderPanels();
        renderPanelJumpTabs();
        renderInspector();
        if (activeSidebarTab === "scenes" || activeSidebarTab === "characters" || activeSidebarTab === "draw") {
          renderSidebarBody();
        }
      });
      panelJumpTabs.appendChild(btn);
    }
    updatePanelOrderButtons();
  }

  function renderPanels() {
    if (!comicPanelsEl) return;
    const layoutMode = HQExporter.normalizeLayoutMode(state.panelCount, state.layoutMode);
    state.layoutMode = layoutMode;
    comicPanelsEl.dataset.count = String(state.panelCount);
    comicPanelsEl.dataset.layout = layoutMode;
    comicPanelsEl.classList.toggle("is-focus-mode", focusMode);
    comicPanelsEl.innerHTML = "";

    const drawingMode = isDrawingActive();

    for (let i = 0; i < state.panelCount; i++) {
      const panel = state.panels[i];
      const isActive = i === state.activePanelIndex;

      const card = document.createElement("div");
      card.className = "comic-panel-frame" + (isActive ? " is-active" : "") + (drawingMode && isActive ? " is-drawing" : "");
      card.dataset.panelIndex = String(i);

      const badge = document.createElement("span");
      badge.className = "panel-badge";
      badge.textContent = `Quadro ${i + 1}`;
      card.appendChild(badge);

      const cornerControls = document.createElement("div");
      cornerControls.className = "panel-corner-controls";
      cornerControls.addEventListener("pointerdown", (ev) => ev.stopPropagation());

      const prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "panel-corner-btn";
      prevBtn.dataset.panelMove = "prev";
      prevBtn.disabled = i === 0;
      prevBtn.title = `Mover Quadro ${i + 1} uma posição para trás`;
      prevBtn.setAttribute("aria-label", prevBtn.title);
      prevBtn.textContent = "◀";
      prevBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        movePanelAt(i, -1);
      });
      cornerControls.appendChild(prevBtn);

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "panel-corner-btn";
      nextBtn.dataset.panelMove = "next";
      nextBtn.disabled = i >= state.panelCount - 1;
      nextBtn.title = `Mover Quadro ${i + 1} uma posição para frente`;
      nextBtn.setAttribute("aria-label", nextBtn.title);
      nextBtn.textContent = "▶";
      nextBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        movePanelAt(i, 1);
      });
      cornerControls.appendChild(nextBtn);

      const focusBtn = document.createElement("button");
      focusBtn.type = "button";
      focusBtn.className = "panel-corner-btn panel-focus-btn";
      const isFocusedHere = focusMode && isActive;
      focusBtn.title = isFocusedHere ? "Voltar à Visualização Completa da Tirinha" : "Editar quadro ampliado (Modo Foco)";
      focusBtn.setAttribute("aria-label", focusBtn.title);
      focusBtn.innerHTML = isFocusedHere
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
      focusBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (focusMode && state.activePanelIndex === i) {
          focusMode = false;
        } else {
          state.activePanelIndex = i;
          focusMode = true;
          persistState();
        }
        renderAll();
      });
      cornerControls.appendChild(focusBtn);
      card.appendChild(cornerControls);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${PANEL_W} ${PANEL_H}`);
      svg.setAttribute("class", "comic-panel-svg");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", `Quadro ${i + 1} da tirinha`);
      svg.innerHTML = HQArt.renderPanelInnerSvg(panel, !(drawingMode && isActive));
      card.appendChild(svg);

      if (drawingMode && isActive) {
        const drawCanvas = createLiveDrawingCanvas(i, panel);
        card.appendChild(drawCanvas);
      } else {
        attachPanelPointerHandlers(svg, i);
      }
      attachPanelDropHandlers(card, svg, i);

      comicPanelsEl.appendChild(card);
    }

    syncSelectionOverlay();
  }

  function parseSidebarDragPayload(e) {
    if (e && e.dataTransfer) {
      const raw =
        e.dataTransfer.getData("application/json") ||
        e.dataTransfer.getData("text/plain");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.kind && parsed.assetId !== undefined) return parsed;
        } catch (_) {}
      }
    }
    return activeSidebarDragPayload;
  }

  function attachPanelDropHandlers(card, svg, panelIndex) {
    card.addEventListener("dragenter", (e) => {
      if (!parseSidebarDragPayload(e) && !e.dataTransfer) return;
      e.preventDefault();
      card.classList.add("is-drop-target");
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      card.classList.add("is-drop-target");
    });

    card.addEventListener("dragleave", (e) => {
      if (!e.relatedTarget || !card.contains(e.relatedTarget)) {
        card.classList.remove("is-drop-target");
      }
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("is-drop-target");
      const payload = parseSidebarDragPayload(e);
      activeSidebarDragPayload = null;
      if (!payload || !payload.kind) return;

      const rect = svg.getBoundingClientRect();
      const rawX = rect.width > 0 ? ((e.clientX - rect.left) / rect.width) * PANEL_W : PANEL_W / 2;
      const rawY = rect.height > 0 ? ((e.clientY - rect.top) / rect.height) * PANEL_H : PANEL_H / 2;
      const x = Math.round(Math.min(PANEL_W - 14, Math.max(14, rawX)));
      const y = Math.round(Math.min(PANEL_H - 14, Math.max(14, rawY)));
      insertSidebarElement(payload.kind, payload.assetId, panelIndex, { x, y });
    });
  }

  // Cache síncrono em memória para evitar atraso de onload ao alternar Lápis <-> Borracha
  const liveDrawBufferMap = new Map();

  function getOrCreateDrawBuffer(panelIndex, panel) {
    let buf = liveDrawBufferMap.get(panelIndex);
    if (!buf) {
      buf = document.createElement("canvas");
      buf.width = PANEL_W * DRAW_SCALE;
      buf.height = PANEL_H * DRAW_SCALE;
      liveDrawBufferMap.set(panelIndex, buf);
      if (panel.drawingDataUrl) {
        const img = new Image();
        img.onload = () => {
          buf.getContext("2d").drawImage(img, 0, 0, buf.width, buf.height);
        };
        img.src = panel.drawingDataUrl;
      }
    }
    return buf;
  }

  function syncBufferFromState() {
    liveDrawBufferMap.clear();
  }

  function getDrawToolStyle(tool, size) {
    if (tool === "pencil") {
      return { alpha: 0.75, grain: true, blur: 0, lineWidth: size * DRAW_SCALE };
    }
    if (tool === "brush") {
      return { alpha: 0.85, grain: false, blur: Math.max(2, size * 0.45), lineWidth: size * DRAW_SCALE };
    }
    if (tool === "eraser") {
      return { alpha: 1, grain: false, blur: 0, lineWidth: size * DRAW_SCALE, eraser: true };
    }
    return { alpha: 1, grain: false, blur: 0, lineWidth: size * DRAW_SCALE };
  }

  function createLiveDrawingCanvas(panelIndex, panel) {
    const buf = getOrCreateDrawBuffer(panelIndex, panel);
    const canvas = document.createElement("canvas");
    canvas.width = PANEL_W * DRAW_SCALE;
    canvas.height = PANEL_H * DRAW_SCALE;
    canvas.className = "panel-draw-canvas" + (drawTool === "eraser" ? " is-eraser" : "");
    const ctx = canvas.getContext("2d");
    const bctx = buf.getContext("2d");

    const strokeCanvas = document.createElement("canvas");
    strokeCanvas.width = canvas.width;
    strokeCanvas.height = canvas.height;
    const sctx = strokeCanvas.getContext("2d");

    ctx.drawImage(buf, 0, 0);
    if (panel.drawingDataUrl) {
      const img = new Image();
      img.onload = () => {
        if (!liveDrawBufferMap.get(panelIndex)) return;
        // Só repinta se o canvas estiver limpo no boot inicial (loadSavedState)
        if (!canvas.dataset.dirty && !bctx.__hasLiveStroke) {
          bctx.clearRect(0, 0, buf.width, buf.height);
          bctx.drawImage(img, 0, 0, buf.width, buf.height);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(buf, 0, 0);
        }
      };
      img.src = panel.drawingDataUrl;
    }

    let drawing = false;
    let lastPt = null;
    let grainSeed = 0;

    function getPt(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }

    function paintSegment(targetCtx, fromPt, toPt, spec) {
      targetCtx.save();
      targetCtx.lineCap = "round";
      targetCtx.lineJoin = "round";
      targetCtx.lineWidth = spec.lineWidth;
      if (spec.eraser) {
        targetCtx.globalCompositeOperation = "destination-out";
        targetCtx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        targetCtx.globalCompositeOperation = "source-over";
        targetCtx.strokeStyle = drawColor;
        if (spec.blur > 0) {
          targetCtx.shadowBlur = spec.blur;
          targetCtx.shadowColor = drawColor;
        }
      }
      targetCtx.beginPath();
      targetCtx.moveTo(fromPt.x, fromPt.y);
      targetCtx.lineTo(toPt.x, toPt.y);
      targetCtx.stroke();

      if (spec.grain) {
        targetCtx.shadowBlur = 0;
        targetCtx.fillStyle = drawColor;
        const dist = Math.max(1, Math.hypot(toPt.x - fromPt.x, toPt.y - fromPt.y));
        const steps = Math.min(18, Math.ceil(dist / 3));
        const spread = Math.max(1.8, spec.lineWidth * 0.55);
        for (let i = 0; i <= steps; i++) {
          grainSeed = (grainSeed * 1664525 + 1013904223) >>> 0;
          const jx = (((grainSeed & 255) / 255) - 0.5) * spread * 2;
          const jy = ((((grainSeed >> 8) & 255) / 255) - 0.5) * spread * 2;
          const t = i / steps;
          targetCtx.fillRect(fromPt.x + (toPt.x - fromPt.x) * t + jx, fromPt.y + (toPt.y - fromPt.y) * t + jy, 1.5, 1.5);
        }
      }
      targetCtx.restore();
    }

    function renderLivePreview(spec) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(buf, 0, 0);
      if (!spec.eraser) {
        ctx.save();
        ctx.globalAlpha = spec.alpha;
        ctx.drawImage(strokeCanvas, 0, 0);
        ctx.restore();
      }
    }

    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      pushUndoSnapshot();
      drawing = true;
      canvas.dataset.dirty = "1";
      bctx.__hasLiveStroke = true;
      lastPt = getPt(e);
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }
      const spec = getDrawToolStyle(drawTool, drawSize);
      if (spec.eraser) {
        paintSegment(bctx, lastPt, { x: lastPt.x + 0.1, y: lastPt.y + 0.1 }, spec);
      } else {
        sctx.clearRect(0, 0, strokeCanvas.width, strokeCanvas.height);
        paintSegment(sctx, lastPt, { x: lastPt.x + 0.1, y: lastPt.y + 0.1 }, spec);
      }
      renderLivePreview(spec);
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!drawing || !lastPt) return;
      const pt = getPt(e);
      const spec = getDrawToolStyle(drawTool, drawSize);
      if (spec.eraser) {
        paintSegment(bctx, lastPt, pt, spec);
      } else {
        paintSegment(sctx, lastPt, pt, spec);
      }
      renderLivePreview(spec);
      lastPt = pt;
    });

    const finishStroke = (e) => {
      if (!drawing) return;
      drawing = false;
      lastPt = null;
      const spec = getDrawToolStyle(drawTool, drawSize);
      if (!spec.eraser) {
        bctx.save();
        bctx.globalAlpha = spec.alpha;
        bctx.drawImage(strokeCanvas, 0, 0);
        bctx.restore();
        sctx.clearRect(0, 0, strokeCanvas.width, strokeCanvas.height);
        renderLivePreview(spec);
      }
      if (canvas.releasePointerCapture) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      panel.drawingDataUrl = buf.toDataURL("image/png");
      persistState();
    };

    canvas.addEventListener("pointerup", finishStroke);
    canvas.addEventListener("pointercancel", finishStroke);
    return canvas;
  }

  function attachPanelPointerHandlers(svg, panelIndex) {
    let dragging = null;

    svg.addEventListener("pointerdown", (e) => {
      const targetGroup = e.target.closest("[data-item-id]");
      const prevPanel = state.activePanelIndex;
      state.activePanelIndex = panelIndex;

      if (!targetGroup) {
        state.selectedItemId = null;
        if (prevPanel !== panelIndex) persistState();
        if (prevPanel !== panelIndex && isDrawingActive()) {
          renderPanels();
        } else {
          syncSelectionOverlay();
        }
        renderPanelJumpTabs();
        renderInspector();
        if (prevPanel !== panelIndex || activeSidebarTab === "scenes" || activeSidebarTab === "characters") {
          renderSidebarBody();
        }
        return;
      }

      const itemId = targetGroup.getAttribute("data-item-id");
      const panel = state.panels[panelIndex];
      const item = panel.items.find((it) => it.id === itemId);
      if (!item) return;

      e.preventDefault();
      state.selectedItemId = itemId;
      pushUndoSnapshot();

      const rect = svg.getBoundingClientRect();
      const startSvgX = ((e.clientX - rect.left) / rect.width) * PANEL_W;
      const startSvgY = ((e.clientY - rect.top) / rect.height) * PANEL_H;
      dragging = {
        item,
        svg,
        offsetX: item.x - startSvgX,
        offsetY: item.y - startSvgY,
        moved: false,
      };
      if (svg.setPointerCapture) {
        try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      }

      // ATUALIZA SOMENTE OVERLAY / INSPECTOR SEM DESTRUIR O SVG ATIVO!
      syncSelectionOverlay();
      renderPanelJumpTabs();
      renderInspector();
      if (prevPanel !== panelIndex || activeSidebarTab === "characters") renderSidebarBody();
    });

    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const rect = dragging.svg.getBoundingClientRect();
      const curX = ((e.clientX - rect.left) / rect.width) * PANEL_W;
      const curY = ((e.clientY - rect.top) / rect.height) * PANEL_H;
      dragging.item.x = Math.min(PANEL_W - 10, Math.max(10, curX + dragging.offsetX));
      dragging.item.y = Math.min(PANEL_H - 10, Math.max(10, curY + dragging.offsetY));
      dragging.moved = true;

      updateLiveItemTransform(dragging.svg, dragging.item);
      syncSelectionOverlay();
    });

    const endDrag = (e) => {
      if (!dragging) return;
      if (dragging.moved) {
        persistState();
      } else {
        undoStack.pop();
        updateUndoButton();
      }
      dragging = null;
      if (svg.releasePointerCapture) {
        try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      syncSelectionOverlay();
    };

    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);

    svg.addEventListener("dblclick", (e) => {
      const targetGroup = e.target.closest("[data-item-id]");
      if (!targetGroup) return;
      const itemId = targetGroup.getAttribute("data-item-id");
      const item = state.panels[panelIndex].items.find((it) => it.id === itemId);
      if (item && item.kind === "bubble") {
        const textArea = document.getElementById("inspectorBubbleText");
        if (textArea) {
          textArea.focus();
          textArea.select();
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // ELEMENT INSPECTOR BAR
  // ---------------------------------------------------------------------------
  function applyCharObjectInteraction(charItem, objItem) {
    if (!charItem || !objItem) return;
    pushUndoSnapshot();
    const res = HQArt.computeInteractionPlacement(charItem, objItem.assetId);
    charItem.pose = res.pose;
    objItem.x = res.objX;
    objItem.y = res.objY;
    objItem.flip = res.objFlip;

    const panel = getActivePanel();
    const cIdx = panel.items.findIndex((i) => i.id === charItem.id);
    const oIdx = panel.items.findIndex((i) => i.id === objItem.id);
    if (cIdx >= 0 && oIdx >= 0 && oIdx < cIdx) {
      panel.items.splice(oIdx, 1);
      panel.items.push(objItem);
    }
    persistState();
    renderPanels();
    renderInspector();
    if (activeSidebarTab === "characters") renderSidebarBody();
    showToast(`${getItemLabel(charItem)} interagindo com ${getItemLabel(objItem)}`);
  }

  function renderInspector() {
    if (!inspectorEl) return;
    const item = getSelectedItem();
    const panel = getActivePanel();
    const panelNum = state.activePanelIndex + 1;

    if (isDrawingActive()) {
      inspectorEl.classList.remove("has-selection");
      inspectorEl.innerHTML = `
        <div class="inspector-row">
          <div class="inspector-group">
            <span class="inspector-badge">Desenhando no Quadro ${panelNum}</span>
            <span class="inspector-hint">Desenhe livremente sobre o quadro ou clique em "Mover itens" para arrastar personagens e formas.</span>
          </div>
          <button type="button" class="mini-btn is-navy" id="btnExitDrawQuick">Mover itens</button>
        </div>
      `;
      const btnEx = document.getElementById("btnExitDrawQuick");
      if (btnEx) {
        btnEx.addEventListener("click", () => {
          drawTool = "move";
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      }
      return;
    }

    if (!item) {
      inspectorEl.classList.remove("has-selection");
      inspectorEl.innerHTML = `
        <div class="inspector-idle">
          <span class="inspector-badge">Quadro ${panelNum} ativo</span>
          <span class="inspector-hint">Arraste personagens, objetos, emojis, formas ou balões nos eixos X e Y. Clique para redimensionar.</span>
        </div>
      `;
      return;
    }

    inspectorEl.classList.add("has-selection");

    if (item.kind === "character") {
      const def = HQArt.CHARACTER_DEFAULTS[item.assetId] || {};
      const isAnim = Boolean(item.isAnimal || def.isAnimal);
      const exprBtns = HQArt.EXPRESSIONS.map(
        (ex) =>
          `<button type="button" class="mini-pill${item.expression === ex.id ? " is-active" : ""}" data-insp-expr="${ex.id}">${ex.name}</button>`
      ).join("");
      const poseBtns = HQArt.POSES.map(
        (ps) =>
          `<button type="button" class="mini-pill${(item.pose || "standing") === ps.id ? " is-active" : ""}" data-insp-pose="${ps.id}">${ps.name}</button>`
      ).join("");

      const framingToggle = isAnim
        ? ""
        : `<div class="mini-pills">
            <button type="button" class="mini-pill${item.framing !== "half" ? " is-active" : ""}" data-insp-framing="full">Corpo inteiro</button>
            <button type="button" class="mini-pill${item.framing === "half" ? " is-active" : ""}" data-insp-framing="half">Meio corpo</button>
          </div>`;

      const panelObjects = panel.items.filter((i) => i.kind === "object");
      const interactHtml = panelObjects.length
        ? `<div class="inspector-interact">
            <select id="inspObjSelect" class="mini-select" aria-label="Escolher objeto para interagir">
              ${panelObjects
                .map((o) => `<option value="${HQArt.escapeXml(o.id)}">${HQArt.escapeXml(getItemLabel(o))}</option>`)
                .join("")}
            </select>
            <button type="button" class="mini-btn is-accent" id="btnInspInteractObj">Usar objeto</button>
          </div>`
        : "";

      inspectorEl.innerHTML = `
        <div class="inspector-char-stack">
          <div class="inspector-row">
            <div class="inspector-group">
              <span class="inspector-label">Expressão</span>
              <div class="mini-pills">${exprBtns}</div>
            </div>
            <div class="inspector-actions">
              ${framingToggle}
              <button type="button" class="mini-btn is-navy" id="btnInspCustomize">Visual / Acessórios</button>
              <button type="button" class="mini-btn" data-insp-flip>Inverter</button>
              <button type="button" class="mini-btn" data-insp-scale="-0.1">−</button>
              <button type="button" class="mini-btn" data-insp-scale="0.1">+</button>
              <button type="button" class="mini-btn" data-insp-back>Enviar para trás</button>
              <button type="button" class="mini-btn" data-insp-front>Trazer para frente</button>
              <button type="button" class="mini-btn is-danger" data-insp-delete>Remover</button>
            </div>
          </div>
          <div class="inspector-row">
            <div class="inspector-group">
              <span class="inspector-label">Posição / Ação</span>
              <div class="mini-pills">${poseBtns}</div>
            </div>
            ${interactHtml}
          </div>
        </div>
      `;

      bindCommonInspectorEvents(item);
      inspectorEl.querySelectorAll("[data-insp-expr]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushUndoSnapshot();
          item.expression = btn.getAttribute("data-insp-expr");
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      inspectorEl.querySelectorAll("[data-insp-pose]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushUndoSnapshot();
          item.pose = btn.getAttribute("data-insp-pose");
          persistState();
          renderPanels();
          renderInspector();
          if (activeSidebarTab === "characters") renderSidebarBody();
        });
      });
      inspectorEl.querySelectorAll("[data-insp-framing]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const fr = btn.getAttribute("data-insp-framing");
          if (item.framing === fr) return;
          pushUndoSnapshot();
          item.framing = fr;
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      const btnCust = document.getElementById("btnInspCustomize");
      if (btnCust) {
        btnCust.addEventListener("click", () => {
          activeSidebarTab = "characters";
          charSidebarMode = "customize";
          renderSidebarTabs();
          renderSidebarBody();
        });
      }
      const btnInter = document.getElementById("btnInspInteractObj");
      const selObj = document.getElementById("inspObjSelect");
      if (btnInter && selObj) {
        btnInter.addEventListener("click", () => {
          const obj = panel.items.find((o) => o.id === selObj.value);
          if (obj) applyCharObjectInteraction(item, obj);
        });
      }
      return;
    }

    if (item.kind === "object" || item.kind === "emoji" || item.kind === "shape") {
      const panelChars = item.kind === "object" ? panel.items.filter((i) => i.kind === "character") : [];
      const charInteractHtml = panelChars.length
        ? `<div class="inspector-interact">
            <select id="inspCharSelect" class="mini-select" aria-label="Escolher personagem para segurar ou usar">
              ${panelChars
                .map((c) => `<option value="${HQArt.escapeXml(c.id)}">${HQArt.escapeXml(getItemLabel(c))}</option>`)
                .join("")}
            </select>
            <button type="button" class="mini-btn is-accent" id="btnInspCharUse">Entregar ao personagem</button>
          </div>`
        : "";

      const curFill = item.fillColor !== undefined ? item.fillColor : item.color || "#C84B31";
      const curStroke = item.strokeColor || "#111827";
      const shapeColorPicker =
        item.kind === "shape"
          ? `<span class="inspector-label">Preenchimento</span>
             <div class="swatch-row swatch-compact">
              ${HQArt.SHAPE_FILL_COLORS.map(
                (dc) =>
                  `<button type="button" class="swatch-btn swatch-sm${dc.id === "none" ? " swatch-none" : ""}${
                    curFill === dc.id ? " is-active" : ""
                  }"${dc.id === "none" ? "" : ` style="background:${dc.id}"`} title="${dc.name}" data-insp-shfill="${
                    dc.id
                  }" aria-label="${dc.name}"></button>`
              ).join("")}
            </div>
            <span class="inspector-label">Borda</span>
            <div class="swatch-row swatch-compact">
              ${HQArt.DRAW_COLORS.map(
                (dc) =>
                  `<button type="button" class="swatch-btn swatch-sm${curStroke === dc.id ? " is-active" : ""}" style="background:${
                    dc.id
                  }" title="Borda: ${dc.name}" data-insp-shstroke="${dc.id}" aria-label="Borda ${dc.name}"></button>`
              ).join("")}
            </div>`
          : "";

      inspectorEl.innerHTML = `
        <div class="inspector-row">
          <div class="inspector-group">
            <span class="inspector-badge">${HQArt.escapeXml(getItemLabel(item))}</span>
            ${charInteractHtml}
            ${shapeColorPicker}
          </div>
          <div class="inspector-actions">
            <button type="button" class="mini-btn" data-insp-flip>Inverter</button>
            <button type="button" class="mini-btn" data-insp-scale="-0.12">Menor</button>
            <button type="button" class="mini-btn" data-insp-scale="0.12">Maior</button>
            <button type="button" class="mini-btn" data-insp-back>Enviar para trás</button>
            <button type="button" class="mini-btn" data-insp-front>Trazer para frente</button>
            <button type="button" class="mini-btn is-danger" data-insp-delete>Remover</button>
          </div>
        </div>
      `;
      bindCommonInspectorEvents(item);
      inspectorEl.querySelectorAll("[data-insp-shfill]").forEach((b) => {
        b.addEventListener("click", () => {
          pushUndoSnapshot();
          item.fillColor = b.getAttribute("data-insp-shfill");
          item.color = item.fillColor === "none" ? curStroke : item.fillColor;
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      inspectorEl.querySelectorAll("[data-insp-shstroke]").forEach((b) => {
        b.addEventListener("click", () => {
          pushUndoSnapshot();
          item.strokeColor = b.getAttribute("data-insp-shstroke");
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      const btnGive = document.getElementById("btnInspCharUse");
      const selCh = document.getElementById("inspCharSelect");
      if (btnGive && selCh) {
        btnGive.addEventListener("click", () => {
          const ch = panel.items.find((c) => c.id === selCh.value);
          if (ch) applyCharObjectInteraction(ch, item);
        });
      }
      return;
    }

    if (item.kind === "bubble") {
      const typeBtns = HQArt.BUBBLE_TYPES.map(
        (bt) =>
          `<button type="button" class="mini-pill${item.type === bt.id ? " is-active" : ""}" data-insp-btype="${bt.id}">${bt.name}</button>`
      ).join("");
      const sizes = [
        { label: "P", val: 12 },
        { label: "M", val: 15 },
        { label: "G", val: 18 },
      ];
      const sizeBtns = sizes
        .map(
          (sz) =>
            `<button type="button" class="mini-pill${Number(item.fontSize) === sz.val ? " is-active" : ""}" data-insp-fsize="${sz.val}">${sz.label}</button>`
        )
        .join("");

      const curFont = item.fontFamily || "sans";
      const fontSelectHtml = `<select id="inspBubbleFont" class="mini-select" aria-label="Tipografia do texto">
        ${HQArt.BUBBLE_FONTS.map(
          (f) => `<option value="${f.id}"${curFont === f.id ? " selected" : ""}>${f.name}</option>`
        ).join("")}
      </select>`;

      const tailControls =
        item.type === "narrator"
          ? ""
          : `<div class="mini-pills">
              <button type="button" class="mini-pill${item.tailDir !== "right" ? " is-active" : ""}" data-insp-tail="left">Cauda esq.</button>
              <button type="button" class="mini-pill${item.tailDir === "right" ? " is-active" : ""}" data-insp-tail="right">Cauda dir.</button>
            </div>`;

      inspectorEl.innerHTML = `
        <div class="inspector-bubble-grid">
          <textarea id="inspectorBubbleText" class="inspector-textarea" rows="2" placeholder="Digite o texto do balão">${HQArt.escapeXml(
            item.text || ""
          ).replace(/&quot;/g, '"')}</textarea>
          <div class="inspector-controls-col">
            <div class="mini-pills">${typeBtns}</div>
            <div class="inspector-subrow">
              <span class="inspector-label">Tipografia</span>
              ${fontSelectHtml}
              <span class="inspector-label">Tam.</span>
              <div class="mini-pills">${sizeBtns}</div>
              ${tailControls}
              <button type="button" class="mini-btn" data-insp-scale="-0.1">Menor</button>
              <button type="button" class="mini-btn" data-insp-scale="0.1">Maior</button>
              <button type="button" class="mini-btn" data-insp-back>Enviar para trás</button>
              <button type="button" class="mini-btn" data-insp-front>Trazer para frente</button>
              <button type="button" class="mini-btn is-danger" data-insp-delete>Remover</button>
            </div>
          </div>
        </div>
      `;

      bindCommonInspectorEvents(item);
      const ta = document.getElementById("inspectorBubbleText");
      let snapshotOnEdit = false;
      ta.addEventListener("input", () => {
        if (!snapshotOnEdit) {
          pushUndoSnapshot();
          snapshotOnEdit = true;
        }
        item.text = ta.value;
        persistState();
        renderPanels();
      });
      const fontSel = document.getElementById("inspBubbleFont");
      if (fontSel) {
        fontSel.addEventListener("change", () => {
          pushUndoSnapshot();
          item.fontFamily = fontSel.value;
          persistState();
          renderPanels();
        });
      }
      inspectorEl.querySelectorAll("[data-insp-btype]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushUndoSnapshot();
          item.type = btn.getAttribute("data-insp-btype");
          if (item.type === "narrator") item.y = 34;
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      inspectorEl.querySelectorAll("[data-insp-fsize]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushUndoSnapshot();
          item.fontSize = Number(btn.getAttribute("data-insp-fsize"));
          persistState();
          renderPanels();
          renderInspector();
        });
      });
      inspectorEl.querySelectorAll("[data-insp-tail]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushUndoSnapshot();
          item.tailDir = btn.getAttribute("data-insp-tail");
          persistState();
          renderPanels();
          renderInspector();
        });
      });
    }
  }

  function bindCommonInspectorEvents(item) {
    const btnFlip = inspectorEl.querySelector("[data-insp-flip]");
    if (btnFlip) {
      btnFlip.addEventListener("click", () => {
        pushUndoSnapshot();
        item.flip = !item.flip;
        persistState();
        renderPanels();
      });
    }
    inspectorEl.querySelectorAll("[data-insp-scale]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pushUndoSnapshot();
        const delta = Number(btn.getAttribute("data-insp-scale"));
        const nextScale = Math.min(1.8, Math.max(0.45, (Number(item.scale) || 1) + delta));
        item.scale = Number(nextScale.toFixed(2));
        persistState();
        renderPanels();
      });
    });
    const btnBack = inspectorEl.querySelector("[data-insp-back]");
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        const panel = getActivePanel();
        const idx = panel.items.findIndex((it) => it.id === item.id);
        if (idx > 0) {
          pushUndoSnapshot();
          panel.items.splice(idx, 1);
          panel.items.unshift(item);
          persistState();
          renderPanels();
          showToast("Elemento enviado para trás");
        }
      });
    }
    const btnFront = inspectorEl.querySelector("[data-insp-front]");
    if (btnFront) {
      btnFront.addEventListener("click", () => {
        const panel = getActivePanel();
        const idx = panel.items.findIndex((it) => it.id === item.id);
        if (idx >= 0 && idx < panel.items.length - 1) {
          pushUndoSnapshot();
          panel.items.splice(idx, 1);
          panel.items.push(item);
          persistState();
          renderPanels();
          showToast("Elemento trazido para frente");
        }
      });
    }
    const btnDel = inspectorEl.querySelector("[data-insp-delete]");
    if (btnDel) {
      btnDel.addEventListener("click", removeSelectedElement);
    }
  }

  function removeSelectedElement() {
    if (!state.selectedItemId) return;
    const panel = getActivePanel();
    const idx = panel.items.findIndex((it) => it.id === state.selectedItemId);
    if (idx === -1) return;
    pushUndoSnapshot();
    panel.items.splice(idx, 1);
    state.selectedItemId = null;
    persistState();
    renderPanels();
    renderInspector();
    if (activeSidebarTab === "characters") renderSidebarBody();
  }

  // ---------------------------------------------------------------------------
  // SIDEBAR CATALOGS, EMOJIS, DESENHO, FORMAS & DRAG-AND-DROP PARA OS QUADROS
  // ---------------------------------------------------------------------------
  function insertSidebarElement(kind, assetId, targetPanelIndex, dropCoords) {
    const idx =
      typeof targetPanelIndex === "number" && targetPanelIndex >= 0 && targetPanelIndex < state.panelCount
        ? targetPanelIndex
        : Math.min(Math.max(0, state.activePanelIndex), state.panelCount - 1);
    state.activePanelIndex = idx;
    const panel = state.panels[idx];
    if (!panel) return null;

    pushUndoSnapshot();
    let newItem = null;

    if (kind === "character") {
      const def = HQArt.CHARACTER_DEFAULTS[assetId] || HQArt.CHARACTER_DEFAULTS.girl;
      const charCount = panel.items.filter((i) => i.kind === "character").length;
      const xSlot = charCount === 0 ? 130 : charCount === 1 ? 268 : 200;
      const isAnim = Boolean(def.isAnimal);
      newItem = {
        id: nextId("ch"),
        kind: "character",
        assetId,
        isAnimal: isAnim,
        expression: pendingExpression,
        pose: pendingPose,
        framing: pendingFraming,
        skinColor: def.skinColor,
        hairColor: def.hairColor,
        hairStyle: def.hairStyle,
        outfitStyle: def.outfitStyle || "casual",
        bottomStyle: def.bottomStyle || (assetId === "girl" ? "skirt" : "pants"),
        outfitColor: def.outfitColor,
        pantsColor: def.pantsColor || "#1E293B",
        accessories: cloneData(def.defaultAccessories || {}),
        x: dropCoords ? dropCoords.x : xSlot,
        y: dropCoords ? dropCoords.y : isAnim ? 270 : 215,
        scale: isAnim ? 0.9 : 0.85,
        flip: charCount === 1,
      };
    } else if (kind === "emoji") {
      newItem = {
        id: nextId("em"),
        kind: "emoji",
        emoji: assetId,
        x: dropCoords ? dropCoords.x : 200,
        y: dropCoords ? dropCoords.y : 112,
        scale: 1,
        flip: false,
      };
    } else if (kind === "object") {
      const meta = HQArt.OBJECT_META && HQArt.OBJECT_META[assetId];
      const objCount = panel.items.filter((i) => i.kind === "object").length;
      newItem = {
        id: nextId("obj"),
        kind: "object",
        assetId,
        x: dropCoords ? dropCoords.x : meta ? 200 : Math.min(340, 200 + (objCount % 3) * 34),
        y: dropCoords ? dropCoords.y : meta ? meta.defaultY : 222 + (objCount % 2) * 24,
        scale: meta ? meta.defaultScale : 0.86,
        flip: false,
      };
    } else if (kind === "bubble") {
      const sbTa = document.getElementById("sidebarBubbleText");
      const rawText = sbTa ? sbTa.value : pendingBubbleDraft.text;
      const txt =
        (rawText || "").trim() ||
        (assetId === "narrator"
          ? "Enquanto isso na escola..."
          : assetId === "whisper"
          ? "Ei... não espalha sem checar!"
          : "Vamos checar essa informação!");
      const bCount = panel.items.filter((i) => i.kind === "bubble").length;
      newItem = {
        id: nextId("bub"),
        kind: "bubble",
        type: assetId,
        text: txt,
        fontSize: pendingBubbleDraft.fontSize,
        fontFamily: pendingBubbleDraft.fontFamily || "sans",
        tailDir: pendingBubbleDraft.tailDir,
        x: dropCoords ? dropCoords.x : assetId === "narrator" ? 200 : bCount % 2 === 0 ? 190 : 210,
        y: dropCoords ? dropCoords.y : assetId === "narrator" ? 32 : 70 + (bCount % 2) * 44,
        scale: 1,
        flip: false,
      };
    } else if (kind === "shape") {
      newItem = {
        id: nextId("shp"),
        kind: "shape",
        assetId,
        fillColor: shapeFillColor,
        strokeColor: shapeStrokeColor,
        color: shapeFillColor === "none" ? shapeStrokeColor : shapeFillColor,
        x: dropCoords ? dropCoords.x : 200,
        y: dropCoords ? dropCoords.y : 170,
        scale: 1,
        flip: false,
      };
      drawTool = "move";
    }

    if (!newItem) {
      undoStack.pop();
      updateUndoButton();
      return null;
    }

    panel.items.push(newItem);
    state.selectedItemId = newItem.id;
    persistState();
    renderPanels();
    renderPanelJumpTabs();
    renderInspector();
    if (activeSidebarTab === "characters" || activeSidebarTab === "draw") {
      renderSidebarBody();
    }
    return newItem;
  }

  if (sidebarBodyEl) {
    sidebarBodyEl.addEventListener("dragstart", (e) => {
      const btn = e.target.closest("[data-add-char], [data-add-obj], [data-add-emoji], [data-add-bubble], [data-add-shape]");
      if (!btn) return;
      let payload = null;
      if (btn.hasAttribute("data-add-char")) {
        payload = { kind: "character", assetId: btn.getAttribute("data-add-char") };
      } else if (btn.hasAttribute("data-add-obj")) {
        payload = { kind: "object", assetId: btn.getAttribute("data-add-obj") };
      } else if (btn.hasAttribute("data-add-emoji")) {
        payload = { kind: "emoji", assetId: btn.getAttribute("data-add-emoji") };
      } else if (btn.hasAttribute("data-add-bubble")) {
        payload = { kind: "bubble", assetId: btn.getAttribute("data-add-bubble") };
      } else if (btn.hasAttribute("data-add-shape")) {
        payload = { kind: "shape", assetId: btn.getAttribute("data-add-shape") };
      }
      if (!payload) return;
      activeSidebarDragPayload = payload;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "copy";
        const json = JSON.stringify(payload);
        e.dataTransfer.setData("application/json", json);
        e.dataTransfer.setData("text/plain", json);
      }
    });

    sidebarBodyEl.addEventListener("dragend", () => {
      activeSidebarDragPayload = null;
      if (comicPanelsEl) {
        comicPanelsEl.querySelectorAll(".is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
      }
    });
  }

  function renderSidebarTabs() {
    sidebarTabButtons.forEach((btn) => {
      const tab = btn.getAttribute("data-sidebar-tab");
      const active = tab === activeSidebarTab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  function renderSidebarBody() {
    if (!sidebarBodyEl) return;
    const activePanel = getActivePanel();

    if (activeSidebarTab === "scenes") {
      const groups = ["Todos", "Casa", "Escola", "Ar livre", "Estúdio"];
      const filtered =
        activeSceneFilter === "Todos"
          ? HQArt.SCENES
          : HQArt.SCENES.filter((s) => s.group === activeSceneFilter);

      sidebarBodyEl.innerHTML = `
        <div class="sidebar-subblock">
          <div class="expr-grid">
            ${groups
              .map(
                (g) =>
                  `<button type="button" class="expr-pill${activeSceneFilter === g ? " is-active" : ""}" data-scene-group="${g}">${g}</button>`
              )
              .join("")}
          </div>
        </div>
        <p class="sidebar-hint">Aplicar cenário ao <strong>Quadro ${state.activePanelIndex + 1}</strong>:</p>
        <div class="catalog-grid">
          ${filtered
            .map(
              (sc) => `
            <button type="button" class="catalog-card${activePanel.sceneId === sc.id ? " is-selected" : ""}" data-pick-scene="${sc.id}">
              <div class="catalog-thumb scene-thumb">${HQArt.buildThumbnailSvg("scene", sc.id)}</div>
              <span class="catalog-name">${sc.name}</span>
              <span class="catalog-sub">${sc.group}</span>
            </button>`
            )
            .join("")}
        </div>
      `;
      sidebarBodyEl.querySelectorAll("[data-scene-group]").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeSceneFilter = btn.getAttribute("data-scene-group");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-pick-scene]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const currentPanel = getActivePanel();
          const sceneId = btn.getAttribute("data-pick-scene");
          if (currentPanel.sceneId === sceneId) return;
          pushUndoSnapshot();
          currentPanel.sceneId = sceneId;
          persistState();
          renderPanels();
          renderSidebarBody();
        });
      });
      return;
    }

    if (activeSidebarTab === "characters") {
      const sel = getSelectedItem();
      const selectedChar = sel && sel.kind === "character" ? sel : null;
      if (!selectedChar && charSidebarMode === "customize") charSidebarMode = "add";

      const modeSwitch = `
        <div class="sidebar-subblock">
          <div class="segmented segmented-full">
            <button type="button" class="seg-btn${charSidebarMode === "add" ? " is-active" : ""}" data-char-mode="add">Adicionar</button>
            <button type="button" class="seg-btn${charSidebarMode === "customize" ? " is-active" : ""}" data-char-mode="customize"${
        selectedChar ? "" : " disabled"
      }>Personalizar visual</button>
          </div>
        </div>
      `;

      if (charSidebarMode === "customize" && selectedChar) {
        const def = HQArt.CHARACTER_DEFAULTS[selectedChar.assetId] || {};
        const isAnim = Boolean(selectedChar.isAnimal || def.isAnimal);
        const isRobot = selectedChar.assetId === "robot";
        const skinPalette = isAnim ? HQArt.ANIMAL_COAT_COLORS : HQArt.SKIN_TONES;
        const skinLabel = isAnim ? "Cor da pelagem / casco" : isRobot ? "Cor do chassi" : "Tom de pele";
        const curOutfitStyle = selectedChar.outfitStyle || def.outfitStyle || "casual";
        const curBottomStyle = selectedChar.bottomStyle || def.bottomStyle || (selectedChar.assetId === "girl" ? "skirt" : "pants");
        const curPantsColor = selectedChar.pantsColor || def.pantsColor || "#1E293B";
        const isDress = !isAnim && !isRobot && curOutfitStyle === "dress";
        const outfitLabel = isAnim
          ? "Cor da coleira / casco"
          : isDress
          ? "Cor do vestido"
          : "Cor da roupa";
        const curAcc = selectedChar.accessories || {};

        sidebarBodyEl.innerHTML = `
          ${modeSwitch}
          <div class="customizer-stack">
            <div class="custom-group">
              <span class="sidebar-label">Enquadramento &amp; Posição</span>
              <div class="expr-grid">
                ${
                  isAnim
                    ? ""
                    : `<button type="button" class="expr-pill${selectedChar.framing !== "half" ? " is-active" : ""}" data-cust-framing="full">Corpo inteiro</button>
                       <button type="button" class="expr-pill${selectedChar.framing === "half" ? " is-active" : ""}" data-cust-framing="half">Meio corpo</button>`
                }
                ${HQArt.POSES.map(
                  (ps) =>
                    `<button type="button" class="expr-pill${(selectedChar.pose || "standing") === ps.id ? " is-active" : ""}" data-cust-pose="${ps.id}">${ps.name}</button>`
                ).join("")}
              </div>
            </div>

            <div class="custom-group">
              <span class="sidebar-label">${skinLabel}</span>
              <div class="swatch-row">
                ${skinPalette
                  .map(
                    (c) =>
                      `<button type="button" class="swatch-btn${selectedChar.skinColor === c.id ? " is-active" : ""}" style="background:${c.id}" title="${c.name}" data-cust-skin="${c.id}" aria-label="${c.name}"></button>`
                  )
                  .join("")}
              </div>
            </div>

            ${
              isAnim || isRobot
                ? ""
                : `<div class="custom-group">
                    <span class="sidebar-label">Estilo de penteado</span>
                    <div class="expr-grid">
                      ${HQArt.HAIR_STYLES.map(
                        (hs) =>
                          `<button type="button" class="expr-pill${selectedChar.hairStyle === hs.id ? " is-active" : ""}" data-cust-hstyle="${hs.id}">${hs.name}</button>`
                      ).join("")}
                    </div>
                  </div>
                  <div class="custom-group">
                    <span class="sidebar-label">Cor do cabelo</span>
                    <div class="swatch-row">
                      ${HQArt.HAIR_COLORS.map(
                        (hc) =>
                          `<button type="button" class="swatch-btn${selectedChar.hairColor === hc.id ? " is-active" : ""}" style="background:${hc.id}" title="${hc.name}" data-cust-hcolor="${hc.id}" aria-label="${hc.name}"></button>`
                      ).join("")}
                    </div>
                  </div>
                  <div class="custom-group">
                    <span class="sidebar-label">Estilo de roupa / vestuário</span>
                    <div class="expr-grid">
                      ${HQArt.OUTFIT_STYLES.map(
                        (os) =>
                          `<button type="button" class="expr-pill${curOutfitStyle === os.id ? " is-active" : ""}" data-cust-ostyle="${os.id}">${os.name}</button>`
                      ).join("")}
                    </div>
                  </div>`
            }

            <div class="custom-group">
              <span class="sidebar-label">${outfitLabel}</span>
              <div class="swatch-row">
                ${HQArt.OUTFIT_COLORS.map(
                  (oc) =>
                    `<button type="button" class="swatch-btn${selectedChar.outfitColor === oc.id ? " is-active" : ""}" style="background:${oc.id}" title="${oc.name}" data-cust-outfit="${oc.id}" aria-label="${oc.name}"></button>`
                ).join("")}
              </div>
            </div>

            ${
              isAnim || isRobot || isDress
                ? ""
                : `<div class="custom-group">
                    <span class="sidebar-label">Calça / Saia</span>
                    <div class="expr-grid">
                      ${HQArt.BOTTOM_STYLES.map(
                        (bs) =>
                          `<button type="button" class="expr-pill${curBottomStyle === bs.id ? " is-active" : ""}" data-cust-bstyle="${bs.id}">${bs.name}</button>`
                      ).join("")}
                    </div>
                    <span class="sidebar-label" style="margin-top:10px">Cor da calça / saia</span>
                    <div class="swatch-row">
                      ${HQArt.BOTTOM_COLORS.map(
                        (bc) =>
                          `<button type="button" class="swatch-btn${curPantsColor === bc.id ? " is-active" : ""}" style="background:${bc.id}" title="${bc.name}" data-cust-pcolor="${bc.id}" aria-label="${bc.name}"></button>`
                      ).join("")}
                    </div>
                  </div>`
            }

            <div class="custom-group">
              <span class="sidebar-label">Acessórios</span>
              <div class="expr-grid">
                ${HQArt.ACCESSORY_LIST.map(
                  (ac) =>
                    `<button type="button" class="expr-pill${curAcc[ac.id] ? " is-active" : ""}" data-cust-acc="${ac.id}">${ac.name}</button>`
                ).join("")}
              </div>
            </div>
          </div>
        `;

        bindSidebarModeSwitch();
        sidebarBodyEl.querySelectorAll("[data-cust-framing]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.framing = b.getAttribute("data-cust-framing");
            persistState(); renderPanels(); renderInspector(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-pose]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.pose = b.getAttribute("data-cust-pose");
            persistState(); renderPanels(); renderInspector(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-skin]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.skinColor = b.getAttribute("data-cust-skin");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-hstyle]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.hairStyle = b.getAttribute("data-cust-hstyle");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-hcolor]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.hairColor = b.getAttribute("data-cust-hcolor");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-ostyle]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.outfitStyle = b.getAttribute("data-cust-ostyle");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-outfit]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.outfitColor = b.getAttribute("data-cust-outfit");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-bstyle]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.bottomStyle = b.getAttribute("data-cust-bstyle");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-pcolor]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.pantsColor = b.getAttribute("data-cust-pcolor");
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        sidebarBodyEl.querySelectorAll("[data-cust-acc]").forEach((b) => {
          b.addEventListener("click", () => {
            const k = b.getAttribute("data-cust-acc");
            pushUndoSnapshot();
            if (!selectedChar.accessories) selectedChar.accessories = {};
            selectedChar.accessories[k] = !selectedChar.accessories[k];
            persistState(); renderPanels(); renderSidebarBody();
          });
        });
        return;
      }

      const groups = ["Crianças", "Adultos", "Tecnologia", "Animais"];
      const groupHtml = groups
        .map((grp) => {
          const items = HQArt.CHARACTERS.filter((c) => c.category === grp);
          return `
            <div class="char-category-block">
              <span class="sidebar-group-heading">${grp}</span>
              <div class="catalog-grid">
                ${items
                  .map(
                    (ch) => `
                  <button type="button" class="catalog-card" draggable="true" data-add-char="${ch.id}">
                    <div class="catalog-thumb char-thumb">${HQArt.buildThumbnailSvg("character", ch.id)}</div>
                    <span class="catalog-name">${ch.name}</span>
                  </button>`
                  )
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");

      sidebarBodyEl.innerHTML = `
        ${modeSwitch}
        <div class="sidebar-subblock">
          <span class="sidebar-label">Enquadramento padrão</span>
          <div class="expr-grid">
            <button type="button" class="expr-pill${pendingFraming === "full" ? " is-active" : ""}" data-pick-framing="full">Corpo inteiro</button>
            <button type="button" class="expr-pill${pendingFraming === "half" ? " is-active" : ""}" data-pick-framing="half">Meio corpo</button>
          </div>
          <span class="sidebar-label" style="margin-top:10px">Expressão &amp; Posição ao inserir</span>
          <div class="expr-grid">
            ${HQArt.EXPRESSIONS.map(
              (ex) => `<button type="button" class="expr-pill${pendingExpression === ex.id ? " is-active" : ""}" data-pick-expr="${ex.id}">${ex.name}</button>`
            ).join("")}
          </div>
          <div class="expr-grid" style="margin-top:6px">
            ${HQArt.POSES.slice(0, 4)
              .map((ps) => `<button type="button" class="expr-pill${pendingPose === ps.id ? " is-active" : ""}" data-pick-pose="${ps.id}">${ps.name}</button>`)
              .join("")}
          </div>
        </div>
        ${groupHtml}
      `;

      bindSidebarModeSwitch();
      sidebarBodyEl.querySelectorAll("[data-pick-framing]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingFraming = btn.getAttribute("data-pick-framing");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-pick-expr]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingExpression = btn.getAttribute("data-pick-expr");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-pick-pose]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingPose = btn.getAttribute("data-pick-pose");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-add-char]").forEach((btn) => {
        btn.addEventListener("click", () => {
          insertSidebarElement("character", btn.getAttribute("data-add-char"));
        });
      });
      return;
    }

    if (activeSidebarTab === "objects") {
      sidebarBodyEl.innerHTML = `
        <div class="sidebar-subblock">
          <span class="sidebar-group-heading">Emojis e Reações (${HQArt.EMOJIS.length})</span>
          <div class="emoji-grid">
            ${HQArt.EMOJIS.map(
              (em) =>
                `<button type="button" class="emoji-card" draggable="true" data-add-emoji="${em.id}" title="${em.name}" aria-label="${em.name}">${em.id}</button>`
            ).join("")}
          </div>
        </div>
        <span class="sidebar-group-heading">Objetos, Móveis e Ícones (${HQArt.OBJECTS.length})</span>
        <div class="catalog-grid">
          ${HQArt.OBJECTS.map(
            (obj) => `
            <button type="button" class="catalog-card" draggable="true" data-add-obj="${obj.id}">
              <div class="catalog-thumb obj-thumb">${HQArt.buildThumbnailSvg("object", obj.id)}</div>
              <span class="catalog-name">${obj.name}</span>
            </button>`
          ).join("")}
        </div>
      `;
      sidebarBodyEl.querySelectorAll("[data-add-emoji]").forEach((btn) => {
        btn.addEventListener("click", () => {
          insertSidebarElement("emoji", btn.getAttribute("data-add-emoji"));
        });
      });
      sidebarBodyEl.querySelectorAll("[data-add-obj]").forEach((btn) => {
        btn.addEventListener("click", () => {
          insertSidebarElement("object", btn.getAttribute("data-add-obj"));
        });
      });
      return;
    }

    if (activeSidebarTab === "bubbles") {
      sidebarBodyEl.innerHTML = `
        <div class="bubble-builder">
          <span class="sidebar-label">Texto do balão ou caixa</span>
          <textarea id="sidebarBubbleText" class="sidebar-textarea" rows="3" placeholder="Escreva a fala, pensamento ou narração">${HQArt.escapeXml(
            pendingBubbleDraft.text
          ).replace(/&quot;/g, '"')}</textarea>

          <div class="bubble-options-row">
            <div>
              <span class="sidebar-label">Tamanho</span>
              <div class="expr-grid">
                <button type="button" class="expr-pill${pendingBubbleDraft.fontSize === 12 ? " is-active" : ""}" data-sb-fsize="12">P</button>
                <button type="button" class="expr-pill${pendingBubbleDraft.fontSize === 15 ? " is-active" : ""}" data-sb-fsize="15">M</button>
                <button type="button" class="expr-pill${pendingBubbleDraft.fontSize === 18 ? " is-active" : ""}" data-sb-fsize="18">G</button>
              </div>
            </div>
            <div>
              <span class="sidebar-label">Cauda</span>
              <div class="expr-grid">
                <button type="button" class="expr-pill${pendingBubbleDraft.tailDir === "left" ? " is-active" : ""}" data-sb-tail="left">Esq.</button>
                <button type="button" class="expr-pill${pendingBubbleDraft.tailDir === "right" ? " is-active" : ""}" data-sb-tail="right">Dir.</button>
              </div>
            </div>
          </div>

          <div class="sidebar-subblock">
            <span class="sidebar-label">Tipografia / Fonte</span>
            <div class="expr-grid">
              ${HQArt.BUBBLE_FONTS.map(
                (bf) =>
                  `<button type="button" class="expr-pill${pendingBubbleDraft.fontFamily === bf.id ? " is-active" : ""}" style="font-family:${bf.sampleCss}" data-sb-font="${bf.id}">${bf.name}</button>`
              ).join("")}
            </div>
          </div>

          <span class="sidebar-label">Escolha o estilo ou arraste para um quadro</span>
          <div class="catalog-grid">
            ${HQArt.BUBBLE_TYPES.map(
              (bt) => `
              <button type="button" class="catalog-card" draggable="true" data-add-bubble="${bt.id}">
                <div class="catalog-thumb bubble-thumb">${HQArt.buildThumbnailSvg("bubble", bt.id)}</div>
                <span class="catalog-name">${bt.name}</span>
              </button>`
            ).join("")}
          </div>
        </div>
      `;

      const sbTa = document.getElementById("sidebarBubbleText");
      sbTa.addEventListener("input", () => {
        pendingBubbleDraft.text = sbTa.value;
      });
      sidebarBodyEl.querySelectorAll("[data-sb-fsize]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingBubbleDraft.fontSize = Number(btn.getAttribute("data-sb-fsize"));
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-sb-tail]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingBubbleDraft.tailDir = btn.getAttribute("data-sb-tail");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-sb-font]").forEach((btn) => {
        btn.addEventListener("click", () => {
          pendingBubbleDraft.fontFamily = btn.getAttribute("data-sb-font");
          renderSidebarBody();
        });
      });
      sidebarBodyEl.querySelectorAll("[data-add-bubble]").forEach((btn) => {
        btn.addEventListener("click", () => {
          insertSidebarElement("bubble", btn.getAttribute("data-add-bubble"));
        });
      });
      return;
    }

    if (activeSidebarTab === "draw") {
      const toolList = [
        { id: "pencil", name: "Lápis (2px)", defSize: 2 },
        { id: "pen", name: "Caneta (4px)", defSize: 4 },
        { id: "brush", name: "Pincel (10px)", defSize: 10 },
        { id: "eraser", name: "Borracha", defSize: 16 },
        { id: "move", name: "Mover", defSize: null },
      ];

      sidebarBodyEl.innerHTML = `
        <div class="customizer-stack">
          <div class="custom-group">
            <span class="sidebar-label">Ferramenta de desenho no Quadro ${state.activePanelIndex + 1}</span>
            <div class="expr-grid">
              ${toolList
                .map(
                  (tl) =>
                    `<button type="button" class="expr-pill${drawTool === tl.id ? " is-active" : ""}" data-draw-tool="${tl.id}"${
                      tl.defSize ? ` data-def-size="${tl.defSize}"` : ""
                    }>${tl.name}</button>`
                )
                .join("")}
            </div>
          </div>

          <div class="custom-group">
            <div class="range-head">
              <span class="sidebar-label" style="margin-bottom:0">Espessura do traço</span>
              <span class="mono-val">${drawSize} px</span>
            </div>
            <input id="drawSizeRange" type="range" min="1" max="30" value="${drawSize}" class="draw-range">
          </div>

          <div class="custom-group">
            <span class="sidebar-label">Cor do traço (desenho livre)</span>
            <div class="swatch-row">
              ${HQArt.DRAW_COLORS.map(
                (dc) =>
                  `<button type="button" class="swatch-btn${drawColor === dc.id ? " is-active" : ""}" style="background:${dc.id}" title="${dc.name}" data-draw-color="${dc.id}" aria-label="${dc.name}"></button>`
              ).join("")}
            </div>
          </div>

          <div class="custom-group">
            <span class="sidebar-label">Formas geométricas — Preenchimento</span>
            <div class="swatch-row swatch-compact" style="margin-bottom:10px">
              ${HQArt.SHAPE_FILL_COLORS.map(
                (dc) =>
                  `<button type="button" class="swatch-btn swatch-sm${dc.id === "none" ? " swatch-none" : ""}${
                    shapeFillColor === dc.id ? " is-active" : ""
                  }"${dc.id === "none" ? "" : ` style="background:${dc.id}"`} title="${dc.name}" data-shape-fill="${
                    dc.id
                  }" aria-label="${dc.name}"></button>`
              ).join("")}
            </div>

            <span class="sidebar-label">Formas geométricas — Cor da borda</span>
            <div class="swatch-row swatch-compact" style="margin-bottom:10px">
              ${HQArt.DRAW_COLORS.map(
                (dc) =>
                  `<button type="button" class="swatch-btn swatch-sm${shapeStrokeColor === dc.id ? " is-active" : ""}" style="background:${
                    dc.id
                  }" title="Borda: ${dc.name}" data-shape-stroke="${dc.id}" aria-label="Borda ${dc.name}"></button>`
              ).join("")}
            </div>

            <div class="catalog-grid">
              ${HQArt.SHAPES.map(
                (sh) => `
                <button type="button" class="catalog-card" draggable="true" data-add-shape="${sh.id}">
                  <div class="catalog-thumb obj-thumb">${HQArt.buildThumbnailSvg("shape", sh.id, shapeFillColor, shapeStrokeColor)}</div>
                  <span class="catalog-name">${sh.name}</span>
                </button>`
              ).join("")}
            </div>
          </div>

          <button type="button" class="mini-btn is-danger" id="btnClearDrawingOnly" style="justify-content:center;width:100%;padding:8px">
            Apagar traços livres deste quadro
          </button>
        </div>
      `;

      sidebarBodyEl.querySelectorAll("[data-draw-tool]").forEach((btn) => {
        btn.addEventListener("click", () => {
          drawTool = btn.getAttribute("data-draw-tool");
          const ds = btn.getAttribute("data-def-size");
          if (ds) drawSize = Number(ds);
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      });

      const rangeEl = document.getElementById("drawSizeRange");
      const valEl = sidebarBodyEl.querySelector(".mono-val");
      if (rangeEl) {
        rangeEl.addEventListener("input", () => {
          drawSize = Number(rangeEl.value);
          if (valEl) valEl.textContent = `${drawSize} px`;
        });
      }

      sidebarBodyEl.querySelectorAll("[data-draw-color]").forEach((btn) => {
        btn.addEventListener("click", () => {
          drawColor = btn.getAttribute("data-draw-color");
          if (drawTool === "eraser" || drawTool === "move") drawTool = "pencil";
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      });

      sidebarBodyEl.querySelectorAll("[data-shape-fill]").forEach((btn) => {
        btn.addEventListener("click", () => {
          shapeFillColor = btn.getAttribute("data-shape-fill");
          const sel = getSelectedItem();
          if (sel && sel.kind === "shape") {
            pushUndoSnapshot();
            sel.fillColor = shapeFillColor;
            sel.color = shapeFillColor === "none" ? shapeStrokeColor : shapeFillColor;
            persistState();
          }
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      });

      sidebarBodyEl.querySelectorAll("[data-shape-stroke]").forEach((btn) => {
        btn.addEventListener("click", () => {
          shapeStrokeColor = btn.getAttribute("data-shape-stroke");
          const sel = getSelectedItem();
          if (sel && sel.kind === "shape") {
            pushUndoSnapshot();
            sel.strokeColor = shapeStrokeColor;
            persistState();
          }
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      });

      sidebarBodyEl.querySelectorAll("[data-add-shape]").forEach((btn) => {
        btn.addEventListener("click", () => {
          insertSidebarElement("shape", btn.getAttribute("data-add-shape"));
        });
      });

      const btnClearDraw = document.getElementById("btnClearDrawingOnly");
      if (btnClearDraw) {
        btnClearDraw.addEventListener("click", () => {
          const currentPanel = getActivePanel();
          if (!currentPanel.drawingDataUrl) return;
          pushUndoSnapshot();
          currentPanel.drawingDataUrl = null;
          liveDrawBufferMap.delete(state.activePanelIndex);
          persistState();
          renderPanels();
          showToast(`Traços do Quadro ${state.activePanelIndex + 1} apagados`);
        });
      }
    }
  }

  function bindSidebarModeSwitch() {
    sidebarBodyEl.querySelectorAll("[data-char-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        charSidebarMode = btn.getAttribute("data-char-mode");
        renderSidebarBody();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // MODAL TEMAS
  // ---------------------------------------------------------------------------
  function renderThemesModal() {
    if (!themesListEl) return;
    themesListEl.innerHTML = HQThemes.WORKSHOP_THEMES.map(
      (th) => `
      <article class="theme-card">
        <div class="theme-card-head">
          <span class="theme-chip">${th.number}</span>
          <h3>${th.title}</h3>
        </div>
        <p class="theme-desc">${th.description}</p>
        <ul class="theme-prompts">
          ${th.prompts.map((p) => `<li>${p}</li>`).join("")}
        </ul>
        <button type="button" class="btn-theme-apply" data-apply-theme="${th.id}">
          Carregar rascunho editável deste tema
        </button>
      </article>
    `
    ).join("");

    themesListEl.querySelectorAll("[data-apply-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const themeId = btn.getAttribute("data-apply-theme");
        const found = HQThemes.WORKSHOP_THEMES.find((t) => t.id === themeId);
        if (!found) return;
        pushUndoSnapshot();
        const tpl = cloneData(found.template);
        state.title = tpl.title;
        state.authors = tpl.authors;
        state.panelCount = tpl.panelCount;
        state.layoutMode = HQExporter.normalizeLayoutMode(tpl.panelCount, "row");
        state.activePanelIndex = 0;
        state.selectedItemId = null;
        state.panels = tpl.panels.concat([createEmptyPanel("square")]);
        if (activeSidebarTab === "draw") drawTool = "move";
        syncBufferFromState();
        persistState();
        closeThemesModal();
        renderAll();
        showToast(`Modelo "${found.title}" carregado para edição`);
      });
    });
  }

  function openThemesModal() {
    if (!themesModal) return;
    themesModal.hidden = false;
    btnCloseThemes && btnCloseThemes.focus();
  }

  function closeThemesModal() {
    if (!themesModal) return;
    themesModal.hidden = true;
  }

  let pendingConfirmAction = null;

  function openConfirmDialog({ title, message, confirmLabel, onConfirm }) {
    if (!confirmModal || !confirmModalMessage || !btnConfirmOk) {
      if (window.confirm(message)) onConfirm();
      return;
    }
    if (confirmModalTitle) confirmModalTitle.textContent = title || "Confirmar ação";
    confirmModalMessage.textContent = message || "";
    btnConfirmOk.textContent = confirmLabel || "Confirmar";
    pendingConfirmAction = onConfirm;
    confirmModal.hidden = false;
    btnConfirmCancel && btnConfirmCancel.focus();
  }

  function closeConfirmDialog() {
    if (!confirmModal) return;
    confirmModal.hidden = true;
    pendingConfirmAction = null;
  }

  function clonePanelWithFreshIds(srcPanel) {
    const copy = cloneData(srcPanel);
    copy.items = (copy.items || []).map((it) => {
      const prefix =
        it.kind === "character"
          ? "ch"
          : it.kind === "object"
          ? "obj"
          : it.kind === "emoji"
          ? "em"
          : it.kind === "shape"
          ? "shp"
          : "bub";
      return Object.assign({}, it, { id: nextId(prefix) });
    });
    return copy;
  }

  function duplicateActivePanel() {
    const srcIdx = state.activePanelIndex;
    const srcPanel = getActivePanel();
    const cloned = clonePanelWithFreshIds(srcPanel);

    if (state.panelCount < 4) {
      pushUndoSnapshot();
      const insertIdx = srcIdx + 1;
      state.panels.splice(insertIdx, 0, cloned);
      state.panels = state.panels.slice(0, 4);
      state.panelCount += 1;
      state.layoutMode = HQExporter.normalizeLayoutMode(state.panelCount, state.layoutMode);
      state.activePanelIndex = insertIdx;
      state.selectedItemId = null;
      syncBufferFromState();
      persistState();
      renderAll();
      showToast(`Quadro ${srcIdx + 1} duplicado para o Quadro ${insertIdx + 1}`);
      return;
    }

    const targetIdx = (srcIdx + 1) % 4;
    const targetPanel = state.panels[targetIdx];
    const targetHasContent =
      Boolean(targetPanel.items.length) || Boolean(targetPanel.drawingDataUrl) || targetPanel.sceneId !== "minimal";

    const applyOverwrite = () => {
      pushUndoSnapshot();
      state.panels[targetIdx] = clonePanelWithFreshIds(srcPanel);
      state.activePanelIndex = targetIdx;
      state.selectedItemId = null;
      syncBufferFromState();
      persistState();
      renderAll();
      showToast(`Quadro ${srcIdx + 1} copiado para o Quadro ${targetIdx + 1}`);
    };

    if (targetHasContent) {
      openConfirmDialog({
        title: "Duplicar Quadro (4 quadros)",
        message: `A tirinha já está no limite de 4 quadros. Deseja copiar o conteúdo do Quadro ${
          srcIdx + 1
        } substituindo o Quadro ${targetIdx + 1}?`,
        confirmLabel: "Substituir Quadro",
        onConfirm: applyOverwrite,
      });
    } else {
      applyOverwrite();
    }
  }

  // ---------------------------------------------------------------------------
  // INIT & GLOBAL EVENTS
  // ---------------------------------------------------------------------------
  function renderAll() {
    renderHeaderInputs();
    renderPanelJumpTabs();
    renderPanels();
    renderInspector();
    renderSidebarTabs();
    renderSidebarBody();
  }

  if (titleInput) {
    let titleSnapDone = false;
    titleInput.addEventListener("focus", () => { titleSnapDone = false; });
    titleInput.addEventListener("input", () => {
      if (!titleSnapDone) {
        pushUndoSnapshot();
        titleSnapDone = true;
      }
      state.title = titleInput.value;
      persistState();
    });
  }

  if (authorsInput) {
    let authSnapDone = false;
    authorsInput.addEventListener("focus", () => { authSnapDone = false; });
    authorsInput.addEventListener("input", () => {
      if (!authSnapDone) {
        pushUndoSnapshot();
        authSnapDone = true;
      }
      state.authors = authorsInput.value;
      persistState();
    });
  }

  layoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextCount = Number(btn.getAttribute("data-layout-count"));
      if (nextCount === state.panelCount) return;
      pushUndoSnapshot();
      state.panelCount = nextCount;
      state.layoutMode =
        nextCount === 4 && state.layoutMode === "row"
          ? "grid"
          : HQExporter.normalizeLayoutMode(nextCount, state.layoutMode);
      if (state.activePanelIndex >= nextCount) {
        state.activePanelIndex = nextCount - 1;
        state.selectedItemId = null;
      }
      persistState();
      renderAll();
    });
  });

  if (btnMovePanelPrev) {
    btnMovePanelPrev.addEventListener("click", () => movePanelAt(state.activePanelIndex, -1));
  }
  if (btnMovePanelNext) {
    btnMovePanelNext.addEventListener("click", () => movePanelAt(state.activePanelIndex, 1));
  }
  if (btnDuplicatePanel) {
    btnDuplicatePanel.addEventListener("click", duplicateActivePanel);
  }

  if (btnFocusMode) {
    btnFocusMode.addEventListener("click", () => {
      focusMode = !focusMode;
      renderAll();
    });
  }

  sidebarTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextTab = btn.getAttribute("data-sidebar-tab");
      activeSidebarTab = nextTab;
      if (nextTab === "draw" && drawTool === "move") {
        drawTool = "pencil";
        drawSize = 2;
      }
      renderSidebarTabs();
      renderPanels();
      renderInspector();
      renderSidebarBody();
    });
  });

  if (btnUndo) btnUndo.addEventListener("click", undo);

  if (btnClearPanel) {
    btnClearPanel.addEventListener("click", () => {
      const p = getActivePanel();
      if (!p.items.length && !p.drawingDataUrl && p.sceneId === "minimal") return;
      const clearNow = () => {
        pushUndoSnapshot();
        p.items = [];
        p.drawingDataUrl = null;
        p.sceneId = "minimal";
        state.selectedItemId = null;
        liveDrawBufferMap.delete(state.activePanelIndex);
        persistState();
        renderAll();
        showToast(`Quadro ${state.activePanelIndex + 1} limpo`);
      };
      openConfirmDialog({
        title: "Limpar Quadro",
        message: `Deseja limpar todos os elementos, desenhos livres e cenário do Quadro ${state.activePanelIndex + 1}?`,
        confirmLabel: "Limpar Quadro",
        onConfirm: clearNow,
      });
    });
  }

  if (btnNewStrip) {
    btnNewStrip.addEventListener("click", () => {
      const hasAnyWork =
        Boolean((state.title || "").trim()) ||
        Boolean((state.authors || "").trim()) ||
        state.panels.some((p) => p.items.length > 0 || p.drawingDataUrl);

      const resetStrip = () => {
        pushUndoSnapshot();
        state = createDefaultState();
        state.title = "";
        state.authors = "";
        focusMode = false;
        if (activeSidebarTab === "draw") drawTool = "move";
        syncBufferFromState();
        persistState();
        renderAll();
        showToast("Nova tirinha criada");
      };

      if (hasAnyWork) {
        openConfirmDialog({
          title: "Nova Tirinha / Limpar Tudo",
          message: "Tem certeza que deseja limpar tudo e iniciar uma nova tirinha em branco?",
          confirmLabel: "Limpar Tudo e Começar Nova",
          onConfirm: resetStrip,
        });
      } else {
        resetStrip();
      }
    });
  }

  if (btnConfirmCancel) btnConfirmCancel.addEventListener("click", closeConfirmDialog);
  if (btnConfirmClose) btnConfirmClose.addEventListener("click", closeConfirmDialog);
  if (btnConfirmOk) {
    btnConfirmOk.addEventListener("click", () => {
      const fn = pendingConfirmAction;
      closeConfirmDialog();
      if (typeof fn === "function") fn();
    });
  }
  if (confirmModal) {
    confirmModal.addEventListener("click", (e) => {
      if (e.target === confirmModal) closeConfirmDialog();
    });
  }

  if (btnDownloadPng) {
    btnDownloadPng.addEventListener("click", async () => {
      btnDownloadPng.disabled = true;
      const labelSpan = btnDownloadPng.querySelector("span");
      const oldText = labelSpan ? labelSpan.textContent : "";
      if (labelSpan) labelSpan.textContent = "Gerando PNG...";
      try {
        const res = await HQExporter.exportStripToPng(state);
        showToast(`Imagem baixada (${res.width}×${res.height} px): ${res.filename}`);
      } catch (err) {
        showToast("Erro ao exportar imagem PNG");
      } finally {
        btnDownloadPng.disabled = false;
        if (labelSpan) labelSpan.textContent = oldText;
      }
    });
  }

  if (btnThemeIdeas) btnThemeIdeas.addEventListener("click", openThemesModal);
  if (btnCloseThemes) btnCloseThemes.addEventListener("click", closeThemesModal);
  if (themesModal) {
    themesModal.addEventListener("click", (e) => {
      if (e.target === themesModal) closeThemesModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      undo();
    } else if ((e.key === "Delete" || e.key === "Backspace") && !typing && state.selectedItemId) {
      e.preventDefault();
      removeSelectedElement();
    } else if (e.key === "Escape") {
      if (confirmModal && !confirmModal.hidden) {
        closeConfirmDialog();
      } else if (themesModal && !themesModal.hidden) {
        closeThemesModal();
      } else if (focusMode) {
        focusMode = false;
        renderAll();
      }
    }
  });

  renderThemesModal();
  renderAll();
})();
