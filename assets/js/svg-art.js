(function (global) {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const INK = "#111827";
  const NAVY = "#102542";
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
  // 1. CENARIOS (400 x 340)
  // ---------------------------------------------------------------------------
  const SCENES = [
    { id: "classroom", name: "Sala de aula", desc: "Computadores e lousa" },
    { id: "library", name: "Biblioteca", desc: "Estantes e mesa de estudo" },
    { id: "bedroom", name: "Quarto / Casa", desc: "Mesa com computador" },
    { id: "digital", name: "Espaço digital", desc: "Rede e conexões" },
    { id: "square", name: "Praça / Rua", desc: "Ar livre e cidade" },
    { id: "minimal", name: "Fundo branco", desc: "Minimalista limpo" },
  ];

  function renderSceneMarkup(sceneId) {
    switch (sceneId) {
      case "classroom":
        return `
          <rect width="400" height="340" fill="#EEF2F6"/>
          <rect x="0" y="252" width="400" height="88" fill="#D5DEE8"/>
          <line x1="0" y1="252" x2="400" y2="252" stroke="#94A3B8" stroke-width="2"/>
          <!-- Janela esquerda -->
          <rect x="20" y="34" width="84" height="106" rx="4" fill="#DBEAFE" stroke="#64748B" stroke-width="2.5"/>
          <line x1="62" y1="34" x2="62" y2="140" stroke="#64748B" stroke-width="2"/>
          <line x1="20" y1="86" x2="104" y2="86" stroke="#64748B" stroke-width="2"/>
          <!-- Quadro verde -->
          <rect x="122" y="28" width="256" height="122" rx="4" fill="#1E4D3B" stroke="#8B5E3C" stroke-width="5"/>
          <line x1="146" y1="62" x2="250" y2="62" stroke="#D1FAE5" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
          <line x1="146" y1="84" x2="310" y2="84" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <line x1="146" y1="104" x2="220" y2="104" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <rect x="296" y="138" width="44" height="7" rx="2" fill="#F8FAFC"/>
          <!-- Bancada com computadores -->
          <rect x="24" y="220" width="352" height="16" rx="3" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
          <rect x="44" y="236" width="12" height="76" fill="#94A3B8"/>
          <rect x="344" y="236" width="12" height="76" fill="#94A3B8"/>
          <!-- Monitor 1 -->
          <rect x="52" y="170" width="66" height="44" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
          <rect x="57" y="175" width="56" height="33" rx="2" fill="#93C5FD"/>
          <rect x="78" y="214" width="14" height="6" fill="#475569"/>
          <!-- Monitor 2 -->
          <rect x="167" y="170" width="66" height="44" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
          <rect x="172" y="175" width="56" height="33" rx="2" fill="#BAE6FD"/>
          <rect x="193" y="214" width="14" height="6" fill="#475569"/>
          <!-- Monitor 3 -->
          <rect x="282" y="170" width="66" height="44" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
          <rect x="287" y="175" width="56" height="33" rx="2" fill="#93C5FD"/>
          <rect x="308" y="214" width="14" height="6" fill="#475569"/>
        `;

      case "library":
        return `
          <rect width="400" height="340" fill="#F6EFE6"/>
          <rect x="0" y="260" width="400" height="80" fill="#DFC9AE"/>
          <line x1="0" y1="260" x2="400" y2="260" stroke="#9C7A54" stroke-width="2"/>
          <!-- Estante esquerda -->
          <rect x="18" y="24" width="146" height="224" rx="3" fill="#8C5A3C" stroke="#5A3621" stroke-width="2.5"/>
          <rect x="26" y="34" width="130" height="58" fill="#5A3621"/>
          <rect x="26" y="104" width="130" height="58" fill="#5A3621"/>
          <rect x="26" y="174" width="130" height="58" fill="#5A3621"/>
          <!-- Livros prateleira 1 -->
          <rect x="32" y="44" width="14" height="48" fill="#C84B31"/>
          <rect x="48" y="40" width="16" height="52" fill="#102542"/>
          <rect x="66" y="48" width="12" height="44" fill="#D97706"/>
          <rect x="82" y="42" width="15" height="50" fill="#2A6F97"/>
          <rect x="102" y="46" width="14" height="46" fill="#15803D"/>
          <!-- Livros prateleira 2 -->
          <rect x="34" y="114" width="16" height="48" fill="#2A6F97"/>
          <rect x="52" y="110" width="14" height="52" fill="#C84B31"/>
          <rect x="70" y="118" width="18" height="44" fill="#EAB308"/>
          <rect x="92" y="112" width="14" height="50" fill="#102542"/>
          <rect x="114" y="116" width="14" height="46" fill="#0F766E"/>
          <!-- Mural / Cartaz direita -->
          <rect x="184" y="34" width="196" height="114" rx="4" fill="#E9D8BE" stroke="#9C7A54" stroke-width="3"/>
          <rect x="200" y="48" width="76" height="84" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <line x1="210" y1="66" x2="264" y2="66" stroke="#102542" stroke-width="3"/>
          <line x1="210" y1="80" x2="258" y2="80" stroke="#94A3B8" stroke-width="2"/>
          <line x1="210" y1="92" x2="250" y2="92" stroke="#94A3B8" stroke-width="2"/>
          <rect x="292" y="54" width="70" height="58" rx="2" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
          <!-- Mesa de estudo -->
          <rect x="176" y="226" width="204" height="16" rx="3" fill="#A47148" stroke="#5A3621" stroke-width="2"/>
          <rect x="192" y="242" width="12" height="58" fill="#7F5539"/>
          <rect x="352" y="242" width="12" height="58" fill="#7F5539"/>
          <!-- Luminária -->
          <path d="M322 226 L322 194 L302 184" fill="none" stroke="#102542" stroke-width="3" stroke-linecap="round"/>
          <path d="M290 184 L318 184 L310 168 L296 168 Z" fill="#C84B31" stroke="#102542" stroke-width="2"/>
        `;

      case "bedroom":
        return `
          <rect width="400" height="340" fill="#F1F5F9"/>
          <rect x="0" y="248" width="400" height="92" fill="#E2D5C3"/>
          <line x1="0" y1="248" x2="400" y2="248" stroke="#B6A38A" stroke-width="2"/>
          <!-- Janela com cortina -->
          <rect x="32" y="34" width="104" height="114" rx="4" fill="#BAE6FD" stroke="#64748B" stroke-width="2.5"/>
          <circle cx="106" cy="64" r="14" fill="#FDE047"/>
          <path d="M40 120 Q60 105 80 120 Q98 108 118 122 L118 148 L40 148 Z" fill="#FFFFFF" opacity="0.85"/>
          <line x1="84" y1="34" x2="84" y2="148" stroke="#64748B" stroke-width="2"/>
          <rect x="24" y="26" width="120" height="8" rx="3" fill="#475569"/>
          <!-- Prateleira com quadro -->
          <rect x="210" y="42" width="144" height="68" rx="4" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
          <circle cx="250" cy="76" r="18" fill="#FED7AA"/>
          <path d="M234 86 L252 64 L268 86 Z" fill="#C84B31"/>
          <rect x="282" y="64" width="54" height="8" rx="2" fill="#CBD5E1"/>
          <rect x="282" y="80" width="40" height="8" rx="2" fill="#CBD5E1"/>
          <rect x="200" y="132" width="166" height="10" rx="2" fill="#9A6B4C"/>
          <rect x="220" y="114" width="22" height="18" rx="2" fill="#102542"/>
          <rect x="246" y="110" width="16" height="22" rx="2" fill="#C84B31"/>
          <!-- Escrivaninha com desktop -->
          <rect x="148" y="214" width="228" height="14" rx="3" fill="#B08968" stroke="#6C4F3D" stroke-width="2"/>
          <rect x="164" y="228" width="12" height="72" fill="#7F5539"/>
          <rect x="348" y="228" width="12" height="72" fill="#7F5539"/>
          <rect x="226" y="156" width="84" height="52" rx="4" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <rect x="232" y="162" width="72" height="39" rx="2" fill="#38BDF8" opacity="0.85"/>
          <rect x="260" y="208" width="16" height="6" fill="#475569"/>
        `;

      case "digital":
        return `
          <rect width="400" height="340" fill="#102542"/>
          <!-- Grade geométrica discreta -->
          <g stroke="#1E3A5F" stroke-width="1">
            <line x1="0" y1="68" x2="400" y2="68"/>
            <line x1="0" y1="136" x2="400" y2="136"/>
            <line x1="0" y1="204" x2="400" y2="204"/>
            <line x1="0" y1="272" x2="400" y2="272"/>
            <line x1="80" y1="0" x2="80" y2="340"/>
            <line x1="160" y1="0" x2="160" y2="340"/>
            <line x1="240" y1="0" x2="240" y2="340"/>
            <line x1="320" y1="0" x2="320" y2="340"/>
          </g>
          <!-- Conexões de rede -->
          <g stroke="#3B82F6" stroke-width="2" opacity="0.55">
            <line x1="56" y1="70" x2="144" y2="122"/>
            <line x1="144" y1="122" x2="262" y2="62"/>
            <line x1="262" y1="62" x2="344" y2="146"/>
            <line x1="144" y1="122" x2="96" y2="220"/>
            <line x1="144" y1="122" x2="242" y2="210"/>
            <line x1="242" y1="210" x2="344" y2="146"/>
            <line x1="242" y1="210" x2="328" y2="282"/>
            <line x1="96" y1="220" x2="46" y2="296"/>
          </g>
          <!-- Nós -->
          <g>
            <circle cx="56" cy="70" r="8" fill="#1D4ED8" stroke="#93C5FD" stroke-width="2"/>
            <circle cx="144" cy="122" r="11" fill="#C84B31" stroke="#FED7AA" stroke-width="2"/>
            <circle cx="262" cy="62" r="9" fill="#0EA5E9" stroke="#BAE6FD" stroke-width="2"/>
            <circle cx="344" cy="146" r="10" fill="#1D4ED8" stroke="#93C5FD" stroke-width="2"/>
            <circle cx="96" cy="220" r="8" fill="#0EA5E9" stroke="#BAE6FD" stroke-width="2"/>
            <circle cx="242" cy="210" r="10" fill="#0EA5E9" stroke="#BAE6FD" stroke-width="2"/>
            <circle cx="328" cy="282" r="7" fill="#C84B31" stroke="#FED7AA" stroke-width="2"/>
            <circle cx="46" cy="296" r="7" fill="#1D4ED8" stroke="#93C5FD" stroke-width="2"/>
          </g>
        `;

      case "square":
        return `
          <rect width="400" height="340" fill="#BAE6FD"/>
          <!-- Nuvens estilizadas HQ -->
          <path d="M36 74 Q48 54 70 62 Q88 46 108 62 Q122 58 128 74 Z" fill="#FFFFFF"/>
          <path d="M254 58 Q266 40 286 48 Q304 34 322 50 Q336 48 342 62 L250 62 Z" fill="#FFFFFF"/>
          <!-- Edifícios ao fundo -->
          <rect x="20" y="136" width="58" height="114" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
          <rect x="86" y="114" width="66" height="136" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
          <rect x="262" y="128" width="60" height="122" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
          <rect x="330" y="144" width="54" height="106" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
          <!-- Árvore -->
          <rect x="192" y="180" width="16" height="72" fill="#7C4A2D"/>
          <circle cx="200" cy="146" r="40" fill="#4D7C0F" stroke="#365314" stroke-width="2"/>
          <circle cx="176" cy="160" r="26" fill="#65A30D"/>
          <circle cx="224" cy="158" r="28" fill="#65A30D"/>
          <!-- Grama e calçada -->
          <rect x="0" y="246" width="400" height="24" fill="#84CC16"/>
          <rect x="0" y="270" width="400" height="70" fill="#D1D5DB"/>
          <line x1="0" y1="270" x2="400" y2="270" stroke="#6B7280" stroke-width="2"/>
          <!-- Banco de praça -->
          <rect x="134" y="232" width="132" height="10" rx="2" fill="#9A6B4C" stroke="#5A3621" stroke-width="2"/>
          <rect x="148" y="242" width="8" height="26" fill="#374151"/>
          <rect x="244" y="242" width="8" height="26" fill="#374151"/>
        `;

      case "minimal":
      default:
        return `
          <rect width="400" height="340" fill="#FFFFFF"/>
          <line x1="0" y1="290" x2="400" y2="290" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="6 6"/>
        `;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. PERSONAGENS + EXPRESSOES FACIAIS
  // Anchor: (0, 0) ~ hip/mid-torso; top of head ~ -110, bottom ~ +85
  // ---------------------------------------------------------------------------
  const CHARACTERS = [
    { id: "girl", name: "Estudante menina" },
    { id: "boy", name: "Estudante menino" },
    { id: "teacher", name: "Professor(a)" },
    { id: "elder", name: "Pessoa idosa" },
    { id: "robot", name: "Robô / Algoritmo" },
    { id: "detective", name: "Detetive Fake News" },
  ];

  const EXPRESSIONS = [
    { id: "happy", name: "Feliz" },
    { id: "surprised", name: "Surpreso" },
    { id: "thoughtful", name: "Pensativo" },
    { id: "alert", name: "Desconfiado" },
  ];

  function renderHumanFace(expressionId, faceCenterY, isAdult = false) {
    const y = faceCenterY;
    let brows = "";
    let eyes = "";
    let mouth = "";

    switch (expressionId) {
      case "surprised":
        brows = `
          <path d="M-19 ${y - 17} Q-12 ${y - 23} -5 ${y - 17}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M5 ${y - 17} Q12 ${y - 23} 19 ${y - 17}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-11" cy="${y - 7}" r="4.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
          <circle cx="-10" cy="${y - 7}" r="2" fill="${INK}"/>
          <circle cx="11" cy="${y - 7}" r="4.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>
          <circle cx="12" cy="${y - 7}" r="2" fill="${INK}"/>
        `;
        mouth = `<ellipse cx="0" cy="${y + 13}" rx="5" ry="6.5" fill="${INK}"/>`;
        break;

      case "thoughtful":
        brows = `
          <line x1="-18" y1="${y - 15}" x2="-6" y2="${y - 16}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M5 ${y - 17} Q12 ${y - 22} 19 ${y - 16}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-11" cy="${y - 7}" r="3.4" fill="${INK}"/>
          <circle cx="-9.8" cy="${y - 8.2}" r="1.1" fill="#FFFFFF"/>
          <circle cx="12" cy="${y - 8}" r="3.4" fill="${INK}"/>
          <circle cx="13.2" cy="${y - 9.2}" r="1.1" fill="#FFFFFF"/>
        `;
        mouth = `<path d="M-7 ${y + 12} Q2 ${y + 10} 9 ${y + 13}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
        break;

      case "alert":
        brows = `
          <line x1="-19" y1="${y - 18}" x2="-5" y2="${y - 12}" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="19" y1="${y - 18}" x2="5" y2="${y - 12}" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
        `;
        eyes = `
          <path d="M-16 ${y - 7} Q-11 ${y - 11} -6 ${y - 7}" fill="none" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="-10.5" cy="${y - 6}" r="2.6" fill="${INK}"/>
          <path d="M6 ${y - 7} Q11 ${y - 11} 16 ${y - 7}" fill="none" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="11.5" cy="${y - 6}" r="2.6" fill="${INK}"/>
        `;
        mouth = `<path d="M-8 ${y + 14} Q0 ${y + 9} 9 ${y + 14}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
        break;

      case "happy":
      default:
        brows = `
          <path d="M-17 ${y - 15} Q-11 ${y - 19} -5 ${y - 15}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M5 ${y - 15} Q11 ${y - 19} 17 ${y - 15}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
        `;
        eyes = `
          <circle cx="-11" cy="${y - 7}" r="3.4" fill="${INK}"/>
          <circle cx="-9.8" cy="${y - 8.2}" r="1.2" fill="#FFFFFF"/>
          <circle cx="11" cy="${y - 7}" r="3.4" fill="${INK}"/>
          <circle cx="12.2" cy="${y - 8.2}" r="1.2" fill="#FFFFFF"/>
        `;
        mouth = isAdult
          ? `<path d="M-9 ${y + 10} Q0 ${y + 18} 9 ${y + 10}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
          : `<path d="M-10 ${y + 9} Q0 ${y + 20} 10 ${y + 9} Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
        break;
    }

    const nose = `<path d="M0 ${y - 2} Q3 ${y + 3} -1 ${y + 5}" fill="none" stroke="#9A5B3C" stroke-width="1.8" stroke-linecap="round"/>`;
    return brows + eyes + nose + mouth;
  }

  function renderRobotFace(expressionId) {
    switch (expressionId) {
      case "surprised":
        return `
          <circle cx="-12" cy="-58" r="6" fill="#38BDF8" stroke="#BAE6FD" stroke-width="1.5"/>
          <circle cx="12" cy="-58" r="6" fill="#38BDF8" stroke="#BAE6FD" stroke-width="1.5"/>
          <circle cx="0" cy="-42" r="4.5" fill="none" stroke="#38BDF8" stroke-width="2"/>
        `;
      case "thoughtful":
        return `
          <rect x="-18" y="-60" width="12" height="4" rx="2" fill="#FACC15"/>
          <circle cx="12" cy="-59" r="5" fill="#FACC15"/>
          <line x1="-8" y1="-43" x2="10" y2="-45" stroke="#FACC15" stroke-width="2.5" stroke-linecap="round"/>
        `;
      case "alert":
        return `
          <path d="M-19 -62 L-7 -56 L-19 -54 Z" fill="#F87171"/>
          <path d="M19 -62 L7 -56 L19 -54 Z" fill="#F87171"/>
          <path d="M-12 -42 L-6 -46 L0 -42 L6 -46 L12 -42" fill="none" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/>
        `;
      case "happy":
      default:
        return `
          <path d="M-18 -56 Q-12 -64 -6 -56" fill="none" stroke="#34D399" stroke-width="3" stroke-linecap="round"/>
          <path d="M6 -56 Q12 -64 18 -56" fill="none" stroke="#34D399" stroke-width="3" stroke-linecap="round"/>
          <path d="M-11 -45 Q0 -36 11 -45" fill="none" stroke="#34D399" stroke-width="2.8" stroke-linecap="round"/>
        `;
    }
  }

  function renderCharacterMarkup(charId, expressionId) {
    switch (charId) {
      case "girl":
        return `
          <!-- Coques laterais e cabelo crespo -->
          <circle cx="-32" cy="-84" r="14" fill="#2D1E17" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="32" cy="-84" r="14" fill="#2D1E17" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="-64" r="34" fill="#2D1E17" stroke="${INK}" stroke-width="2.5"/>
          <!-- Elásticos -->
          <path d="M-24 -76 L-18 -72" stroke="#C84B31" stroke-width="4" stroke-linecap="round"/>
          <path d="M24 -76 L18 -72" stroke="#C84B31" stroke-width="4" stroke-linecap="round"/>
          <!-- Pescoço e tronco -->
          <rect x="-8" y="-28" width="16" height="18" fill="#B5744B"/>
          <!-- Braços -->
          <path d="M-26 -8 Q-44 20 -36 52" fill="none" stroke="#B5744B" stroke-width="11" stroke-linecap="round"/>
          <path d="M26 -8 Q44 20 36 52" fill="none" stroke="#B5744B" stroke-width="11" stroke-linecap="round"/>
          <!-- Camiseta -->
          <path d="M-28 -14 L28 -14 L34 52 L-34 52 Z" fill="#C84B31" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Detalhe gola + bolso -->
          <path d="M-12 -14 Q0 -4 12 -14" fill="#B5744B" stroke="${INK}" stroke-width="2"/>
          <rect x="6" y="4" width="14" height="14" rx="2" fill="#FDE68A" stroke="${INK}" stroke-width="1.8"/>
          <!-- Calça / Saia -->
          <path d="M-32 52 L32 52 L36 86 L-36 86 Z" fill="#1E3A5F" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabeça -->
          <circle cx="0" cy="-58" r="29" fill="#B5744B" stroke="${INK}" stroke-width="2.5"/>
          <!-- Franja -->
          <path d="M-28 -68 Q-12 -88 0 -76 Q14 -88 28 -68 Q12 -82 0 -70 Q-14 -82 -28 -68 Z" fill="#2D1E17"/>
          ${renderHumanFace(expressionId, -56, false)}
        `;

      case "boy":
        return `
          <!-- Pescoço e corpo -->
          <rect x="-8" y="-28" width="16" height="18" fill="#F0B892"/>
          <!-- Braços -->
          <path d="M-28 -10 Q-44 18 -34 50" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
          <path d="M28 -10 Q44 18 34 50" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>
          <circle cx="-34" cy="52" r="6" fill="#F0B892" stroke="${INK}" stroke-width="2"/>
          <circle cx="34" cy="52" r="6" fill="#F0B892" stroke="${INK}" stroke-width="2"/>
          <!-- Moletom -->
          <path d="M-30 -14 L30 -14 L32 52 L-32 52 Z" fill="#2563EB" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <rect x="-14" y="4" width="28" height="22" rx="4" fill="#60A5FA" stroke="${INK}" stroke-width="1.8"/>
          <!-- Calça -->
          <rect x="-30" y="52" width="26" height="34" fill="#1F2937" stroke="${INK}" stroke-width="2.5"/>
          <rect x="4" y="52" width="26" height="34" fill="#1F2937" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabeça -->
          <circle cx="0" cy="-58" r="29" fill="#F0B892" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabelo curto estilizado -->
          <path d="M-30 -60 Q-32 -94 2 -92 Q32 -92 30 -60 Q22 -76 6 -74 Q-4 -82 -16 -72 Q-26 -72 -30 -60 Z" fill="#1E293B" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
          ${renderHumanFace(expressionId, -56, false)}
        `;

      case "teacher":
        return `
          <!-- Cabelo preso -->
          <circle cx="0" cy="-86" r="14" fill="#4B2C20" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="-60" r="32" fill="#4B2C20" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-8" y="-28" width="16" height="18" fill="#E6AE86"/>
          <!-- Braços com blazer -->
          <path d="M-28 -12 Q-46 18 -36 52" fill="none" stroke="#102542" stroke-width="12" stroke-linecap="round"/>
          <path d="M28 -12 Q46 18 36 52" fill="none" stroke="#102542" stroke-width="12" stroke-linecap="round"/>
          <circle cx="-36" cy="54" r="6" fill="#E6AE86" stroke="${INK}" stroke-width="2"/>
          <circle cx="36" cy="54" r="6" fill="#E6AE86" stroke="${INK}" stroke-width="2"/>
          <!-- Camisa e Blazer -->
          <path d="M-31 -14 L31 -14 L34 54 L-34 54 Z" fill="#102542" stroke="${INK}" stroke-width="2.5"/>
          <polygon points="-11,-14 11,-14 0,24" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>
          <line x1="-11" y1="-14" x2="-18" y2="16" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="11" y1="-14" x2="18" y2="16" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Pasta na mão esquerda -->
          <rect x="20" y="16" width="22" height="28" rx="2" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <!-- Calça -->
          <rect x="-32" y="54" width="64" height="32" fill="#334155" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabeça -->
          <circle cx="0" cy="-58" r="29" fill="#E6AE86" stroke="${INK}" stroke-width="2.5"/>
          <path d="M-29 -62 Q-12 -88 18 -80 Q28 -74 29 -62 Q10 -76 -12 -70 Z" fill="#4B2C20"/>
          ${renderHumanFace(expressionId, -56, true)}
          <!-- Óculos -->
          <rect x="-21" y="-70" width="17" height="13" rx="3" fill="none" stroke="${INK}" stroke-width="2.2"/>
          <rect x="4" y="-70" width="17" height="13" rx="3" fill="none" stroke="${INK}" stroke-width="2.2"/>
          <line x1="-4" y1="-64" x2="4" y2="-64" stroke="${INK}" stroke-width="2.2"/>
        `;

      case "elder":
        return `
          <!-- Coque grisalho -->
          <circle cx="0" cy="-92" r="12" fill="#CBD5E1" stroke="${INK}" stroke-width="2.5"/>
          <circle cx="0" cy="-62" r="32" fill="#CBD5E1" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-8" y="-28" width="16" height="18" fill="#EBBFA4"/>
          <!-- Braços suéter -->
          <path d="M-28 -12 Q-46 18 -34 52" fill="none" stroke="#0F766E" stroke-width="12" stroke-linecap="round"/>
          <path d="M28 -12 Q46 18 34 52" fill="none" stroke="#0F766E" stroke-width="12" stroke-linecap="round"/>
          <circle cx="-34" cy="54" r="6" fill="#EBBFA4" stroke="${INK}" stroke-width="2"/>
          <circle cx="34" cy="54" r="6" fill="#EBBFA4" stroke="${INK}" stroke-width="2"/>
          <!-- Cardigã -->
          <path d="M-31 -14 L31 -14 L34 54 L-34 54 Z" fill="#0F766E" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-10" y="-14" width="20" height="68" fill="#FEF3C7" stroke="${INK}" stroke-width="1.8"/>
          <circle cx="0" cy="4" r="2.2" fill="${INK}"/>
          <circle cx="0" cy="20" r="2.2" fill="${INK}"/>
          <circle cx="0" cy="36" r="2.2" fill="${INK}"/>
          <!-- Calça -->
          <rect x="-32" y="54" width="64" height="32" fill="#475569" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabeça -->
          <circle cx="0" cy="-58" r="29" fill="#EBBFA4" stroke="${INK}" stroke-width="2.5"/>
          <path d="M-29 -62 Q-14 -88 0 -78 Q14 -88 29 -62 Q12 -74 0 -70 Q-14 -74 -29 -62 Z" fill="#E2E8F0"/>
          ${renderHumanFace(expressionId, -56, true)}
          <!-- Óculos redondos -->
          <circle cx="-11" cy="-63" r="8.5" fill="none" stroke="#475569" stroke-width="2"/>
          <circle cx="11" cy="-63" r="8.5" fill="none" stroke="#475569" stroke-width="2"/>
          <line x1="-2.5" y1="-63" x2="2.5" y2="-63" stroke="#475569" stroke-width="2"/>
        `;

      case "robot":
        return `
          <!-- Antena -->
          <line x1="0" y1="-88" x2="0" y2="-106" stroke="${INK}" stroke-width="3"/>
          <circle cx="0" cy="-108" r="5" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <!-- Pescoço metálico -->
          <rect x="-9" y="-30" width="18" height="16" fill="#64748B" stroke="${INK}" stroke-width="2"/>
          <!-- Braços articulados -->
          <path d="M-30 -6 L-48 20 L-38 46" fill="none" stroke="#64748B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M30 -6 L48 20 L38 46" fill="none" stroke="#64748B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="-38" cy="50" r="6" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <circle cx="38" cy="50" r="6" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <!-- Tronco metálico -->
          <rect x="-32" y="-14" width="64" height="68" rx="10" fill="#94A3B8" stroke="${INK}" stroke-width="2.5"/>
          <rect x="-20" y="0" width="40" height="30" rx="5" fill="#102542" stroke="${INK}" stroke-width="2"/>
          <circle cx="-8" cy="15" r="4" fill="#38BDF8"/>
          <rect x="2" y="12" width="12" height="6" rx="2" fill="#FACC15"/>
          <!-- Base/pernas -->
          <rect x="-26" y="54" width="20" height="32" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.5"/>
          <rect x="6" y="54" width="20" height="32" rx="4" fill="#64748B" stroke="${INK}" stroke-width="2.5"/>
          <!-- Cabeça retangular -->
          <rect x="-32" y="-88" width="64" height="58" rx="12" fill="#CBD5E1" stroke="${INK}" stroke-width="2.5"/>
          <!-- Orelhas eletrônicas -->
          <rect x="-38" y="-68" width="6" height="18" rx="2" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <rect x="32" y="-68" width="6" height="18" rx="2" fill="#C84B31" stroke="${INK}" stroke-width="2"/>
          <!-- Visor digital -->
          <rect x="-24" y="-74" width="48" height="36" rx="6" fill="#0F172A" stroke="${INK}" stroke-width="2"/>
          ${renderRobotFace(expressionId)}
        `;

      case "detective":
      default:
        return `
          <rect x="-8" y="-28" width="16" height="18" fill="#E8B490"/>
          <!-- Sobretudo e braços -->
          <path d="M-28 -12 Q-46 18 -34 52" fill="none" stroke="#9A7B4F" stroke-width="12" stroke-linecap="round"/>
          <path d="M28 -12 Q46 18 34 52" fill="none" stroke="#9A7B4F" stroke-width="12" stroke-linecap="round"/>
          <circle cx="-34" cy="54" r="6" fill="#E8B490" stroke="${INK}" stroke-width="2"/>
          <circle cx="34" cy="54" r="6" fill="#E8B490" stroke="${INK}" stroke-width="2"/>
          <path d="M-32 -14 L32 -14 L40 86 L-40 86 Z" fill="#B6935E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Gola alta + gravata -->
          <polygon points="-14,-14 0,14 14,-14" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>
          <polygon points="-3,-6 3,-6 5,22 0,28 -5,22" fill="#C84B31" stroke="${INK}" stroke-width="1.5"/>
          <polygon points="-18,-14 -8,8 -28,2" fill="#8C6D3F" stroke="${INK}" stroke-width="2"/>
          <polygon points="18,-14 8,8 28,2" fill="#8C6D3F" stroke="${INK}" stroke-width="2"/>
          <!-- Cinto -->
          <rect x="-35" y="42" width="70" height="8" fill="#5C4033" stroke="${INK}" stroke-width="1.8"/>
          <rect x="-6" y="40" width="12" height="12" rx="1" fill="#FACC15" stroke="${INK}" stroke-width="1.8"/>
          <!-- Cabeça -->
          <circle cx="0" cy="-58" r="29" fill="#E8B490" stroke="${INK}" stroke-width="2.5"/>
          ${renderHumanFace(expressionId, -54, true)}
          <!-- Chapéu de detetive -->
          <path d="M-26 -78 L-18 -104 Q0 -110 18 -104 L26 -78 Z" fill="#785A3C" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
          <rect x="-25" y="-84" width="50" height="7" fill="#3B2818"/>
          <ellipse cx="0" cy="-77" rx="42" ry="7" fill="#8B6B4A" stroke="${INK}" stroke-width="2.5"/>
        `;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. OBJETOS E ÍCONES HQ
  // Centered around (0, 0) ~ 64x64 footprint
  // ---------------------------------------------------------------------------
  const OBJECTS = [
    { id: "laptop", name: "Notebook" },
    { id: "phone", name: "Celular" },
    { id: "magnifier", name: "Lupa" },
    { id: "fakenews", name: "Placa Fake News" },
    { id: "lock", name: "Cadeado" },
    { id: "book", name: "Livro" },
    { id: "lightbulb", name: "Lâmpada de ideia" },
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
  // 4. BALÕES DE FALA, PENSAMENTO, GRITO E NARRADOR
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

    const maxInnerW = type === "narrator" ? 310 : 178;
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
      // Nuvem proporcional por elipses sobrepostas + contorno unificado
      const rx = hw * 0.44;
      const ry = hh * 0.42;
      const dots =
        tailDir === "right"
          ? `<circle cx="${hw * 0.45}" cy="${hh + 11}" r="5.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
             <circle cx="${hw * 0.65}" cy="${hh + 22}" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`
          : `<circle cx="${-hw * 0.45}" cy="${hh + 11}" r="5.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>
             <circle cx="${-hw * 0.65}" cy="${hh + 22}" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>`;
      // Contorno único de nuvem limpa
      const rCorner = 14;
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
      void rx; void ry; void rCorner;
    } else if (type === "shout") {
      // Polígono pontiagudo estilo explosão HQ
      const pts = [];
      const steps = 14;
      const outerX = hw + 14;
      const outerY = hh + 13;
      const innerX = hw - 3;
      const innerY = hh - 2;
      for (let i = 0; i < steps * 2; i++) {
        const ang = (i * Math.PI) / steps;
        const isPeak = i % 2 === 0;
        const px = Math.cos(ang) * (isPeak ? outerX : innerX);
        const py = Math.sin(ang) * (isPeak ? outerY : innerY);
        pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      }
      const tailPoly =
        tailDir === "right"
          ? `<polygon points="${hw * 0.22},${hh - 4} ${hw * 0.62},${hh + 26} ${hw * 0.45},${hh - 4}" fill="#FEF08A" stroke="${BURNT}" stroke-width="2.8" stroke-linejoin="round"/>`
          : `<polygon points="${-hw * 0.22},${hh - 4} ${-hw * 0.62},${hh + 26} ${-hw * 0.45},${hh - 4}" fill="#FEF08A" stroke="${BURNT}" stroke-width="2.8" stroke-linejoin="round"/>`;
      const tailFillMask =
        tailDir === "right"
          ? `<polygon points="${hw * 0.23},${hh - 6} ${hw * 0.59},${hh + 22} ${hw * 0.44},${hh - 6}" fill="#FEF08A"/>`
          : `<polygon points="${-hw * 0.23},${hh - 6} ${-hw * 0.59},${hh + 22} ${-hw * 0.44},${hh - 6}" fill="#FEF08A"/>`;
      shapeSvg = `
        ${tailPoly}
        <polygon points="${pts.join(" ")}" fill="#FEF08A" stroke="${BURNT}" stroke-width="3" stroke-linejoin="round"/>
        ${tailFillMask}
      `;
    } else {
      // Balão de fala normal com cauda esquerda ou direita e junção limpa
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

    return {
      markup: shapeSvg + textSvg,
      boxW,
      boxH,
    };
  }

  function renderItemMarkup(item) {
    if (item.kind === "character") {
      return renderCharacterMarkup(item.assetId, item.expression || "happy");
    }
    if (item.kind === "object") {
      return renderObjectMarkup(item.assetId);
    }
    if (item.kind === "bubble") {
      return renderBubbleMarkup(item).markup;
    }
    return "";
  }

  function renderPanelInnerSvg(panel) {
    const bg = renderSceneMarkup(panel.sceneId || "classroom");
    const itemsSvg = (panel.items || [])
      .map((item) => {
        const scale = Number(item.scale) || 1;
        const flip = item.flip ? -1 : 1;
        const sx = (scale * flip).toFixed(3);
        const sy = scale.toFixed(3);
        const inner = renderItemMarkup(item);
        return `<g data-item-id="${escapeXml(item.id)}" transform="translate(${Math.round(
          item.x
        )} ${Math.round(item.y)}) scale(${sx} ${sy})" class="comic-item">${inner}</g>`;
      })
      .join("");
    return bg + itemsSvg;
  }

  function buildThumbnailSvg(kind, assetId) {
    if (kind === "scene") {
      return `<svg viewBox="0 0 400 340" xmlns="${SVG_NS}" aria-hidden="true">${renderSceneMarkup(
        assetId
      )}</svg>`;
    }
    if (kind === "character") {
      return `<svg viewBox="-65 -118 130 212" xmlns="${SVG_NS}" aria-hidden="true">${renderCharacterMarkup(
        assetId,
        "happy"
      )}</svg>`;
    }
    if (kind === "object") {
      return `<svg viewBox="-50 -48 100 96" xmlns="${SVG_NS}" aria-hidden="true">${renderObjectMarkup(
        assetId
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
    EXPRESSIONS,
    OBJECTS,
    BUBBLE_TYPES,
    escapeXml,
    wrapLines,
    renderSceneMarkup,
    renderPanelInnerSvg,
    buildThumbnailSvg,
    renderBubbleMarkup,
  };
})(window);
