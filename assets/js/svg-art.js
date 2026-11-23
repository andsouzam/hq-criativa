(function (global) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const INK = "#111827";
  const BURNT = "#C84B31";

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");

  function escapeXml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapLines(text, maxLineWidth, fontSize) {
    const raw = String(text || "").trim() || "...";
    const paragraphs = raw.split(/\r?\n/);
    const fontSpec = `600 ${fontSize}px "Segoe UI", system-ui, -apple-system, Arial, sans-serif`;
    if (measureCtx) measureCtx.font = fontSpec;

    const lines = [];
    const maxW = Math.max(80, maxLineWidth);
    const estWidth = (s) =>
      measureCtx ? measureCtx.measureText(s).width : s.length * fontSize * 0.56;

    for (const para of paragraphs) {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push("");
        continue;
      }
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (estWidth(test) <= maxW) {
          current = test;
        } else {
          if (current) lines.push(current);
          if (estWidth(word) > maxW) {
            let chunk = "";
            for (const ch of word) {
              if (estWidth(chunk + ch) > maxW && chunk) {
                lines.push(chunk);
                chunk = ch;
              } else {
                chunk += ch;
              }
            }
            current = chunk;
          } else {
            current = word;
          }
        }
      }
      if (current) lines.push(current);
    }

    let widthUsed = 0;
    for (const l of lines) {
      widthUsed = Math.max(widthUsed, estWidth(l));
    }
    return { lines, widthUsed };
  }

  // ---------------------------------------------------------------------------
  // CATÁLOGOS E OPÇÕES DE PERSONALIZAÇÃO
  // ---------------------------------------------------------------------------
  const SCENES = global.HQScenes ? global.HQScenes.SCENES : [];

  const CHARACTER_DEFAULTS = {
    girl: {
      name: "Criança menina",
      category: "Crianças",
      isAnimal: false,
      bodyScale: 0.94,
      skinColor: "#B5744B",
      hairColor: "#1E1B18",
      hairStyle: "puffs",
      outfitColor: "#C84B31",
      pantsColor: "#1E3A5F",
      defaultAccessories: { glasses: false, hat: false, necklace: false, watch: false },
    },
    boy: {
      name: "Criança menino",
      category: "Crianças",
      isAnimal: false,
      bodyScale: 0.94,
      skinColor: "#F0B892",
      hairColor: "#1E1B18",
      hairStyle: "short",
      outfitColor: "#2563EB",
      pantsColor: "#1F2937",
      defaultAccessories: { glasses: false, hat: false, necklace: false, watch: false },
    },
    teacher: {
      name: "Professor(a)",
      category: "Adultos",
      isAnimal: false,
      bodyScale: 1.0,
      skinColor: "#E6AE86",
      hairColor: "#5C3A21",
      hairStyle: "bun",
      outfitColor: "#102542",
      pantsColor: "#334155",
      defaultAccessories: { glasses: true, hat: false, necklace: false, watch: true },
    },
    adult: {
      name: "Adulto casual",
      category: "Adultos",
      isAnimal: false,
      bodyScale: 1.0,
      skinColor: "#D4956A",
      hairColor: "#1E1B18",
      hairStyle: "long",
      outfitColor: "#0F766E",
      pantsColor: "#1E293B",
      defaultAccessories: { glasses: false, hat: false, necklace: true, watch: false },
    },
    elder: {
      name: "Pessoa idosa",
      category: "Adultos",
      isAnimal: false,
      bodyScale: 0.98,
      skinColor: "#EBBFA4",
      hairColor: "#CBD5E1",
      hairStyle: "bun",
      outfitColor: "#0F766E",
      pantsColor: "#475569",
      defaultAccessories: { glasses: true, hat: false, necklace: true, watch: false },
    },
    detective: {
      name: "Detetive Fake News",
      category: "Adultos",
      isAnimal: false,
      bodyScale: 1.0,
      skinColor: "#E8B490",
      hairColor: "#5C3A21",
      hairStyle: "short",
      outfitColor: "#B6935E",
      pantsColor: "#3B2818",
      defaultAccessories: { glasses: false, hat: true, necklace: false, watch: true },
    },
    robot: {
      name: "Robô / Algoritmo",
      category: "Tecnologia",
      isAnimal: false,
      bodyScale: 1.0,
      skinColor: "#CBD5E1",
      hairColor: "#C84B31",
      hairStyle: "short",
      outfitColor: "#102542",
      pantsColor: "#64748B",
      defaultAccessories: { glasses: false, hat: false, necklace: false, watch: false },
    },
    cat: {
      name: "Gato",
      category: "Animais",
      isAnimal: true,
      bodyScale: 1.0,
      skinColor: "#F59E0B",
      hairColor: "#78350F",
      hairStyle: "short",
      outfitColor: "#C84B31",
      pantsColor: "#C84B31",
      defaultAccessories: { glasses: false, hat: false, necklace: true, watch: false },
    },
    dog: {
      name: "Cachorro",
      category: "Animais",
      isAnimal: true,
      bodyScale: 1.0,
      skinColor: "#C68B59",
      hairColor: "#78350F",
      hairStyle: "short",
      outfitColor: "#2563EB",
      pantsColor: "#2563EB",
      defaultAccessories: { glasses: false, hat: false, necklace: true, watch: false },
    },
    rabbit: {
      name: "Coelho",
      category: "Animais",
      isAnimal: true,
      bodyScale: 1.0,
      skinColor: "#F8FAFC",
      hairColor: "#F9A8D4",
      hairStyle: "short",
      outfitColor: "#0F766E",
      pantsColor: "#0F766E",
      defaultAccessories: { glasses: false, hat: false, necklace: false, watch: false },
    },
    turtle: {
      name: "Tartaruga",
      category: "Animais",
      isAnimal: true,
      bodyScale: 1.0,
      skinColor: "#22C55E",
      hairColor: "#15803D",
      hairStyle: "short",
      outfitColor: "#854D0E",
      pantsColor: "#854D0E",
      defaultAccessories: { glasses: false, hat: false, necklace: false, watch: false },
    },
  };

  const CHARACTERS = Object.keys(CHARACTER_DEFAULTS).map((id) => ({
    id,
    name: CHARACTER_DEFAULTS[id].name,
    category: CHARACTER_DEFAULTS[id].category,
    isAnimal: CHARACTER_DEFAULTS[id].isAnimal,
  }));

  const EXPRESSIONS = [
    { id: "happy", name: "Feliz" },
    { id: "surprised", name: "Surpreso" },
    { id: "thoughtful", name: "Pensativo" },
    { id: "alert", name: "Desconfiado" },
  ];

  const POSES = [
    { id: "standing", name: "Em pé" },
    { id: "sitting", name: "Sentado" },
    { id: "holding", name: "Segurando" },
    { id: "typing", name: "Digitando" },
    { id: "pointing", name: "Apontando" },
    { id: "walking", name: "Andando" },
  ];

  const HAIR_STYLES = [
    { id: "short", name: "Curto" },
    { id: "curly", name: "Cacheado" },
    { id: "puffs", name: "Coques" },
    { id: "long", name: "Longo" },
    { id: "bun", name: "Coque alto" },
    { id: "spiky", name: "Arrepiado" },
    { id: "bald", name: "Careca" },
  ];

  const SKIN_TONES = [
    { id: "#FCE0CE", name: "Claro rosado" },
    { id: "#F0B892", name: "Claro médio" },
    { id: "#D4956A", name: "Pardo claro" },
    { id: "#B5744B", name: "Pardo escuro" },
    { id: "#824B2B", name: "Negro médio" },
    { id: "#4E2B18", name: "Negro escuro" },
  ];

  const ANIMAL_COAT_COLORS = [
    { id: "#F59E0B", name: "Caramelo" },
    { id: "#C68B59", name: "Dourado" },
    { id: "#FDE68A", name: "Creme" },
    { id: "#94A3B8", name: "Cinza" },
    { id: "#F8FAFC", name: "Branco" },
    { id: "#22C55E", name: "Verde" },
  ];

  const HAIR_COLORS = [
    { id: "#1E1B18", name: "Preto" },
    { id: "#5C3A21", name: "Castanho" },
    { id: "#E2B23B", name: "Loiro" },
    { id: "#B8421B", name: "Ruivo" },
    { id: "#CBD5E1", name: "Grisalho" },
    { id: "#2563EB", name: "Azul" },
  ];

  const OUTFIT_COLORS = [
    { id: "#C84B31", name: "Laranja" },
    { id: "#102542", name: "Marinho" },
    { id: "#2563EB", name: "Azul" },
    { id: "#0F766E", name: "Verde" },
    { id: "#D97706", name: "Mostarda" },
    { id: "#9F1239", name: "Vinho" },
  ];

  const ACCESSORY_LIST = [
    { id: "glasses", name: "Óculos" },
    { id: "hat", name: "Chapéu" },
    { id: "necklace", name: "Colar" },
    { id: "watch", name: "Relógio" },
  ];

  // ---------------------------------------------------------------------------
  // ROSTO E EXPRESSÕES HUMANAS
  // ---------------------------------------------------------------------------
  function renderHumanFace(expressionId, faceCenterY, isAdult) {
    const y = faceCenterY;
    let brows = "";
    let eyes = "";
    let mouth = "";

    switch (expressionId) {
      case "surprised":
        brows = `
          <path d="M-18 ${y - 16} Q-11 ${y - 22} -5 ${y - 16}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>
          <path d="M5 ${y - 16} Q11 ${y - 22} 18 ${y - 16}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-10" cy="${y - 6}" r="4.3" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
          <circle cx="-9" cy="${y - 6}" r="2" fill="${INK}"/>
          <circle cx="10" cy="${y - 6}" r="4.3" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
          <circle cx="11" cy="${y - 6}" r="2" fill="${INK}"/>
        `;
        mouth = `<ellipse cx="0" cy="${y + 13}" rx="4.8" ry="6" fill="${INK}"/>`;
        break;

      case "thoughtful":
        brows = `
          <line x1="-17" y1="${y - 14}" x2="-5" y2="${y - 15}" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>
          <path d="M5 ${y - 16} Q11 ${y - 21} 18 ${y - 15}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-10" cy="${y - 6}" r="3.2" fill="${INK}"/>
          <circle cx="-8.8" cy="${y - 7.2}" r="1.1" fill="#FFFFFF"/>
          <circle cx="11" cy="${y - 7}" r="3.2" fill="${INK}"/>
          <circle cx="12.2" cy="${y - 8.2}" r="1.1" fill="#FFFFFF"/>
        `;
        mouth = `<path d="M-7 ${y + 12} Q2 ${y + 10} 9 ${y + 13}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>`;
        break;

      case "alert":
        brows = `
          <line x1="-18" y1="${y - 17}" x2="-5" y2="${y - 11}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
          <line x1="18" y1="${y - 17}" x2="5" y2="${y - 11}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
        `;
        eyes = `
          <path d="M-15 ${y - 6} Q-10 ${y - 10} -5 ${y - 6}" fill="none" stroke="${INK}" stroke-width="2.3"/>
          <circle cx="-9.5" cy="${y - 5}" r="2.4" fill="${INK}"/>
          <path d="M5 ${y - 6} Q10 ${y - 10} 15 ${y - 6}" fill="none" stroke="${INK}" stroke-width="2.3"/>
          <circle cx="10.5" cy="${y - 5}" r="2.4" fill="${INK}"/>
        `;
        mouth = `<path d="M-8 ${y + 13} Q0 ${y + 8} 8 ${y + 13}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>`;
        break;

      case "happy":
      default:
        brows = `
          <path d="M-16 ${y - 14} Q-10 ${y - 18} -5 ${y - 14}" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>
          <path d="M5 ${y - 14} Q10 ${y - 18} 16 ${y - 14}" fill="none" stroke="${INK}" stroke-width="2.1" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-10" cy="${y - 6}" r="3.2" fill="${INK}"/>
          <circle cx="-8.8" cy="${y - 7.2}" r="1.1" fill="#FFFFFF"/>
          <circle cx="10" cy="${y - 6}" r="3.2" fill="${INK}"/>
          <circle cx="11.2" cy="${y - 7.2}" r="1.1" fill="#FFFFFF"/>
        `;
        mouth = isAdult
          ? `<path d="M-9 ${y + 10} Q0 ${y + 17} 9 ${y + 10}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`
          : `<path d="M-9 ${y + 9} Q0 ${y + 19} 9 ${y + 9} Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
        break;
    }

    const nose = `<path d="M0 ${y - 2} Q3 ${y + 3} -1 ${y + 5}" fill="none" stroke="#9A5B3C" stroke-width="1.6" stroke-linecap="round"/>`;
    return brows + eyes + nose + mouth;
  }

  // ---------------------------------------------------------------------------
  // PENTEADOS HUMANOS (ENCAIXE PERFEITO NA CABEÇA cy=-58 r=28)
  // Regra geométrica SVG: rx == |x0| mantém centro do arco em (0, -58)
  // ---------------------------------------------------------------------------
  function renderHairBack(style, color) {
    switch (style) {
      case "long":
        return `<path d="M-32 -58 A32 34 0 0 1 32 -58 L34 -2 Q18 5 0 2 Q-18 5 -34 -2 Z" fill="${color}" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>`;
      case "curly":
        return `
          <circle cx="-26" cy="-70" r="16" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
          <circle cx="26" cy="-70" r="16" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
          <circle cx="0" cy="-81" r="21" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
          <circle cx="-29" cy="-50" r="12" fill="${color}" stroke="${INK}" stroke-width="2"/>
          <circle cx="29" cy="-50" r="12" fill="${color}" stroke="${INK}" stroke-width="2"/>
          <circle cx="0" cy="-60" r="30.5" fill="${color}"/>
        `;
      case "puffs":
        return `
          <circle cx="-30" cy="-84" r="14" fill="${color}" stroke="${INK}" stroke-width="2.3"/>
          <circle cx="30" cy="-84" r="14" fill="${color}" stroke="${INK}" stroke-width="2.3"/>
          <circle cx="0" cy="-60" r="31" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
        `;
      case "bun":
        return `
          <circle cx="0" cy="-94" r="14" fill="${color}" stroke="${INK}" stroke-width="2.3"/>
          <circle cx="0" cy="-60" r="31" fill="${color}" stroke="${INK}" stroke-width="2.2"/>
        `;
      case "spiky":
        return `<path d="M-30 -58 L-33 -88 L-15 -87 L-2 -103 L12 -87 L27 -96 L32 -58 Z" fill="${color}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
      case "short":
        return `<path d="M-30 -58 A30 32 0 0 1 30 -58 Z" fill="${color}" stroke="${INK}" stroke-width="2.2"/>`;
      case "bald":
      default:
        return "";
    }
  }

  function renderHairFront(style, color) {
    switch (style) {
      case "bald":
        return `<path d="M-12 -80 Q0 -85 12 -79" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.55" stroke-linecap="round"/>`;
      case "spiky":
        return `<path d="M-30 -58 A30 31 0 0 1 30 -58 Q18 -72 6 -66 Q-2 -74 -12 -66 Q-22 -70 -30 -58 Z" fill="${color}"/>`;
      case "curly":
        return `<path d="M-30 -58 A30 31 0 0 1 30 -58 Q18 -70 10 -76 Q0 -66 -10 -76 Q-18 -70 -30 -58 Z" fill="${color}"/>`;
      case "puffs":
        return `
          <path d="M-30 -58 A30 31 0 0 1 30 -58 Q14 -76 0 -68 Q-14 -76 -30 -58 Z" fill="${color}"/>
          <path d="M-24 -76 L-18 -72" stroke="${BURNT}" stroke-width="4" stroke-linecap="round"/>
          <path d="M24 -76 L18 -72" stroke="${BURNT}" stroke-width="4" stroke-linecap="round"/>
        `;
      case "long":
        return `
          <path d="M-30 -58 A30 31.5 0 0 1 30 -58 Q18 -72 5 -74 Q-6 -64 -30 -58 Z" fill="${color}"/>
          <path d="M-30 -58 Q-6 -64 5 -74 Q18 -72 30 -58" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        `;
      case "bun":
        return `
          <path d="M-30 -58 A30 31.5 0 0 1 30 -58 Q16 -74 0 -70 Q-16 -74 -30 -58 Z" fill="${color}"/>
          <path d="M-30 -58 Q-16 -74 0 -70 Q16 -74 30 -58" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>
        `;
      case "short":
      default:
        return `
          <path d="M-30 -58 A30 31.5 0 0 1 30 -58 Q20 -73 5 -72 Q-4 -79 -15 -70 Q-24 -70 -30 -58 Z" fill="${color}"/>
          <path d="M-30 -58 Q-24 -70 -15 -70 Q-4 -79 5 -72 Q20 -73 30 -58" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
        `;
    }
  }

  function renderAccessoriesFaceAndHead(acc, headCenterY, hasGlasses) {
    let svg = "";
    if (hasGlasses) {
      svg += `
        <rect x="-20" y="${headCenterY - 12}" width="16" height="12" rx="3" fill="rgba(255,255,255,0.22)" stroke="${INK}" stroke-width="2.1"/>
        <rect x="4" y="${headCenterY - 12}" width="16" height="12" rx="3" fill="rgba(255,255,255,0.22)" stroke="${INK}" stroke-width="2.1"/>
        <line x1="-4" y1="${headCenterY - 6}" x2="4" y2="${headCenterY - 6}" stroke="${INK}" stroke-width="2.1"/>
      `;
    }
    if (acc && acc.hat) {
      svg += `
        <path d="M-25 ${headCenterY - 22} L-16 ${headCenterY - 46} Q0 ${headCenterY - 52} 16 ${headCenterY - 46} L25 ${headCenterY - 22} Z" fill="#785A3C" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>
        <rect x="-24" y="${headCenterY - 28}" width="48" height="6" fill="#3B2818"/>
        <ellipse cx="0" cy="${headCenterY - 21}" rx="39" ry="6.5" fill="#8B6B4A" stroke="${INK}" stroke-width="2.2"/>
      `;
    }
    return svg;
  }

  function renderHumanArmsAndWatch(pose, sleeveColor, skinColor, hasWatch) {
    let arms = "";
    let watchMarkup = "";
    switch (pose) {
      case "sitting":
        arms = `
          <path d="M-27 -10 Q-36 16 -24 38" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round"/>
          <circle cx="-24" cy="40" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <path d="M25 -10 Q38 14 48 34 L22 38" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="20" cy="38" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<rect x="31" y="33" width="6" height="9" rx="2" fill="#1E293B" stroke="#FACC15" stroke-width="1.3"/>`;
        break;

      case "holding":
        arms = `
          <path d="M-27 -10 Q-42 18 -34 48" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round"/>
          <circle cx="-34" cy="50" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <path d="M26 -8 L44 16 L54 -2" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="55" cy="-4" r="6" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<circle cx="49" cy="6" r="4" fill="#FACC15" stroke="${INK}" stroke-width="1.8"/>`;
        break;

      case "typing":
        arms = `
          <path d="M-26 -8 L20 12 L42 14" fill="none" stroke="${sleeveColor}" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M26 -8 L44 12 L58 14" fill="none" stroke="${sleeveColor}" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="44" cy="14" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <circle cx="59" cy="14" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<rect x="49" y="10" width="5" height="9" rx="1.5" fill="#1E293B" stroke="#FACC15" stroke-width="1.2"/>`;
        break;

      case "pointing":
        arms = `
          <path d="M-27 -10 Q-40 18 -33 48" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round"/>
          <circle cx="-33" cy="50" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <path d="M26 -8 L52 -24 L65 -32" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="67" cy="-34" r="5.8" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<circle cx="56" cy="-27" r="4" fill="#FACC15" stroke="${INK}" stroke-width="1.8"/>`;
        break;

      case "walking":
        arms = `
          <path d="M-27 -10 L-42 18 L-38 42" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="-38" cy="44" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <path d="M27 -10 L42 14 L50 34" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="51" cy="36" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<rect x="43" y="25" width="7" height="5" rx="1.5" fill="#1E293B" stroke="#FACC15" stroke-width="1.2"/>`;
        break;

      case "standing":
      default:
        arms = `
          <path d="M-27 -10 Q-43 18 -35 48" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round"/>
          <circle cx="-35" cy="50" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
          <path d="M27 -10 Q43 18 35 48" fill="none" stroke="${sleeveColor}" stroke-width="11" stroke-linecap="round"/>
          <circle cx="35" cy="50" r="5.5" fill="${skinColor}" stroke="${INK}" stroke-width="2"/>
        `;
        if (hasWatch) watchMarkup = `<rect x="31" y="38" width="9" height="5" rx="1.5" fill="#1E293B" stroke="#FACC15" stroke-width="1.2"/>`;
        break;
    }
    return arms + watchMarkup;
  }

  function renderHumanLegsFull(pose, pantsColor, isSkirt) {
    if (pose === "sitting") {
      return `
        <!-- Coxas horizontais + pernas dobradas -->
        <rect x="-26" y="48" width="58" height="20" rx="8" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="20" y="54" width="20" height="58" rx="6" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="-12" y="58" width="20" height="54" rx="6" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
        <!-- Sapatos -->
        <path d="M-14 108 H12 Q18 108 18 118 H-14 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M18 108 H46 Q52 108 52 118 H18 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      `;
    }
    if (pose === "walking") {
      return `
        <g transform="translate(-12 50) rotate(18)">
          <rect x="-11" y="0" width="22" height="68" rx="6" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
          <path d="M-12 64 H14 Q20 64 20 75 H-12 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        </g>
        <g transform="translate(12 50) rotate(-18)">
          <rect x="-11" y="0" width="22" height="68" rx="6" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
          <path d="M-12 64 H16 Q22 64 22 75 H-12 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        </g>
        ${isSkirt ? `<path d="M-30 48 L30 48 L36 74 L-36 74 Z" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>` : ""}
      `;
    }
    // standing / holding / typing / pointing -> Corpo inteiro ereto
    return `
      <rect x="-25" y="50" width="21" height="72" rx="5" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
      <rect x="4" y="50" width="21" height="72" rx="5" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>
      ${isSkirt ? `<path d="M-30 48 L30 48 L35 76 L-35 76 Z" fill="${pantsColor}" stroke="${INK}" stroke-width="2.3"/>` : ""}
      <!-- Sapatos / Tênis -->
      <path d="M-28 118 H-2 Q3 118 3 130 H-28 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M2 118 H28 Q33 118 33 130 H2 Z" fill="#1F2937" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <line x1="-26" y1="127" x2="1" y2="127" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="4" y1="127" x2="31" y2="127" stroke="#FFFFFF" stroke-width="2"/>
    `;
  }

  function renderHumanCharacter(item, def) {
    const pose = item.pose || "standing";
    const framing = item.framing === "half" ? "half" : "full";
    const skin = item.skinColor || def.skinColor;
    const hairColor = item.hairColor || def.hairColor;
    const hairStyle = item.hairStyle || def.hairStyle;
    const outfit = item.outfitColor || def.outfitColor;
    const pants = def.pantsColor || "#1E293B";
    const acc = Object.assign({}, def.defaultAccessories, item.accessories || {});
    const isAdult = def.category === "Adultos";
    const isGirl = item.assetId === "girl";
    const expr = item.expression || "happy";

    const tilt = pose === "typing" ? "rotate(5 0 20)" : "";
    const sleeveColor = item.assetId === "girl" || item.assetId === "adult" ? skin : outfit;

    // Legs (Full vs Half framing)
    const legsMarkup =
      framing === "full"
        ? renderHumanLegsFull(pose, pants, isGirl)
        : `<rect x="-30" y="50" width="60" height="30" rx="4" fill="${pants}" stroke="${INK}" stroke-width="2.3"/>`;

    // Torso details per character archetype
    let torsoDetail = "";
    if (item.assetId === "teacher") {
      torsoDetail = `
        <polygon points="-11,-14 11,-14 0,24" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>
        <line x1="-11" y1="-14" x2="-17" y2="16" stroke="#FFFFFF" stroke-width="2"/>
        <line x1="11" y1="-14" x2="17" y2="16" stroke="#FFFFFF" stroke-width="2"/>
      `;
    } else if (item.assetId === "elder") {
      torsoDetail = `
        <rect x="-9" y="-14" width="18" height="66" fill="#FEF3C7" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="0" cy="4" r="2" fill="${INK}"/>
        <circle cx="0" cy="19" r="2" fill="${INK}"/>
        <circle cx="0" cy="34" r="2" fill="${INK}"/>
      `;
    } else if (item.assetId === "detective") {
      torsoDetail = `
        <polygon points="-13,-14 0,14 13,-14" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>
        <polygon points="-3,-6 3,-6 4.5,20 0,25 -4.5,20" fill="#C84B31" stroke="${INK}" stroke-width="1.4"/>
        <rect x="-32" y="38" width="64" height="7" fill="#5C4033" stroke="${INK}" stroke-width="1.6"/>
        <rect x="-5" y="36" width="10" height="10" rx="1" fill="#FACC15" stroke="${INK}" stroke-width="1.5"/>
      `;
    } else if (item.assetId === "boy") {
      torsoDetail = `<rect x="-13" y="4" width="26" height="20" rx="4" fill="rgba(255,255,255,0.28)" stroke="${INK}" stroke-width="1.6"/>`;
    } else if (item.assetId === "girl") {
      torsoDetail = `<rect x="7" y="4" width="13" height="13" rx="2" fill="#FDE68A" stroke="${INK}" stroke-width="1.6"/>`;
    } else if (item.assetId === "adult") {
      torsoDetail = `<path d="M-11 -14 L0 -2 L11 -14" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round"/>`;
    }

    const necklaceSvg = acc.necklace
      ? `<path d="M-10 -14 Q0 0 10 -14" fill="none" stroke="#FACC15" stroke-width="2.4" stroke-linecap="round"/>
         <circle cx="0" cy="-4" r="3.4" fill="#FDE047" stroke="${INK}" stroke-width="1.4"/>`
      : "";

    const bodyScale = def.bodyScale || 1;
    return `
      <g transform="scale(${bodyScale})">
        ${legsMarkup}
        <g transform="${tilt}">
          ${renderHairBack(hairStyle, hairColor)}
          <rect x="-7.5" y="-28" width="15" height="18" fill="${skin}"/>
          ${renderHumanArmsAndWatch(pose, sleeveColor, skin, acc.watch)}
          <path d="M-29 -14 L29 -14 L32 52 L-32 52 Z" fill="${outfit}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
          ${torsoDetail}
          ${necklaceSvg}
          <circle cx="0" cy="-58" r="28" fill="${skin}" stroke="${INK}" stroke-width="2.4"/>
          ${renderHairFront(hairStyle, hairColor)}
          ${renderHumanFace(expr, -55, isAdult)}
          ${renderAccessoriesFaceAndHead(acc, -58, acc.glasses)}
        </g>
      </g>
    `;
  }

  // ---------------------------------------------------------------------------
  // ROBÔ / ALGORITMO
  // ---------------------------------------------------------------------------
  function renderRobotFace(expressionId) {
    switch (expressionId) {
      case "surprised":
        return `
          <circle cx="-11" cy="-58" r="5.5" fill="#38BDF8" stroke="#BAE6FD" stroke-width="1.5"/>
          <circle cx="11" cy="-58" r="5.5" fill="#38BDF8" stroke="#BAE6FD" stroke-width="1.5"/>
          <circle cx="0" cy="-43" r="4" fill="none" stroke="#38BDF8" stroke-width="2"/>
        `;
      case "thoughtful":
        return `
          <rect x="-17" y="-60" width="11" height="4" rx="2" fill="#FACC15"/>
          <circle cx="11" cy="-59" r="4.5" fill="#FACC15"/>
          <line x1="-8" y1="-44" x2="10" y2="-46" stroke="#FACC15" stroke-width="2.5" stroke-linecap="round"/>
        `;
      case "alert":
        return `
          <path d="M-18 -62 L-7 -56 L-18 -54 Z" fill="#F87171"/>
          <path d="M18 -62 L7 -56 L18 -54 Z" fill="#F87171"/>
          <path d="M-11 -43 L-5 -47 L0 -43 L5 -47 L11 -43" fill="none" stroke="#F87171" stroke-width="2.4" stroke-linecap="round"/>
        `;
      case "happy":
      default:
        return `
          <path d="M-17 -56 Q-11 -63 -5 -56" fill="none" stroke="#34D399" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M5 -56 Q11 -63 17 -56" fill="none" stroke="#34D399" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M-10 -45 Q0 -37 10 -45" fill="none" stroke="#34D399" stroke-width="2.6" stroke-linecap="round"/>
        `;
    }
  }

  function renderRobotCharacter(item, def) {
    const pose = item.pose || "standing";
    const framing = item.framing === "half" ? "half" : "full";
    const chassis = item.skinColor || def.skinColor;
    const accent = item.outfitColor || def.outfitColor;
    const ear = item.hairColor || def.hairColor;
    const acc = item.accessories || {};

    const legs =
      framing === "full"
        ? pose === "sitting"
          ? `<rect x="-24" y="50" width="54" height="18" rx="6" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
             <rect x="16" y="58" width="18" height="54" rx="5" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
             <rect x="-12" y="58" width="18" height="54" rx="5" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
             <rect x="-14" y="106" width="24" height="12" rx="4" fill="#1F2937" stroke="${INK}" stroke-width="2"/>
             <rect x="14" y="106" width="24" height="12" rx="4" fill="#1F2937" stroke="${INK}" stroke-width="2"/>`
          : `<rect x="-24" y="52" width="18" height="68" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
             <rect x="6" y="52" width="18" height="68" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
             <rect x="-28" y="114" width="26" height="14" rx="4" fill="#1E293B" stroke="${INK}" stroke-width="2.2"/>
             <rect x="2" y="114" width="26" height="14" rx="4" fill="#1E293B" stroke="${INK}" stroke-width="2.2"/>`
        : `<rect x="-24" y="52" width="18" height="28" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>
           <rect x="6" y="52" width="18" height="28" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.3"/>`;

    return `
      ${legs}
      <line x1="0" y1="-88" x2="0" y2="-106" stroke="${INK}" stroke-width="3"/>
      <circle cx="0" cy="-108" r="5" fill="${ear}" stroke="${INK}" stroke-width="2"/>
      <rect x="-9" y="-30" width="18" height="16" fill="#64748B" stroke="${INK}" stroke-width="2"/>
      ${renderHumanArmsAndWatch(pose, "#64748B", ear, acc.watch)}
      <rect x="-30" y="-14" width="60" height="68" rx="10" fill="${chassis}" stroke="${INK}" stroke-width="2.4"/>
      <rect x="-19" y="0" width="38" height="28" rx="5" fill="${accent}" stroke="${INK}" stroke-width="2"/>
      <circle cx="-7" cy="14" r="4" fill="#38BDF8"/>
      <rect x="3" y="11" width="11" height="6" rx="2" fill="#FACC15"/>
      ${acc.necklace ? `<path d="M-11 -14 Q0 -2 11 -14" fill="none" stroke="#FACC15" stroke-width="2.4"/>` : ""}
      <rect x="-30" y="-88" width="60" height="56" rx="12" fill="${chassis}" stroke="${INK}" stroke-width="2.4"/>
      <rect x="-36" y="-68" width="6" height="18" rx="2" fill="${ear}" stroke="${INK}" stroke-width="2"/>
      <rect x="30" y="-68" width="6" height="18" rx="2" fill="${ear}" stroke="${INK}" stroke-width="2"/>
      <rect x="-23" y="-74" width="46" height="35" rx="6" fill="#0F172A" stroke="${INK}" stroke-width="2"/>
      ${renderRobotFace(item.expression || "happy")}
      ${renderAccessoriesFaceAndHead(acc, -56, acc.glasses)}
    `;
  }

  // ---------------------------------------------------------------------------
  // ANIMAIS EXPRESSIVOS (GATO, CACHORRO, COELHO, TARTARUGA) — CORPO INTEIRO
  // ---------------------------------------------------------------------------
  function renderAnimalFace(expr, yBase) {
    const y = yBase;
    if (expr === "surprised") {
      return `
        <circle cx="-8" cy="${y - 4}" r="3.8" fill="#FFFFFF" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="-8" cy="${y - 4}" r="1.6" fill="${INK}"/>
        <circle cx="8" cy="${y - 4}" r="3.8" fill="#FFFFFF" stroke="${INK}" stroke-width="1.6"/>
        <circle cx="8" cy="${y - 4}" r="1.6" fill="${INK}"/>
        <circle cx="0" cy="${y + 8}" r="3" fill="${INK}"/>
      `;
    }
    if (expr === "alert") {
      return `
        <line x1="-13" y1="${y - 10}" x2="-4" y2="${y - 6}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="13" y1="${y - 10}" x2="4" y2="${y - 6}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="-8" cy="${y - 4}" r="2.4" fill="${INK}"/>
        <circle cx="8" cy="${y - 4}" r="2.4" fill="${INK}"/>
        <line x1="-5" y1="${y + 8}" x2="5" y2="${y + 8}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      `;
    }
    if (expr === "thoughtful") {
      return `
        <line x1="-13" y1="${y - 9}" x2="-5" y2="${y - 9}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 ${y - 10} Q9 ${y - 14} 13 ${y - 9}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="-8" cy="${y - 4}" r="2.6" fill="${INK}"/>
        <circle cx="8" cy="${y - 5}" r="2.6" fill="${INK}"/>
        <path d="M-4 ${y + 8} Q1 ${y + 6} 6 ${y + 9}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      `;
    }
    return `
      <circle cx="-8" cy="${y - 4}" r="2.8" fill="${INK}"/>
      <circle cx="-7" cy="${y - 5}" r="1" fill="#FFFFFF"/>
      <circle cx="8" cy="${y - 4}" r="2.8" fill="${INK}"/>
      <circle cx="9" cy="${y - 5}" r="1" fill="#FFFFFF"/>
      <path d="M-5 ${y + 7} Q0 ${y + 12} 5 ${y + 7}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    `;
  }

  function renderAnimalCharacter(item, def) {
    const coat = item.skinColor || def.skinColor;
    const collar = item.outfitColor || def.outfitColor;
    const acc = Object.assign({}, def.defaultAccessories, item.accessories || {});
    const expr = item.expression || "happy";
    const pose = item.pose || "standing";
    const isSeated = pose === "sitting";
    const isActivePaw = pose === "holding" || pose === "typing" || pose === "pointing";
    const pawRight = isActivePaw
      ? `<path d="M18 14 L38 -2" fill="none" stroke="${coat}" stroke-width="11" stroke-linecap="round"/>
         <path d="M18 14 L38 -2" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity="0.25"/>
         <circle cx="40" cy="-4" r="6" fill="${coat}" stroke="${INK}" stroke-width="2"/>`
      : `<rect x="8" y="20" width="12" height="34" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>`;

    const headAcc = renderAccessoriesFaceAndHead(
      acc,
      item.assetId === "turtle" ? -18 : -32,
      acc.glasses
    );
    const collarSvg = acc.necklace
      ? `<rect x="-14" y="-6" width="28" height="7" rx="3" fill="${collar}" stroke="${INK}" stroke-width="1.8"/>
         <circle cx="0" cy="4" r="4" fill="#FACC15" stroke="${INK}" stroke-width="1.5"/>`
      : "";

    if (item.assetId === "cat") {
      return `
        <!-- Rabo curvo -->
        <path d="M-20 34 Q-44 26 -38 2 Q-34 -10 -26 -4" fill="none" stroke="${coat}" stroke-width="9" stroke-linecap="round"/>
        <path d="M-20 34 Q-44 26 -38 2" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        <!-- Corpo -->
        <ellipse cx="0" cy="${isSeated ? 26 : 22}" rx="22" ry="${isSeated ? 28 : 24}" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="0" cy="26" rx="12" ry="16" fill="#FFFBEB"/>
        <!-- Patas -->
        <rect x="-18" y="24" width="11" height="32" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
        ${pawRight}
        ${acc.watch ? `<rect x="${isActivePaw ? 28 : 8}" y="${isActivePaw ? 2 : 40}" width="11" height="5" rx="2" fill="#FACC15" stroke="${INK}" stroke-width="1.4"/>` : ""}
        ${collarSvg}
        <!-- Cabeça e Orelhas pontudas -->
        <polygon points="-24,-42 -18,-66 -4,-50" fill="${coat}" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>
        <polygon points="24,-42 18,-66 4,-50" fill="${coat}" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>
        <circle cx="0" cy="-30" r="24" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="0" cy="-22" rx="10" ry="7" fill="#FFFBEB"/>
        <polygon points="-3,-26 3,-26 0,-22" fill="#F472B6"/>
        <line x1="-26" y1="-24" x2="-12" y2="-23" stroke="${INK}" stroke-width="1.4"/>
        <line x1="12" y1="-23" x2="26" y2="-24" stroke="${INK}" stroke-width="1.4"/>
        ${renderAnimalFace(expr, -31)}
        ${headAcc}
      `;
    }

    if (item.assetId === "dog") {
      return `
        <!-- Rabo abanando -->
        <path d="M-22 28 Q-40 14 -34 2" fill="none" stroke="${coat}" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="0" cy="${isSeated ? 26 : 22}" rx="24" ry="${isSeated ? 28 : 24}" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <rect x="-18" y="24" width="12" height="32" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
        ${pawRight}
        ${acc.watch ? `<rect x="${isActivePaw ? 28 : 8}" y="${isActivePaw ? 2 : 40}" width="11" height="5" rx="2" fill="#FACC15" stroke="${INK}" stroke-width="1.4"/>` : ""}
        ${collarSvg}
        <!-- Orelhas caídas -->
        <ellipse cx="-24" cy="-24" rx="8" ry="18" transform="rotate(14 -24 -24)" fill="#78350F" stroke="${INK}" stroke-width="2.2"/>
        <ellipse cx="24" cy="-24" rx="8" ry="18" transform="rotate(-14 24 -24)" fill="#78350F" stroke="${INK}" stroke-width="2.2"/>
        <circle cx="0" cy="-30" r="24" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="0" cy="-20" rx="13" ry="10" fill="#FEF3C7"/>
        <ellipse cx="0" cy="-24" rx="5.5" ry="4" fill="${INK}"/>
        ${renderAnimalFace(expr, -31)}
        ${headAcc}
      `;
    }

    if (item.assetId === "rabbit") {
      return `
        <circle cx="-22" cy="36" r="8" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
        <ellipse cx="0" cy="${isSeated ? 26 : 22}" rx="21" ry="${isSeated ? 28 : 24}" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="0" cy="26" rx="11" ry="15" fill="#FCE7F3"/>
        <rect x="-16" y="24" width="11" height="32" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
        ${pawRight}
        ${collarSvg}
        <!-- Orelhas longas -->
        <ellipse cx="-10" cy="-64" rx="7.5" ry="22" transform="rotate(-8 -10 -64)" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="10" cy="-64" rx="7.5" ry="22" transform="rotate(8 10 -64)" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <ellipse cx="-10" cy="-64" rx="3.5" ry="14" transform="rotate(-8 -10 -64)" fill="#F9A8D4"/>
        <ellipse cx="10" cy="-64" rx="3.5" ry="14" transform="rotate(8 10 -64)" fill="#F9A8D4"/>
        <circle cx="0" cy="-30" r="22" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
        <circle cx="0" cy="-24" r="3" fill="#F472B6"/>
        ${renderAnimalFace(expr, -32)}
        ${headAcc}
      `;
    }

    // Tartaruga
    return `
      <!-- Casco -->
      <path d="M-36 32 A36 34 0 0 1 36 32 Z" fill="${collar}" stroke="${INK}" stroke-width="2.5"/>
      <path d="M-24 28 L-12 10 L12 10 L24 28" fill="none" stroke="#FDE047" stroke-width="2" opacity="0.65"/>
      <rect x="-32" y="30" width="64" height="8" rx="4" fill="#FACC15" stroke="${INK}" stroke-width="2.2"/>
      <!-- Perninhas -->
      <rect x="-28" y="38" width="14" height="18" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
      <rect x="14" y="38" width="14" height="18" rx="5" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
      ${isActivePaw ? `<path d="M20 26 L44 10" fill="none" stroke="${coat}" stroke-width="10" stroke-linecap="round"/><circle cx="46" cy="8" r="5.5" fill="${coat}" stroke="${INK}" stroke-width="2"/>` : ""}
      <!-- Pescoço e cabeça -->
      <rect x="-8" y="-2" width="16" height="22" rx="6" fill="${coat}" stroke="${INK}" stroke-width="2.2"/>
      <circle cx="0" cy="-16" r="20" fill="${coat}" stroke="${INK}" stroke-width="2.3"/>
      ${renderAnimalFace(expr, -18)}
      ${headAcc}
    `;
  }

  function renderCharacterMarkup(item) {
    const def = CHARACTER_DEFAULTS[item.assetId] || CHARACTER_DEFAULTS.girl;
    if (item.assetId === "robot") return renderRobotCharacter(item, def);
    if (def.isAnimal || item.isAnimal) return renderAnimalCharacter(item, def);
    return renderHumanCharacter(item, def);
  }

  // ---------------------------------------------------------------------------
  // 22 OBJETOS DO COTIDIANO, LETRAMENTO E CIDADANIA DIGITAL
  // ---------------------------------------------------------------------------
  const OBJECTS = [
    { id: "laptop", name: "Notebook" },
    { id: "phone", name: "Celular" },
    { id: "tablet", name: "Tablet" },
    { id: "videogame", name: "Videogame" },
    { id: "remote", name: "Controle remoto" },
    { id: "bag", name: "Bolsa / Mochila" },
    { id: "notebook", name: "Caderno" },
    { id: "book", name: "Livro" },
    { id: "magnifier", name: "Lupa" },
    { id: "fakenews", name: "Placa Fake News" },
    { id: "verified", name: "Selo Verificado" },
    { id: "danger", name: "Placa de Alerta" },
    { id: "copyright", name: "Direitos Autorais" },
    { id: "megaphone", name: "Megafone" },
    { id: "gear", name: "Engrenagem" },
    { id: "key", name: "Chave" },
    { id: "newspaper", name: "Jornal / Notícia" },
    { id: "headphones", name: "Fones de ouvido" },
    { id: "camera", name: "Câmera" },
    { id: "trash", name: "Lixeira" },
    { id: "lock", name: "Cadeado" },
    { id: "lightbulb", name: "Lâmpada de ideia" },
  ];

  const EMOJIS = [
    { id: "🤔", name: "Pensando" },
    { id: "😱", name: "Chocado" },
    { id: "💡", name: "Ideia" },
    { id: "✅", name: "Verificado" },
    { id: "❌", name: "Falso" },
    { id: "🔍", name: "Investigar" },
    { id: "🤖", name: "Algoritmo" },
    { id: "⚠️", name: "Alerta" },
    { id: "👏", name: "Aplausos" },
    { id: "❤️", name: "Curti" },
    { id: "🎉", name: "Comemoração" },
    { id: "💬", name: "Debate" },
  ];

  const DRAW_COLORS = [
    { id: "#111827", name: "Preto" },
    { id: "#FFFFFF", name: "Branco" },
    { id: "#DC2626", name: "Vermelho" },
    { id: "#EA580C", name: "Laranja" },
    { id: "#FACC15", name: "Amarelo" },
    { id: "#16A34A", name: "Verde" },
    { id: "#2563EB", name: "Azul" },
    { id: "#7C3AED", name: "Roxo" },
    { id: "#78350F", name: "Marrom" },
  ];

  const SHAPES = [
    { id: "circle", name: "Círculo" },
    { id: "rect", name: "Quadrado" },
    { id: "triangle", name: "Triângulo" },
    { id: "arrow", name: "Seta" },
    { id: "star", name: "Estrela" },
  ];

  function renderObjectMarkup(objId) {
    switch (objId) {
      case "laptop":
        return `
          <rect x="-30" y="-26" width="60" height="38" rx="4" fill="#1E293B" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-24" y="-20" width="48" height="26" rx="2" fill="#BAE6FD"/>
          <line x1="-16" y1="-12" x2="14" y2="-12" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="-16" y1="-4" x2="8" y2="-4" stroke="#0284C7" stroke-width="2" stroke-linecap="round"/>
          <polygon points="-36,14 36,14 42,24 -42,24" fill="#CBD5E1" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <rect x="-10" y="18" width="20" height="3" rx="1" fill="#64748B"/>
        `;

      case "phone":
        return `
          <rect x="-16" y="-30" width="32" height="60" rx="6" fill="#0F172A" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-12" y="-22" width="24" height="42" rx="2" fill="#EFF6FF"/>
          <rect x="-9" y="-16" width="18" height="10" rx="2" fill="#FECACA" stroke="#C84B31" stroke-width="1.2"/>
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#64748B" stroke-width="2"/>
          <line x1="-8" y1="7" x2="5" y2="7" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="0" cy="25" r="2.2" fill="#94A3B8"/>
        `;

      case "tablet":
        return `
          <rect x="-26" y="-22" width="52" height="44" rx="5" fill="#1E293B" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-20" y="-17" width="40" height="34" rx="2" fill="#E0F2FE"/>
          <rect x="-15" y="-12" width="14" height="12" rx="2" fill="#C84B31"/>
          <rect x="2" y="-12" width="13" height="12" rx="2" fill="#38BDF8"/>
          <line x1="-15" y1="6" x2="15" y2="6" stroke="#475569" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="-15" y1="12" x2="8" y2="12" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
        `;

      case "videogame":
        return `
          <path d="M-26 -14 H26 Q38 -14 40 4 L42 18 Q42 26 32 24 L20 12 H-20 L-32 24 Q-42 26 -42 18 L-40 4 Q-38 -14 -26 -14 Z" fill="#102542" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- D-Pad -->
          <rect x="-27" y="-5" width="14" height="5" rx="1" fill="#E2E8F0"/>
          <rect x="-22.5" y="-9.5" width="5" height="14" rx="1" fill="#E2E8F0"/>
          <!-- Botões coloridos -->
          <circle cx="22" cy="-7" r="3.5" fill="#FACC15"/>
          <circle cx="29" cy="0" r="3.5" fill="#C84B31"/>
          <circle cx="22" cy="7" r="3.5" fill="#22C55E"/>
          <circle cx="15" cy="0" r="3.5" fill="#38BDF8"/>
        `;

      case "remote":
        return `
          <rect x="-12" y="-32" width="24" height="64" rx="6" fill="#1E293B" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="-5" cy="-23" r="3.2" fill="#EF4444"/>
          <circle cx="5" cy="-23" r="2.6" fill="#94A3B8"/>
          <circle cx="0" cy="-7" r="7" fill="#475569" stroke="#CBD5E1" stroke-width="1.4"/>
          <circle cx="0" cy="-7" r="2.6" fill="#E2E8F0"/>
          <rect x="-7" y="6" width="5" height="4" rx="1" fill="#CBD5E1"/>
          <rect x="2" y="6" width="5" height="4" rx="1" fill="#CBD5E1"/>
          <rect x="-7" y="13" width="5" height="4" rx="1" fill="#CBD5E1"/>
          <rect x="2" y="13" width="5" height="4" rx="1" fill="#CBD5E1"/>
          <rect x="-7" y="20" width="14" height="4" rx="1" fill="#C84B31"/>
        `;

      case "bag":
        return `
          <path d="M-12 -16 A12 12 0 0 1 12 -16" fill="none" stroke="#5A3621" stroke-width="4" stroke-linecap="round"/>
          <rect x="-24" y="-16" width="48" height="42" rx="7" fill="#C84B31" stroke="${INK}" stroke-width="2.5"/>
          <path d="M-24 -6 L0 8 L24 -6 L24 -12 Q24 -16 18 -16 H-18 Q-24 -16 -24 -12 Z" fill="#9A3412" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
          <rect x="-5" y="4" width="10" height="8" rx="2" fill="#FACC15" stroke="${INK}" stroke-width="1.8"/>
        `;

      case "notebook":
        return `
          <rect x="-22" y="-26" width="44" height="54" rx="4" fill="#2563EB" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-14" y="-14" width="28" height="12" rx="2" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/>
          <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#102542" stroke-width="2"/>
          <!-- Espiral -->
          <g stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round">
            <line x1="-26" y1="-16" x2="-19" y2="-16"/>
            <line x1="-26" y1="-6" x2="-19" y2="-6"/>
            <line x1="-26" y1="4" x2="-19" y2="4"/>
            <line x1="-26" y1="14" x2="-19" y2="14"/>
            <line x1="-26" y1="22" x2="-19" y2="22"/>
          </g>
          <!-- Lápis lateral -->
          <rect x="24" y="-18" width="6" height="38" rx="1" fill="#FACC15" stroke="${INK}" stroke-width="1.8"/>
          <polygon points="24,20 30,20 27,28" fill="#FDE68A" stroke="${INK}" stroke-width="1.5"/>
        `;

      case "magnifier":
        return `
          <g transform="rotate(-35)">
            <rect x="-5" y="14" width="10" height="28" rx="4" fill="#C84B31" stroke="${INK}" stroke-width="2.5"/>
            <circle cx="0" cy="-6" r="22" fill="#E0F2FE" stroke="${INK}" stroke-width="4"/>
            <circle cx="0" cy="-6" r="16" fill="#BAE6FD" opacity="0.6"/>
            <path d="M-9 -14 Q-4 -20 4 -17" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
          </g>
        `;

      case "fakenews":
        return `
          <g transform="rotate(-4)">
            <rect x="-44" y="-20" width="88" height="40" rx="6" fill="#FEF2F2" stroke="#C84B31" stroke-width="3.5"/>
            <rect x="-39" y="-15" width="78" height="30" rx="3" fill="none" stroke="#C84B31" stroke-width="1.2" stroke-dasharray="4 3"/>
            <text x="0" y="5" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#B91C1C" letter-spacing="0.5">FAKE NEWS</text>
          </g>
        `;

      case "lock":
        return `
          <path d="M-15 -6 L-15 -18 A15 15 0 0 1 15 -18 L15 -6" fill="none" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
          <path d="M-15 -6 L-15 -18 A15 15 0 0 1 15 -18 L15 -6" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
          <rect x="-24" y="-6" width="48" height="36" rx="6" fill="#FACC15" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="10" r="4.5" fill="${INK}"/>
          <rect x="-2" y="12" width="4" height="9" rx="1.5" fill="${INK}"/>
        `;

      case "book":
        return `
          <path d="M-34 -16 Q-17 -24 0 -14 L0 24 Q-17 16 -34 24 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M34 -16 Q17 -24 0 -14 L0 24 Q17 16 34 24 Z" fill="#F8FAFC" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M-34 -16 L-34 24 L-38 26 L-38 -14 Z" fill="#102542"/>
          <path d="M34 -16 L34 24 L38 26 L38 -14 Z" fill="#102542"/>
          <line x1="-26" y1="-6" x2="-8" y2="-4" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
          <line x1="-26" y1="3" x2="-8" y2="5" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="-4" x2="26" y2="-6" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="5" x2="26" y2="3" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
        `;

      case "verified":
        return `
          <circle cx="0" cy="0" r="28" fill="#16A34A" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="22" fill="none" stroke="#BBF7D0" stroke-width="1.5" stroke-dasharray="4 3"/>
          <path d="M-11 1 L-3 9 L13 -9" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        `;

      case "danger":
        return `
          <polygon points="0,-29 30,24 -30,24" fill="#FACC15" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
          <polygon points="0,-21 22,19 -22,19" fill="none" stroke="#B91C1C" stroke-width="1.6" stroke-linejoin="round"/>
          <rect x="-2.8" y="-11" width="5.6" height="17" rx="2.5" fill="#B91C1C"/>
          <circle cx="0" cy="13" r="3.2" fill="#B91C1C"/>
        `;

      case "copyright":
        return `
          <circle cx="0" cy="0" r="27" fill="#102542" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="20" fill="none" stroke="#FFFFFF" stroke-width="2.8"/>
          <path d="M8 -8 A11 11 0 1 0 8 8" fill="none" stroke="#FACC15" stroke-width="4.2" stroke-linecap="round"/>
        `;

      case "megaphone":
        return `
          <path d="M-24 -8 L16 -22 L16 14 L-24 2 Z" fill="#C84B31" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <ellipse cx="16" cy="-4" rx="5" ry="18" fill="#FEE2E2" stroke="${INK}" stroke-width="2.2"/>
          <rect x="-32" y="-9" width="10" height="12" rx="2" fill="#102542" stroke="${INK}" stroke-width="2.2"/>
          <path d="M-22 3 L-18 22 L-10 22 L-14 4 Z" fill="#1E293B" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
          <line x1="26" y1="-10" x2="34" y2="-14" stroke="#F59E0B" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="28" y1="-4" x2="37" y2="-4" stroke="#F59E0B" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="26" y1="2" x2="34" y2="6" stroke="#F59E0B" stroke-width="2.8" stroke-linecap="round"/>
        `;

      case "gear":
        return `
          <g fill="#64748B" stroke="${INK}" stroke-width="2.2">
            <rect x="-5" y="-32" width="10" height="64" rx="2"/>
            <rect x="-32" y="-5" width="64" height="10" rx="2"/>
            <rect x="-5" y="-32" width="10" height="64" rx="2" transform="rotate(45)"/>
            <rect x="-5" y="-32" width="10" height="64" rx="2" transform="rotate(-45)"/>
          </g>
          <circle cx="0" cy="0" r="20" fill="#94A3B8" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="0" r="8" fill="#102542" stroke="${INK}" stroke-width="2.2"/>
        `;

      case "key":
        return `
          <circle cx="-16" cy="0" r="13" fill="#FACC15" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="-16" cy="0" r="5" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>
          <rect x="-3" y="-4" width="34" height="8" rx="2" fill="#FACC15" stroke="${INK}" stroke-width="2.3"/>
          <rect x="16" y="4" width="5" height="9" fill="#FACC15" stroke="${INK}" stroke-width="2"/>
          <rect x="24" y="4" width="5" height="12" fill="#FACC15" stroke="${INK}" stroke-width="2"/>
        `;

      case "newspaper":
        return `
          <rect x="-30" y="-24" width="60" height="48" rx="4" fill="#F8FAFC" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-24" y="-18" width="48" height="11" rx="2" fill="#102542"/>
          <text x="0" y="-9.5" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#FFFFFF">NOTÍCIA</text>
          <rect x="-24" y="-2" width="22" height="18" rx="2" fill="#CBD5E1" stroke="#64748B" stroke-width="1.2"/>
          <line x1="2" y1="0" x2="23" y2="0" stroke="#475569" stroke-width="2.2"/>
          <line x1="2" y1="6" x2="23" y2="6" stroke="#94A3B8" stroke-width="2"/>
          <line x1="2" y1="12" x2="18" y2="12" stroke="#94A3B8" stroke-width="2"/>
        `;

      case "headphones":
        return `
          <path d="M-24 6 V-4 A24 24 0 0 1 24 -4 V6" fill="none" stroke="#102542" stroke-width="6.5" stroke-linecap="round"/>
          <rect x="-31" y="2" width="12" height="22" rx="5" fill="#C84B31" stroke="${INK}" stroke-width="2.4"/>
          <rect x="19" y="2" width="12" height="22" rx="5" fill="#C84B31" stroke="${INK}" stroke-width="2.4"/>
          <rect x="-22" y="4" width="5" height="18" rx="2" fill="#1E293B"/>
          <rect x="17" y="4" width="5" height="18" rx="2" fill="#1E293B"/>
        `;

      case "camera":
        return `
          <rect x="-12" y="-24" width="24" height="10" rx="3" fill="#475569" stroke="${INK}" stroke-width="2.2"/>
          <rect x="-30" y="-16" width="60" height="40" rx="6" fill="#1E293B" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="4" r="14" fill="#94A3B8" stroke="${INK}" stroke-width="2.4"/>
          <circle cx="0" cy="4" r="9" fill="#0284C7" stroke="${INK}" stroke-width="2"/>
          <circle cx="-3" cy="1" r="2.5" fill="#BAE6FD"/>
          <rect x="16" y="-11" width="8" height="5" rx="1.5" fill="#FDE047"/>
        `;

      case "trash":
        return `
          <rect x="-22" y="-22" width="44" height="7" rx="2" fill="#475569" stroke="${INK}" stroke-width="2.3"/>
          <rect x="-8" y="-28" width="16" height="6" rx="2" fill="#64748B" stroke="${INK}" stroke-width="2"/>
          <path d="M-19 -15 H19 L15 26 H-15 Z" fill="#CBD5E1" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <line x1="-7" y1="-8" x2="-6" y2="18" stroke="#475569" stroke-width="2.3" stroke-linecap="round"/>
          <line x1="0" y1="-8" x2="0" y2="18" stroke="#475569" stroke-width="2.3" stroke-linecap="round"/>
          <line x1="7" y1="-8" x2="6" y2="18" stroke="#475569" stroke-width="2.3" stroke-linecap="round"/>
        `;

      case "lightbulb":
      default:
        return `
          <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round">
            <line x1="0" y1="-34" x2="0" y2="-42"/>
            <line x1="-24" y1="-22" x2="-31" y2="-28"/>
            <line x1="24" y1="-22" x2="31" y2="-28"/>
            <line x1="-29" y1="-2" x2="-37" y2="-2"/>
            <line x1="29" y1="-2" x2="37" y2="-2"/>
          </g>
          <path d="M-18 -6 A18 18 0 1 1 18 -6 C18 4 10 8 10 16 L-10 16 C-10 8 -18 4 -18 -6 Z" fill="#FEF08A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M-5 2 L0 -6 L5 2" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
          <rect x="-9" y="16" width="18" height="10" rx="3" fill="#94A3B8" stroke="${INK}" stroke-width="2.2"/>
          <line x1="-8" y1="21" x2="8" y2="21" stroke="${INK}" stroke-width="1.6"/>
        `;
    }
  }

  // ---------------------------------------------------------------------------
  // BALÕES DE FALA, PENSAMENTO, GRITO E NARRADOR
  // ---------------------------------------------------------------------------
  const BUBBLE_TYPES = [
    { id: "speech", name: "Fala normal" },
    { id: "thought", name: "Pensamento" },
    { id: "shout", name: "Grito / Alerta" },
    { id: "narrator", name: "Narrador" },
  ];

  function renderBubbleMarkup(bubble) {
    const type = bubble.type || "speech";
    const fontSize = Number(bubble.fontSize) || 14;
    const lineHeight = Math.round(fontSize * 1.28);
    const tailDir = bubble.tailDir === "right" ? "right" : "left";

    const maxInnerW = type === "narrator" ? 316 : 182;
    const { lines, widthUsed } = wrapLines(bubble.text, maxInnerW, fontSize);
    const padX = type === "shout" ? 22 : 16;
    const padY = type === "narrator" ? 9 : type === "shout" ? 16 : 12;

    const minW = type === "narrator" ? 180 : 112;
    const boxW = Math.max(minW, Math.round(widthUsed + padX * 2));
    const boxH = Math.max(34, lines.length * lineHeight + padY * 2);

    const hw = boxW / 2;
    const hh = boxH / 2;

    let shapeSvg = "";
    if (type === "narrator") {
      shapeSvg = `<rect x="${-hw}" y="${-hh}" width="${boxW}" height="${boxH}" rx="4" fill="#FEF3C7" stroke="${INK}" stroke-width="2.5"/>`;
    } else if (type === "thought") {
      const dots =
        tailDir === "right"
          ? `<circle cx="${hw * 0.45}" cy="${hh + 11}" r="5.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
             <circle cx="${hw * 0.65}" cy="${hh + 22}" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`
          : `<circle cx="${-hw * 0.45}" cy="${hh + 11}" r="5.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
             <circle cx="${-hw * 0.65}" cy="${hh + 22}" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
      const cloudPath = `
        M ${-hw + 14} ${-hh}
        Q ${-hw * 0.45} ${-hh - 14} 0 ${-hh - 7}
        Q ${hw * 0.45} ${-hh - 14} ${hw - 14} ${-hh}
        Q ${hw + 14} ${-hh * 0.35} ${hw + 4} 0
        Q ${hw + 14} ${hh * 0.45} ${hw - 12} ${hh}
        Q ${hw * 0.4} ${hh + 11} 0 ${hh + 6}
        Q ${-hw * 0.4} ${hh + 11} ${-hw + 12} ${hh}
        Q ${-hw - 14} ${hh * 0.45} ${-hw - 4} 0
        Q ${-hw - 14} ${-hh * 0.35} ${-hw + 14} ${-hh} Z
      `;
      shapeSvg = `${dots}<path d="${cloudPath}" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    } else if (type === "shout") {
      const pts = [];
      const steps = 14;
      const outerX = hw + 14;
      const outerY = hh + 13;
      const innerX = hw - 3;
      const innerY = hh - 2;
      for (let i = 0; i < steps * 2; i++) {
        const ang = (i * Math.PI) / steps;
        const isPeak = i % 2 === 0;
        pts.push(`${(Math.cos(ang) * (isPeak ? outerX : innerX)).toFixed(1)},${(Math.sin(ang) * (isPeak ? outerY : innerY)).toFixed(1)}`);
      }
      const tailPoly =
        tailDir === "right"
          ? `<polygon points="${hw * 0.22},${hh - 4} ${hw * 0.62},${hh + 26} ${hw * 0.45},${hh - 4}" fill="#FEF08A" stroke="${BURNT}" stroke-width="2.8" stroke-linejoin="round"/>`
          : `<polygon points="${-hw * 0.22},${hh - 4} ${-hw * 0.62},${hh + 26} ${-hw * 0.45},${hh - 4}" fill="#FEF08A" stroke="${BURNT}" stroke-width="2.8" stroke-linejoin="round"/>`;
      const tailFillMask =
        tailDir === "right"
          ? `<polygon points="${hw * 0.23},${hh - 6} ${hw * 0.59},${hh + 22} ${hw * 0.44},${hh - 6}" fill="#FEF08A"/>`
          : `<polygon points="${-hw * 0.23},${hh - 6} ${-hw * 0.59},${hh + 22} ${-hw * 0.44},${hh - 6}" fill="#FEF08A"/>`;
      shapeSvg = `${tailPoly}<polygon points="${pts.join(" ")}" fill="#FEF08A" stroke="${BURNT}" stroke-width="3" stroke-linejoin="round"/>${tailFillMask}`;
    } else {
      const r = 14;
      const tipX = tailDir === "right" ? hw * 0.52 : -hw * 0.52;
      const tailRootA = tailDir === "right" ? hw * 0.14 : -hw * 0.36;
      const tailRootB = tailDir === "right" ? hw * 0.36 : -hw * 0.14;
      const d = `
        M ${-hw + r} ${-hh}
        H ${hw - r}
        Q ${hw} ${-hh} ${hw} ${-hh + r}
        V ${hh - r}
        Q ${hw} ${hh} ${hw - r} ${hh}
        H ${tailRootB}
        L ${tipX} ${hh + 20}
        L ${tailRootA} ${hh}
        H ${-hw + r}
        Q ${-hw} ${hh} ${-hw} ${hh - r}
        V ${-hh + r}
        Q ${-hw} ${-hh} ${-hw + r} ${-hh} Z
      `;
      shapeSvg = `<path d="${d}" fill="#FFFFFF" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    }

    const totalTextH = lines.length * lineHeight;
    const startY = -totalTextH / 2 + fontSize * 0.88;
    const tspans = lines
      .map(
        (line, idx) =>
          `<tspan x="0" y="${(startY + idx * lineHeight).toFixed(1)}">${escapeXml(
            line || " "
          )}</tspan>`
      )
      .join("");

    const textColor = type === "shout" ? "#7C2D12" : INK;
    const fontWeight = type === "shout" ? "700" : "600";
    const textSvg = `<text text-anchor="middle" font-family='"Segoe UI", system-ui, -apple-system, Arial, sans-serif' font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}">${tspans}</text>`;

    return { markup: shapeSvg + textSvg, boxW, boxH };
  }

  // ---------------------------------------------------------------------------
  // CÁLCULO DE INTERAÇÃO PERSONAGEM <-> OBJETO
  // ---------------------------------------------------------------------------
  function computeInteractionPlacement(charItem, objAssetId) {
    const dir = charItem.flip ? -1 : 1;
    const sc = Number(charItem.scale) || 0.85;
    const isAnim = Boolean(charItem.isAnimal || (CHARACTER_DEFAULTS[charItem.assetId] && CHARACTER_DEFAULTS[charItem.assetId].isAnimal));

    if (charItem.pose === "sitting") {
      return {
        pose: "sitting",
        objX: Math.min(368, Math.max(32, charItem.x + dir * (isAnim ? 34 : 30) * sc)),
        objY: Math.min(314, Math.max(40, charItem.y + (isAnim ? 8 : 34) * sc)),
        objFlip: Boolean(charItem.flip),
      };
    }

    if (objAssetId === "laptop" || objAssetId === "tablet") {
      return {
        pose: "typing",
        objX: Math.min(368, Math.max(32, charItem.x + dir * (isAnim ? 46 : 64) * sc)),
        objY: Math.min(308, Math.max(40, charItem.y + (isAnim ? -4 : 18) * sc)),
        objFlip: Boolean(charItem.flip),
      };
    }
    if (objAssetId === "bag") {
      return {
        pose: "walking",
        objX: Math.min(368, Math.max(32, charItem.x - dir * 32 * sc)),
        objY: Math.min(308, Math.max(40, charItem.y + (isAnim ? 10 : 28) * sc)),
        objFlip: Boolean(charItem.flip),
      };
    }
    return {
      pose: "holding",
      objX: Math.min(368, Math.max(32, charItem.x + dir * (isAnim ? 42 : 56) * sc)),
      objY: Math.min(308, Math.max(40, charItem.y + (isAnim ? -10 : -4) * sc)),
      objFlip: Boolean(charItem.flip),
    };
  }

  function renderEmojiMarkup(emojiChar) {
    return `<text x="0" y="15" text-anchor="middle" font-family='"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' font-size="44">${escapeXml(
      emojiChar || "🤔"
    )}</text>`;
  }

  function renderShapeMarkup(shapeId, color) {
    const fill = color || "#C84B31";
    const strokeCol = fill.toUpperCase() === "#111827" ? "#374151" : INK;
    switch (shapeId) {
      case "circle":
        return `<circle cx="0" cy="0" r="28" fill="${fill}" stroke="${strokeCol}" stroke-width="2.6"/>`;
      case "rect":
        return `<rect x="-28" y="-24" width="56" height="48" rx="4" fill="${fill}" stroke="${strokeCol}" stroke-width="2.6"/>`;
      case "triangle":
        return `<polygon points="0,-29 30,24 -30,24" fill="${fill}" stroke="${strokeCol}" stroke-width="2.6" stroke-linejoin="round"/>`;
      case "arrow":
        return `<polygon points="-32,-10 6,-10 6,-24 34,0 6,24 6,10 -32,10" fill="${fill}" stroke="${strokeCol}" stroke-width="2.5" stroke-linejoin="round"/>`;
      case "star":
      default: {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 31 : 13.5;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${strokeCol}" stroke-width="2.5" stroke-linejoin="round"/>`;
      }
    }
  }

  function renderItemMarkup(item) {
    if (item.kind === "character") return renderCharacterMarkup(item);
    if (item.kind === "object") return renderObjectMarkup(item.assetId);
    if (item.kind === "emoji") return renderEmojiMarkup(item.emoji || item.assetId);
    if (item.kind === "shape") return renderShapeMarkup(item.assetId, item.color);
    if (item.kind === "bubble") return renderBubbleMarkup(item).markup;
    return "";
  }

  function renderItemGroupSvg(item) {
    const scale = Number(item.scale) || 1;
    const flip = item.flip ? -1 : 1;
    const sx = (scale * flip).toFixed(3);
    const sy = scale.toFixed(3);
    const inner = renderItemMarkup(item);
    return `<g data-item-id="${escapeXml(item.id)}" transform="translate(${Math.round(
      item.x
    )} ${Math.round(item.y)}) scale(${sx} ${sy})" class="comic-item">${inner}</g>`;
  }

  function renderPanelUnderLayerSvg(panel) {
    const bg = global.HQScenes ? global.HQScenes.renderSceneMarkup(panel.sceneId || "classroom") : "";
    const underItems = (panel.items || []).filter((it) => it.kind !== "bubble").map(renderItemGroupSvg).join("");
    return bg + underItems;
  }

  function renderPanelOverLayerSvg(panel) {
    return (panel.items || []).filter((it) => it.kind === "bubble").map(renderItemGroupSvg).join("");
  }

  function renderPanelInnerSvg(panel, includeDrawingImg) {
    const under = renderPanelUnderLayerSvg(panel);
    const drawImg =
      includeDrawingImg && panel.drawingDataUrl
        ? `<image href="${escapeXml(panel.drawingDataUrl)}" x="0" y="0" width="400" height="340" pointer-events="none"/>`
        : "";
    const over = renderPanelOverLayerSvg(panel);
    return under + drawImg + over;
  }

  function buildThumbnailSvg(kind, assetId, extraColor) {
    if (kind === "scene" && global.HQScenes) {
      return `<svg viewBox="0 0 400 340" xmlns="${SVG_NS}" aria-hidden="true">${global.HQScenes.renderSceneMarkup(
        assetId
      )}</svg>`;
    }
    if (kind === "character") {
      const def = CHARACTER_DEFAULTS[assetId] || CHARACTER_DEFAULTS.girl;
      const sample = {
        kind: "character",
        assetId,
        isAnimal: def.isAnimal,
        expression: "happy",
        pose: "standing",
        framing: "full",
        skinColor: def.skinColor,
        hairColor: def.hairColor,
        hairStyle: def.hairStyle,
        outfitColor: def.outfitColor,
        accessories: def.defaultAccessories,
      };
      const vb = def.isAnimal ? "-52 -88 104 152" : "-60 -116 120 256";
      return `<svg viewBox="${vb}" xmlns="${SVG_NS}" aria-hidden="true">${renderCharacterMarkup(
        sample
      )}</svg>`;
    }
    if (kind === "object") {
      return `<svg viewBox="-50 -48 100 96" xmlns="${SVG_NS}" aria-hidden="true">${renderObjectMarkup(
        assetId
      )}</svg>`;
    }
    if (kind === "shape") {
      return `<svg viewBox="-40 -40 80 80" xmlns="${SVG_NS}" aria-hidden="true">${renderShapeMarkup(
        assetId,
        extraColor
      )}</svg>`;
    }
    if (kind === "bubble") {
      const sample = {
        type: assetId,
        text: assetId === "narrator" ? "Narrador" : assetId === "shout" ? "Alerta!" : "Texto...",
        fontSize: 13,
        tailDir: "left",
      };
      return `<svg viewBox="-100 -52 200 108" xmlns="${SVG_NS}" aria-hidden="true">${
        renderBubbleMarkup(sample).markup
      }</svg>`;
    }
    return "";
  }

  global.HQArt = {
    SCENES,
    CHARACTERS,
    CHARACTER_DEFAULTS,
    EXPRESSIONS,
    POSES,
    HAIR_STYLES,
    SKIN_TONES,
    ANIMAL_COAT_COLORS,
    HAIR_COLORS,
    OUTFIT_COLORS,
    ACCESSORY_LIST,
    OBJECTS,
    EMOJIS,
    DRAW_COLORS,
    SHAPES,
    BUBBLE_TYPES,
    escapeXml,
    wrapLines,
    renderCharacterMarkup,
    renderPanelUnderLayerSvg,
    renderPanelOverLayerSvg,
    renderPanelInnerSvg,
    buildThumbnailSvg,
    renderBubbleMarkup,
    computeInteractionPlacement,
  };
})(window);
