(function () {
  const STORAGE_KEY = "hq_criativa_letramento_v2";
  const MAX_HISTORY = 30;

  let uidCounter = Date.now();
  function nextId(prefix) {
    uidCounter += 1;
    return `${prefix}-${uidCounter}`;
  }

  function createEmptyPanel(sceneId) {
    return {
      sceneId: sceneId || "classroom",
      items: [],
    };
  }

  function createDefaultState() {
    return {
      title: "Fake news não passa por aqui",
      authors: "",
      panelCount: 3,
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
  let charSidebarMode = "add"; // "add" | "customize"
  let pendingExpression = "happy";
  let pendingPose = "standing";
  let pendingFraming = "full";
  let pendingBubbleDraft = {
    type: "speech",
    text: "Oi! Vamos checar essa fonte?",
    fontSize: 15,
    tailDir: "left",
  };

  // DOM
  const titleInput = document.getElementById("hqTitleInput");
  const authorsInput = document.getElementById("hqAuthorsInput");
  const layoutButtons = document.querySelectorAll("[data-layout-count]");
  const panelJumpTabs = document.getElementById("panelJumpTabs");
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
    return "Balão";
  }

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------
  function renderHeaderInputs() {
    if (titleInput && titleInput.value !== state.title) titleInput.value = state.title || "";
    if (authorsInput && authorsInput.value !== state.authors) authorsInput.value = state.authors || "";
    layoutButtons.forEach((btn) => {
      const n = Number(btn.getAttribute("data-layout-count"));
      const active = n === state.panelCount;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    updateUndoButton();
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
        if (activeSidebarTab === "scenes" || activeSidebarTab === "characters") renderSidebarBody();
      });
      panelJumpTabs.appendChild(btn);
    }
  }

  function renderPanels() {
    if (!comicPanelsEl) return;
    comicPanelsEl.dataset.count = String(state.panelCount);
    comicPanelsEl.innerHTML = "";

    for (let i = 0; i < state.panelCount; i++) {
      const panel = state.panels[i];
      const isActive = i === state.activePanelIndex;

      const card = document.createElement("div");
      card.className = "comic-panel-frame" + (isActive ? " is-active" : "");
      card.dataset.panelIndex = String(i);

      const badge = document.createElement("span");
      badge.className = "panel-badge";
      badge.textContent = `Quadro ${i + 1}`;
      card.appendChild(badge);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 400 340");
      svg.setAttribute("class", "comic-panel-svg");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", `Quadro ${i + 1} da tirinha`);

      const innerMarkup = HQArt.renderPanelInnerSvg(panel);
      let selectionBox = "";
      if (isActive && state.selectedItemId) {
        const sel = panel.items.find((it) => it.id === state.selectedItemId);
        if (sel) selectionBox = buildSelectionHalo(sel);
      }
      svg.innerHTML = innerMarkup + selectionBox;

      attachPanelPointerHandlers(svg, i);
      card.appendChild(svg);
      comicPanelsEl.appendChild(card);
    }
  }

  function buildSelectionHalo(item) {
    const sc = Number(item.scale) || 1;
    let hw = 48 * sc;
    let hh = 48 * sc;
    let offsetY = 0;
    if (item.kind === "character") {
      const isAnim = Boolean(
        item.isAnimal || (HQArt.CHARACTER_DEFAULTS[item.assetId] && HQArt.CHARACTER_DEFAULTS[item.assetId].isAnimal)
      );
      if (isAnim) {
        hw = 48 * sc;
        hh = 70 * sc;
        offsetY = -6 * sc;
      } else {
        hw = 54 * sc;
        hh = item.framing === "half" ? 104 * sc : 132 * sc;
        offsetY = item.framing === "half" ? -12 * sc : 12 * sc;
      }
    } else if (item.kind === "bubble") {
      const info = HQArt.renderBubbleMarkup(item);
      hw = (info.boxW / 2 + 8) * sc;
      hh = (info.boxH / 2 + 12) * sc;
      offsetY = 6 * sc;
    }
    const x = Math.round(item.x - hw);
    const y = Math.round(item.y + offsetY - hh);
    const w = Math.round(hw * 2);
    const h = Math.round(hh * 2);
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#C84B31" stroke-width="2.2" stroke-dasharray="6 4" pointer-events="none"/>`;
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
        renderPanels();
        renderPanelJumpTabs();
        renderInspector();
        if (activeSidebarTab === "scenes" || activeSidebarTab === "characters") renderSidebarBody();
        return;
      }

      const itemId = targetGroup.getAttribute("data-item-id");
      const panel = state.panels[panelIndex];
      const item = panel.items.find((it) => it.id === itemId);
      if (!item) return;

      state.selectedItemId = itemId;
      pushUndoSnapshot();

      const rect = svg.getBoundingClientRect();
      const startSvgX = ((e.clientX - rect.left) / rect.width) * 400;
      const startSvgY = ((e.clientY - rect.top) / rect.height) * 340;
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

      renderPanels();
      renderPanelJumpTabs();
      renderInspector();
      if (activeSidebarTab === "characters") renderSidebarBody();
    });

    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const rect = dragging.svg.getBoundingClientRect();
      const curX = ((e.clientX - rect.left) / rect.width) * 400;
      const curY = ((e.clientY - rect.top) / rect.height) * 340;
      dragging.item.x = Math.min(378, Math.max(22, curX + dragging.offsetX));
      dragging.item.y = Math.min(322, Math.max(22, curY + dragging.offsetY));
      dragging.moved = true;

      const liveG = dragging.svg.querySelector(`[data-item-id="${CSS.escape(dragging.item.id)}"]`);
      if (liveG) {
        const sc = Number(dragging.item.scale) || 1;
        const flip = dragging.item.flip ? -1 : 1;
        liveG.setAttribute(
          "transform",
          `translate(${Math.round(dragging.item.x)} ${Math.round(dragging.item.y)}) scale(${(
            sc * flip
          ).toFixed(3)} ${sc.toFixed(3)})`
        );
      }
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
      renderPanels();
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

    // Garante que o objeto interagido fique à frente das mãos do personagem
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

    if (!item) {
      inspectorEl.classList.remove("has-selection");
      inspectorEl.innerHTML = `
        <div class="inspector-idle">
          <span class="inspector-badge">Quadro ${panelNum} ativo</span>
          <span class="inspector-hint">Clique e arraste personagens, objetos ou balões livremente no quadro.</span>
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
              <button type="button" class="mini-btn" data-insp-scale="-0.08">A-</button>
              <button type="button" class="mini-btn" data-insp-scale="0.08">A+</button>
              <button type="button" class="mini-btn" data-insp-front>Frente</button>
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

    if (item.kind === "object") {
      const panelChars = panel.items.filter((i) => i.kind === "character");
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

      inspectorEl.innerHTML = `
        <div class="inspector-row">
          <div class="inspector-group">
            <span class="inspector-badge">${HQArt.escapeXml(getItemLabel(item))}</span>
            ${charInteractHtml}
          </div>
          <div class="inspector-actions">
            <button type="button" class="mini-btn" data-insp-flip>Inverter</button>
            <button type="button" class="mini-btn" data-insp-scale="-0.12">Menor</button>
            <button type="button" class="mini-btn" data-insp-scale="0.12">Maior</button>
            <button type="button" class="mini-btn" data-insp-front>Frente</button>
            <button type="button" class="mini-btn is-danger" data-insp-delete>Remover</button>
          </div>
        </div>
      `;
      bindCommonInspectorEvents(item);
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
              <span class="inspector-label">Fonte</span>
              <div class="mini-pills">${sizeBtns}</div>
              ${tailControls}
              <button type="button" class="mini-btn" data-insp-front>Frente</button>
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
        const nextScale = Math.min(1.6, Math.max(0.5, (Number(item.scale) || 1) + delta));
        item.scale = Number(nextScale.toFixed(2));
        persistState();
        renderPanels();
      });
    });
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
        }
      });
    }
    const btnDel = inspectorEl.querySelector("[data-insp-delete]");
    if (btnDel) {
      btnDel.addEventListener("click", () => {
        removeSelectedElement();
      });
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
  // SIDEBAR CATALOGS & CUSTOMIZER
  // ---------------------------------------------------------------------------
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
          const sceneId = btn.getAttribute("data-pick-scene");
          if (activePanel.sceneId === sceneId) return;
          pushUndoSnapshot();
          activePanel.sceneId = sceneId;
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
      if (!selectedChar && charSidebarMode === "customize") {
        charSidebarMode = "add";
      }

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
        const outfitLabel = isAnim ? "Cor da coleira / casco" : "Cor da roupa";
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
        sidebarBodyEl.querySelectorAll("[data-cust-outfit]").forEach((b) => {
          b.addEventListener("click", () => {
            pushUndoSnapshot();
            selectedChar.outfitColor = b.getAttribute("data-cust-outfit");
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

      // Modo Adicionar Personagem (Crianças, Adultos, Tecnologia, Animais)
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
                  <button type="button" class="catalog-card" data-add-char="${ch.id}">
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
          const charId = btn.getAttribute("data-add-char");
          const def = HQArt.CHARACTER_DEFAULTS[charId] || HQArt.CHARACTER_DEFAULTS.girl;
          pushUndoSnapshot();
          const charCount = activePanel.items.filter((i) => i.kind === "character").length;
          const xSlot = charCount === 0 ? 130 : charCount === 1 ? 268 : 200;
          const isAnim = Boolean(def.isAnimal);
          const newItem = {
            id: nextId("ch"),
            kind: "character",
            assetId: charId,
            isAnimal: isAnim,
            expression: pendingExpression,
            pose: pendingPose,
            framing: pendingFraming,
            skinColor: def.skinColor,
            hairColor: def.hairColor,
            hairStyle: def.hairStyle,
            outfitColor: def.outfitColor,
            accessories: cloneData(def.defaultAccessories || {}),
            x: xSlot,
            y: isAnim ? 270 : 215,
            scale: isAnim ? 0.9 : 0.85,
            flip: charCount === 1,
          };
          activePanel.items.push(newItem);
          state.selectedItemId = newItem.id;
          persistState();
          renderPanels();
          renderInspector();
          renderSidebarBody();
        });
      });
      return;
    }

    if (activeSidebarTab === "objects") {
      sidebarBodyEl.innerHTML = `
        <p class="sidebar-hint">Clique em um objeto para adicionar ao <strong>Quadro ${state.activePanelIndex + 1}</strong> e arraste ou conecte a um personagem.</p>
        <div class="catalog-grid">
          ${HQArt.OBJECTS.map(
            (obj) => `
            <button type="button" class="catalog-card" data-add-obj="${obj.id}">
              <div class="catalog-thumb obj-thumb">${HQArt.buildThumbnailSvg("object", obj.id)}</div>
              <span class="catalog-name">${obj.name}</span>
            </button>`
          ).join("")}
        </div>
      `;
      sidebarBodyEl.querySelectorAll("[data-add-obj]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const objId = btn.getAttribute("data-add-obj");
          pushUndoSnapshot();
          const objCount = activePanel.items.filter((i) => i.kind === "object").length;
          const newItem = {
            id: nextId("obj"),
            kind: "object",
            assetId: objId,
            x: Math.min(340, 200 + (objCount % 3) * 34),
            y: 222 + (objCount % 2) * 24,
            scale: 0.86,
            flip: false,
          };
          activePanel.items.push(newItem);
          state.selectedItemId = newItem.id;
          persistState();
          renderPanels();
          renderInspector();
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

          <span class="sidebar-label">Escolha o estilo para inserir</span>
          <div class="catalog-grid">
            ${HQArt.BUBBLE_TYPES.map(
              (bt) => `
              <button type="button" class="catalog-card" data-add-bubble="${bt.id}">
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
      sidebarBodyEl.querySelectorAll("[data-add-bubble]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const btype = btn.getAttribute("data-add-bubble");
          const txt =
            (sbTa.value || "").trim() ||
            (btype === "narrator" ? "Enquanto isso na escola..." : "Vamos checar essa informação!");
          pushUndoSnapshot();
          const bCount = activePanel.items.filter((i) => i.kind === "bubble").length;
          const newItem = {
            id: nextId("bub"),
            kind: "bubble",
            type: btype,
            text: txt,
            fontSize: pendingBubbleDraft.fontSize,
            tailDir: pendingBubbleDraft.tailDir,
            x: btype === "narrator" ? 200 : bCount % 2 === 0 ? 190 : 210,
            y: btype === "narrator" ? 32 : 70 + (bCount % 2) * 44,
            scale: 1,
            flip: false,
          };
          activePanel.items.push(newItem);
          state.selectedItemId = newItem.id;
          persistState();
          renderPanels();
          renderInspector();
        });
      });
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
        state.activePanelIndex = 0;
        state.selectedItemId = null;
        state.panels = tpl.panels.concat([createEmptyPanel("square")]);
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
      if (state.activePanelIndex >= nextCount) {
        state.activePanelIndex = nextCount - 1;
        state.selectedItemId = null;
      }
      persistState();
      renderAll();
    });
  });

  sidebarTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSidebarTab = btn.getAttribute("data-sidebar-tab");
      renderSidebarTabs();
      renderSidebarBody();
    });
  });

  if (btnUndo) btnUndo.addEventListener("click", undo);

  if (btnClearPanel) {
    btnClearPanel.addEventListener("click", () => {
      const p = getActivePanel();
      if (!p.items.length && p.sceneId === "minimal") return;
      pushUndoSnapshot();
      p.items = [];
      p.sceneId = "minimal";
      state.selectedItemId = null;
      persistState();
      renderAll();
      showToast(`Quadro ${state.activePanelIndex + 1} limpo`);
    });
  }

  if (btnNewStrip) {
    btnNewStrip.addEventListener("click", () => {
      const hasAnyItems = state.panels.some((p) => p.items.length > 0);
      if (hasAnyItems && !window.confirm("Deseja iniciar uma nova tirinha em branco?")) {
        return;
      }
      pushUndoSnapshot();
      state = createDefaultState();
      state.title = "";
      state.authors = "";
      persistState();
      renderAll();
      showToast("Nova tirinha criada");
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
    } else if (e.key === "Escape" && themesModal && !themesModal.hidden) {
      closeThemesModal();
    }
  });

  renderThemesModal();
  renderAll();
})();
