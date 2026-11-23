(function (global) {
  function slugifyFilename(title) {
    const clean = String(title || "tirinha-hq-criativa")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return (clean || "tirinha-hq-criativa") + ".png";
  }

  function computeStripDimensions(state) {
    const count = Math.min(state.panelCount || 3, state.panels.length);
    const outerPad = 36;
    const headerH = 88;
    const panelW = 400;
    const panelH = 340;
    const gutter = 18;
    const totalW = outerPad * 2 + count * panelW + (count - 1) * gutter;
    const totalH = outerPad * 2 + headerH + panelH;
    return { count, outerPad, headerH, panelW, panelH, gutter, totalW, totalH };
  }

  function buildHeaderAndClipDefs(state, dims) {
    const { outerPad, panelW, panelH, totalW } = dims;
    const titleText = (state.title || "").trim() || "Minha Tirinha Digital";
    const authorsText = (state.authors || "").trim();
    const esc = global.HQArt.escapeXml;

    const clipDefs = Array.from({ length: dims.count })
      .map(
        (_, i) =>
          `<clipPath id="export-panel-clip-${i}"><rect x="0" y="0" width="${panelW}" height="${panelH}" rx="2"/></clipPath>`
      )
      .join("");

    const authorLine = authorsText
      ? `<text x="${outerPad}" y="${outerPad + 54}" font-family='"Segoe UI", system-ui, -apple-system, Arial, sans-serif' font-size="18" font-weight="500" fill="#4B5563">Autoria: ${esc(authorsText)}</text>`
      : `<text x="${outerPad}" y="${outerPad + 54}" font-family='"Segoe UI", system-ui, -apple-system, Arial, sans-serif' font-size="16" font-weight="500" fill="#6B7280">Oficina de Letramento Digital</text>`;

    const headerSvg = `
      <rect x="${outerPad}" y="${outerPad + 66}" width="${totalW - outerPad * 2}" height="3" rx="1.5" fill="#C84B31"/>
      <text x="${outerPad}" y="${outerPad + 28}" font-family='"Segoe UI", system-ui, -apple-system, Arial, sans-serif' font-size="30" font-weight="700" fill="#102542">${esc(titleText)}</text>
      ${authorLine}
    `;

    return { clipDefs, headerSvg };
  }

  // Exporta camada base (cenario + personagens + objetos + emojis + formas), separando baloes para compor sobre os tracos de desenho
  function buildExportSvgDocument(state, mode = "all") {
    const dims = computeStripDimensions(state);
    const { outerPad, headerH, panelW, panelH, gutter, totalW, totalH } = dims;
    const panels = state.panels.slice(0, dims.count);
    const { clipDefs, headerSvg } = buildHeaderAndClipDefs(state, dims);

    const panelsMarkup = panels
      .map((panel, i) => {
        const px = outerPad + i * (panelW + gutter);
        const py = outerPad + headerH;
        let inner = "";
        if (mode === "under") {
          inner = global.HQArt.renderPanelUnderLayerSvg(panel);
        } else if (mode === "over") {
          inner = global.HQArt.renderPanelOverLayerSvg(panel);
        } else {
          inner = global.HQArt.renderPanelInnerSvg(panel);
        }
        const border =
          mode === "under"
            ? ""
            : `<rect x="0" y="0" width="${panelW}" height="${panelH}" rx="2" fill="none" stroke="#111827" stroke-width="5"/>`;
        return `
          <g transform="translate(${px} ${py})">
            <g clip-path="url(#export-panel-clip-${i})">
              ${inner}
            </g>
            ${border}
          </g>
        `;
      })
      .join("");

    const bgRect = mode === "over" ? "" : `<rect width="${totalW}" height="${totalH}" fill="#FFFFFF"/>`;
    const head = mode === "over" ? "" : headerSvg;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>${clipDefs}</defs>
  ${bgRect}
  ${head}
  ${panelsMarkup}
</svg>`;

    return { svg, totalW, totalH, dims };
  }

  function svgStringToBase64Url(svgStr) {
    const bytes = new TextEncoder().encode(svgStr);
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return "data:image/svg+xml;base64," + btoa(bin);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível carregar camada gráfica."));
      img.src = src;
    });
  }

  async function renderStripToCanvas(state) {
    const dims = computeStripDimensions(state);
    const scale = state.panelCount >= 4 ? 1.8 : 2.1;
    const outW = Math.round(dims.totalW * scale);
    const outH = Math.round(dims.totalH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outW, outH);

    const panels = state.panels.slice(0, dims.count);
    const hasDrawings = panels.some((p) => Boolean(p.drawingDataUrl));

    if (!hasDrawings) {
      const { svg } = buildExportSvgDocument(state, "all");
      const img = await loadImage(svgStringToBase64Url(svg));
      ctx.drawImage(img, 0, 0, outW, outH);
      return { canvas, outW, outH };
    }

    // Composição em 3 camadas:
    // 1. Cenário + personagens + objetos + emojis + formas geométricas
    const underDoc = buildExportSvgDocument(state, "under");
    const underImg = await loadImage(svgStringToBase64Url(underDoc.svg));
    ctx.drawImage(underImg, 0, 0, outW, outH);

    // 2. Traços livres (desenho e borracha) exatamente na área de cada quadro
    for (let i = 0; i < panels.length; i++) {
      const dUrl = panels[i].drawingDataUrl;
      if (!dUrl) continue;
      const drawImg = await loadImage(dUrl);
      const px = (dims.outerPad + i * (dims.panelW + dims.gutter)) * scale;
      const py = (dims.outerPad + dims.headerH) * scale;
      ctx.drawImage(drawImg, px, py, dims.panelW * scale, dims.panelH * scale);
    }

    // 3. Balões e bordas HQ nítidas por cima de tudo
    const overDoc = buildExportSvgDocument(state, "over");
    const overImg = await loadImage(svgStringToBase64Url(overDoc.svg));
    ctx.drawImage(overImg, 0, 0, outW, outH);

    return { canvas, outW, outH };
  }

  async function exportStripToPng(state) {
    const { canvas, outW, outH } = await renderStripToCanvas(state);
    const filename = slugifyFilename(state.title);

    return new Promise((resolve, reject) => {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Falha ao gerar arquivo PNG."));
            return;
          }
          const dlUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = dlUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(dlUrl), 1500);
          resolve({ filename, width: outW, height: outH });
        }, "image/png");
      } else {
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve({ filename, width: outW, height: outH });
      }
    });
  }

  global.HQExporter = {
    buildExportSvgDocument,
    renderStripToCanvas,
    exportStripToPng,
  };
})(window);
