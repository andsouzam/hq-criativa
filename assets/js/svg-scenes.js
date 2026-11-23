(function (global) {
  const SCENES = [
    // Casa
    { id: "bedroom", group: "Casa", name: "Quarto", desc: "Cama, janela e computador" },
    { id: "livingroom", group: "Casa", name: "Sala de estar", desc: "Sofá, TV e estante" },
    { id: "kitchen", group: "Casa", name: "Cozinha", desc: "Mesa, bancada e armários" },
    // Escola
    { id: "classroom", group: "Escola", name: "Sala de aula tradicional", desc: "Lousa verde e carteiras" },
    { id: "computerlab", group: "Escola", name: "Lab. de informática", desc: "Bancadas com computadores" },
    { id: "library", group: "Escola", name: "Biblioteca escolar", desc: "Estantes e mesa de estudo" },
    { id: "schoolyard", group: "Escola", name: "Pátio da escola", desc: "Convivência e bancos" },
    // Ar Livre
    { id: "square", group: "Ar livre", name: "Praça", desc: "Banco, fonte e árvores" },
    { id: "street", group: "Ar livre", name: "Rua da cidade", desc: "Calçada, faixa e prédios" },
    { id: "park", group: "Ar livre", name: "Parque arborizado", desc: "Gramado amplo e trilha" },
    { id: "garden", group: "Ar livre", name: "Jardim", desc: "Flores, cerca e canteiros" },
    // Digital / Estúdio
    { id: "digital", group: "Estúdio", name: "Espaço digital", desc: "Rede abstrata conectada" },
    { id: "minimal", group: "Estúdio", name: "Fundo branco", desc: "Minimalista limpo" },
  ];

  function renderSceneMarkup(sceneId) {
    switch (sceneId) {
      case "classroom":
        return `
          <rect width="400" height="340" fill="#F1F4F8"/>
          <rect x="0" y="256" width="400" height="84" fill="#DDD6CA"/>
          <line x1="0" y1="256" x2="400" y2="256" stroke="#9CA3AF" stroke-width="2"/>
          <rect x="18" y="34" width="78" height="106" rx="4" fill="#DBEAFE" stroke="#64748B" stroke-width="2.5"/>
          <line x1="57" y1="34" x2="57" y2="140" stroke="#64748B" stroke-width="2"/>
          <line x1="18" y1="86" x2="96" y2="86" stroke="#64748B" stroke-width="2"/>
          <rect x="114" y="26" width="268" height="122" rx="4" fill="#1E4D3B" stroke="#8B5E3C" stroke-width="5"/>
          <line x1="138" y1="60" x2="252" y2="60" stroke="#D1FAE5" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
          <line x1="138" y1="82" x2="322" y2="82" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <line x1="138" y1="104" x2="236" y2="104" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <rect x="308" y="136" width="44" height="7" rx="2" fill="#F8FAFC"/>
          <!-- Mesa do professor e carteiras -->
          <rect x="268" y="204" width="108" height="12" rx="2" fill="#B08968" stroke="#5A3621" stroke-width="2"/>
          <rect x="278" y="216" width="8" height="44" fill="#7F5539"/>
          <rect x="358" y="216" width="8" height="44" fill="#7F5539"/>
          <rect x="36" y="220" width="82" height="10" rx="2" fill="#C49A6C" stroke="#5A3621" stroke-width="2"/>
          <rect x="44" y="230" width="6" height="36" fill="#475569"/>
          <rect x="104" y="230" width="6" height="36" fill="#475569"/>
          <rect x="148" y="220" width="82" height="10" rx="2" fill="#C49A6C" stroke="#5A3621" stroke-width="2"/>
          <rect x="156" y="230" width="6" height="36" fill="#475569"/>
          <rect x="216" y="230" width="6" height="36" fill="#475569"/>
        `;

      case "computerlab":
        return `
          <rect width="400" height="340" fill="#E8EEF5"/>
          <rect x="0" y="256" width="400" height="84" fill="#CBD5E1"/>
          <line x1="0" y1="256" x2="400" y2="256" stroke="#64748B" stroke-width="2"/>
          <rect x="24" y="30" width="110" height="80" rx="4" fill="#FFFFFF" stroke="#64748B" stroke-width="2.5"/>
          <rect x="36" y="42" width="86" height="10" rx="2" fill="#102542"/>
          <rect x="36" y="60" width="64" height="6" rx="2" fill="#94A3B8"/>
          <rect x="36" y="74" width="76" height="6" rx="2" fill="#C84B31"/>
          <rect x="152" y="30" width="224" height="96" rx="4" fill="#102542" stroke="#475569" stroke-width="3"/>
          <circle cx="194" cy="76" r="16" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
          <line x1="210" y1="76" x2="256" y2="76" stroke="#38BDF8" stroke-width="2"/>
          <circle cx="272" cy="76" r="14" fill="none" stroke="#C84B31" stroke-width="2.5"/>
          <line x1="286" y1="76" x2="328" y2="76" stroke="#93C5FD" stroke-width="2"/>
          <circle cx="342" cy="76" r="12" fill="none" stroke="#38BDF8" stroke-width="2.5"/>
          <!-- Bancada longa com 3 PCs -->
          <rect x="18" y="216" width="364" height="16" rx="3" fill="#94A3B8" stroke="#334155" stroke-width="2"/>
          <rect x="38" y="232" width="12" height="72" fill="#475569"/>
          <rect x="350" y="232" width="12" height="72" fill="#475569"/>
          <rect x="44" y="164" width="72" height="46" rx="4" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <rect x="50" y="170" width="60" height="34" rx="2" fill="#7DD3FC"/>
          <rect x="74" y="210" width="12" height="6" fill="#475569"/>
          <rect x="164" y="164" width="72" height="46" rx="4" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <rect x="170" y="170" width="60" height="34" rx="2" fill="#BAE6FD"/>
          <rect x="194" y="210" width="12" height="6" fill="#475569"/>
          <rect x="284" y="164" width="72" height="46" rx="4" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <rect x="290" y="170" width="60" height="34" rx="2" fill="#7DD3FC"/>
          <rect x="314" y="210" width="12" height="6" fill="#475569"/>
        `;

      case "library":
        return `
          <rect width="400" height="340" fill="#F6EFE6"/>
          <rect x="0" y="260" width="400" height="80" fill="#DFC9AE"/>
          <line x1="0" y1="260" x2="400" y2="260" stroke="#9C7A54" stroke-width="2"/>
          <rect x="18" y="24" width="146" height="224" rx="3" fill="#8C5A3C" stroke="#5A3621" stroke-width="2.5"/>
          <rect x="26" y="34" width="130" height="58" fill="#5A3621"/>
          <rect x="26" y="104" width="130" height="58" fill="#5A3621"/>
          <rect x="26" y="174" width="130" height="58" fill="#5A3621"/>
          <rect x="32" y="44" width="14" height="48" fill="#C84B31"/>
          <rect x="48" y="40" width="16" height="52" fill="#102542"/>
          <rect x="66" y="48" width="12" height="44" fill="#D97706"/>
          <rect x="82" y="42" width="15" height="50" fill="#2A6F97"/>
          <rect x="102" y="46" width="14" height="46" fill="#15803D"/>
          <rect x="34" y="114" width="16" height="48" fill="#2A6F97"/>
          <rect x="52" y="110" width="14" height="52" fill="#C84B31"/>
          <rect x="70" y="118" width="18" height="44" fill="#EAB308"/>
          <rect x="92" y="112" width="14" height="50" fill="#102542"/>
          <rect x="114" y="116" width="14" height="46" fill="#0F766E"/>
          <rect x="184" y="34" width="196" height="114" rx="4" fill="#E9D8BE" stroke="#9C7A54" stroke-width="3"/>
          <rect x="200" y="48" width="76" height="84" rx="2" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <line x1="210" y1="66" x2="264" y2="66" stroke="#102542" stroke-width="3"/>
          <line x1="210" y1="80" x2="258" y2="80" stroke="#94A3B8" stroke-width="2"/>
          <line x1="210" y1="92" x2="250" y2="92" stroke="#94A3B8" stroke-width="2"/>
          <rect x="292" y="54" width="70" height="58" rx="2" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
          <rect x="176" y="226" width="204" height="16" rx="3" fill="#A47148" stroke="#5A3621" stroke-width="2"/>
          <rect x="192" y="242" width="12" height="58" fill="#7F5539"/>
          <rect x="352" y="242" width="12" height="58" fill="#7F5539"/>
          <path d="M322 226 L322 194 L302 184" fill="none" stroke="#102542" stroke-width="3" stroke-linecap="round"/>
          <path d="M290 184 L318 184 L310 168 L296 168 Z" fill="#C84B31" stroke="#102542" stroke-width="2"/>
        `;

      case "schoolyard":
        return `
          <rect width="400" height="340" fill="#BAE6FD"/>
          <path d="M40 58 Q56 42 78 50 Q96 36 116 52 L36 58 Z" fill="#FFFFFF"/>
          <!-- Prédio da escola ao fundo -->
          <rect x="32" y="96" width="336" height="142" fill="#F8FAFC" stroke="#64748B" stroke-width="2.5"/>
          <polygon points="22,96 200,56 378,96" fill="#C84B31" stroke="#7F1D1D" stroke-width="2.5"/>
          <rect x="64" y="120" width="44" height="38" rx="2" fill="#93C5FD" stroke="#475569" stroke-width="2"/>
          <rect x="128" y="120" width="44" height="38" rx="2" fill="#93C5FD" stroke="#475569" stroke-width="2"/>
          <rect x="228" y="120" width="44" height="38" rx="2" fill="#93C5FD" stroke="#475569" stroke-width="2"/>
          <rect x="292" y="120" width="44" height="38" rx="2" fill="#93C5FD" stroke="#475569" stroke-width="2"/>
          <rect x="180" y="164" width="40" height="74" fill="#102542" stroke="#1E293B" stroke-width="2"/>
          <!-- Piso do pátio -->
          <rect x="0" y="238" width="400" height="102" fill="#E2E8F0"/>
          <line x1="0" y1="238" x2="400" y2="238" stroke="#64748B" stroke-width="2"/>
          <line x1="0" y1="286" x2="400" y2="286" stroke="#CBD5E1" stroke-width="1.5"/>
          <!-- Bancos do pátio -->
          <rect x="34" y="220" width="110" height="12" rx="3" fill="#B45309" stroke="#78350F" stroke-width="2"/>
          <rect x="46" y="232" width="8" height="20" fill="#334155"/>
          <rect x="124" y="232" width="8" height="20" fill="#334155"/>
          <rect x="256" y="220" width="110" height="12" rx="3" fill="#B45309" stroke="#78350F" stroke-width="2"/>
          <rect x="268" y="232" width="8" height="20" fill="#334155"/>
          <rect x="346" y="232" width="8" height="20" fill="#334155"/>
        `;

      case "bedroom":
        return `
          <rect width="400" height="340" fill="#F1F5F9"/>
          <rect x="0" y="248" width="400" height="92" fill="#E2D5C3"/>
          <line x1="0" y1="248" x2="400" y2="248" stroke="#B6A38A" stroke-width="2"/>
          <rect x="28" y="34" width="96" height="108" rx="4" fill="#BAE6FD" stroke="#64748B" stroke-width="2.5"/>
          <circle cx="96" cy="64" r="13" fill="#FDE047"/>
          <line x1="76" y1="34" x2="76" y2="142" stroke="#64748B" stroke-width="2"/>
          <rect x="20" y="26" width="112" height="8" rx="3" fill="#475569"/>
          <!-- Cama esquerda -->
          <rect x="14" y="208" width="132" height="46" rx="4" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>
          <rect x="14" y="184" width="14" height="70" rx="2" fill="#7F5539"/>
          <rect x="18" y="196" width="38" height="16" rx="4" fill="#DBEAFE" stroke="#94A3B8" stroke-width="1.5"/>
          <rect x="52" y="208" width="94" height="34" rx="2" fill="#C84B31"/>
          <!-- Prateleira e escrivaninha direita -->
          <rect x="200" y="132" width="166" height="10" rx="2" fill="#9A6B4C"/>
          <rect x="220" y="114" width="22" height="18" rx="2" fill="#102542"/>
          <rect x="246" y="110" width="16" height="22" rx="2" fill="#C84B31"/>
          <rect x="168" y="214" width="212" height="14" rx="3" fill="#B08968" stroke="#6C4F3D" stroke-width="2"/>
          <rect x="182" y="228" width="10" height="72" fill="#7F5539"/>
          <rect x="358" y="228" width="10" height="72" fill="#7F5539"/>
          <rect x="234" y="156" width="84" height="52" rx="4" fill="#0F172A" stroke="#334155" stroke-width="2"/>
          <rect x="240" y="162" width="72" height="39" rx="2" fill="#38BDF8" opacity="0.85"/>
          <rect x="268" y="208" width="16" height="6" fill="#475569"/>
        `;

      case "livingroom":
        return `
          <rect width="400" height="340" fill="#FAF6F0"/>
          <rect x="0" y="252" width="400" height="88" fill="#DFC9AE"/>
          <line x1="0" y1="252" x2="400" y2="252" stroke="#A6896B" stroke-width="2"/>
          <!-- Tapete -->
          <ellipse cx="200" cy="296" rx="145" ry="26" fill="#E8DCCB" stroke="#C84B31" stroke-width="2"/>
          <!-- Quadro na parede -->
          <rect x="58" y="42" width="112" height="74" rx="4" fill="#FFFFFF" stroke="#475569" stroke-width="3"/>
          <circle cx="96" cy="76" r="16" fill="#FDE047"/>
          <path d="M74 102 L106 68 L138 102 Z" fill="#102542"/>
          <!-- TV e Rack direita -->
          <rect x="232" y="68" width="136" height="84" rx="4" fill="#0F172A" stroke="#334155" stroke-width="3"/>
          <rect x="240" y="76" width="120" height="68" rx="2" fill="#38BDF8" opacity="0.3"/>
          <rect x="224" y="198" width="152" height="54" rx="4" fill="#8C5A3C" stroke="#5A3621" stroke-width="2"/>
          <line x1="300" y1="198" x2="300" y2="252" stroke="#5A3621" stroke-width="2"/>
          <!-- Sofá esquerda -->
          <rect x="22" y="170" width="174" height="58" rx="8" fill="#102542" stroke="#0B192E" stroke-width="2.5"/>
          <rect x="22" y="206" width="174" height="42" rx="6" fill="#1E3A5F" stroke="#0B192E" stroke-width="2.5"/>
          <rect x="16" y="188" width="22" height="60" rx="6" fill="#102542" stroke="#0B192E" stroke-width="2"/>
          <rect x="180" y="188" width="22" height="60" rx="6" fill="#102542" stroke="#0B192E" stroke-width="2"/>
        `;

      case "kitchen":
        return `
          <rect width="400" height="340" fill="#F8FAFC"/>
          <!-- Azulejos sutis -->
          <g stroke="#E2E8F0" stroke-width="1">
            <line x1="0" y1="120" x2="400" y2="120"/>
            <line x1="0" y1="160" x2="400" y2="160"/>
            <line x1="0" y1="200" x2="400" y2="200"/>
          </g>
          <rect x="0" y="256" width="400" height="84" fill="#E5E7EB"/>
          <line x1="0" y1="256" x2="400" y2="256" stroke="#9CA3AF" stroke-width="2"/>
          <!-- Armários superiores -->
          <rect x="120" y="24" width="164" height="64" rx="3" fill="#CBD5E1" stroke="#475569" stroke-width="2.5"/>
          <line x1="175" y1="24" x2="175" y2="88" stroke="#475569" stroke-width="2"/>
          <line x1="230" y1="24" x2="230" y2="88" stroke="#475569" stroke-width="2"/>
          <!-- Geladeira esquerda -->
          <rect x="18" y="64" width="84" height="192" rx="6" fill="#FFFFFF" stroke="#475569" stroke-width="2.5"/>
          <line x1="18" y1="132" x2="102" y2="132" stroke="#475569" stroke-width="2.5"/>
          <rect x="86" y="88" width="6" height="28" rx="2" fill="#64748B"/>
          <rect x="86" y="150" width="6" height="44" rx="2" fill="#64748B"/>
          <!-- Bancada / Fogão -->
          <rect x="116" y="182" width="174" height="74" rx="2" fill="#E2E8F0" stroke="#475569" stroke-width="2.5"/>
          <rect x="112" y="174" width="182" height="10" rx="2" fill="#334155"/>
          <rect x="134" y="198" width="58" height="42" rx="3" fill="#1E293B"/>
          <!-- Janela cozinha -->
          <rect x="304" y="42" width="76" height="84" rx="4" fill="#BAE6FD" stroke="#64748B" stroke-width="2.5"/>
          <line x1="342" y1="42" x2="342" y2="126" stroke="#64748B" stroke-width="2"/>
          <!-- Mesa refeição direita -->
          <rect x="294" y="216" width="94" height="12" rx="2" fill="#B08968" stroke="#5A3621" stroke-width="2"/>
          <rect x="304" y="228" width="8" height="48" fill="#7F5539"/>
          <rect x="370" y="228" width="8" height="48" fill="#7F5539"/>
        `;

      case "digital":
        return `
          <rect width="400" height="340" fill="#102542"/>
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
          <path d="M36 74 Q48 54 70 62 Q88 46 108 62 Q122 58 128 74 Z" fill="#FFFFFF"/>
          <path d="M254 58 Q266 40 286 48 Q304 34 322 50 Q336 48 342 62 L250 62 Z" fill="#FFFFFF"/>
          <rect x="20" y="136" width="58" height="114" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
          <rect x="86" y="114" width="66" height="136" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
          <rect x="262" y="128" width="60" height="122" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
          <rect x="330" y="144" width="54" height="106" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
          <rect x="192" y="180" width="16" height="72" fill="#7C4A2D"/>
          <circle cx="200" cy="146" r="40" fill="#4D7C0F" stroke="#365314" stroke-width="2"/>
          <circle cx="176" cy="160" r="26" fill="#65A30D"/>
          <circle cx="224" cy="158" r="28" fill="#65A30D"/>
          <rect x="0" y="246" width="400" height="24" fill="#84CC16"/>
          <rect x="0" y="270" width="400" height="70" fill="#D1D5DB"/>
          <line x1="0" y1="270" x2="400" y2="270" stroke="#6B7280" stroke-width="2"/>
          <rect x="134" y="232" width="132" height="10" rx="2" fill="#9A6B4C" stroke="#5A3621" stroke-width="2"/>
          <rect x="148" y="242" width="8" height="26" fill="#374151"/>
          <rect x="244" y="242" width="8" height="26" fill="#374151"/>
        `;

      case "street":
        return `
          <rect width="400" height="340" fill="#DBEAFE"/>
          <rect x="14" y="74" width="76" height="164" fill="#FDE68A" stroke="#78350F" stroke-width="2"/>
          <rect x="96" y="48" width="96" height="190" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
          <rect x="200" y="90" width="86" height="148" fill="#FECACA" stroke="#7F1D1D" stroke-width="2"/>
          <rect x="294" y="62" width="92" height="176" fill="#E2E8F0" stroke="#475569" stroke-width="2"/>
          <!-- Janelas simples -->
          <rect x="112" y="72" width="22" height="26" fill="#93C5FD"/>
          <rect x="150" y="72" width="22" height="26" fill="#93C5FD"/>
          <rect x="112" y="114" width="22" height="26" fill="#93C5FD"/>
          <rect x="150" y="114" width="22" height="26" fill="#93C5FD"/>
          <rect x="310" y="88" width="24" height="28" fill="#93C5FD"/>
          <rect x="346" y="88" width="24" height="28" fill="#93C5FD"/>
          <!-- Semáforo / Poste -->
          <rect x="314" y="176" width="8" height="72" fill="#374151"/>
          <rect x="306" y="132" width="24" height="48" rx="4" fill="#1F2937"/>
          <circle cx="318" cy="144" r="5" fill="#EF4444"/>
          <circle cx="318" cy="156" r="5" fill="#FACC15"/>
          <circle cx="318" cy="168" r="5" fill="#22C55E"/>
          <!-- Calçada e asfalto -->
          <rect x="0" y="238" width="400" height="44" fill="#E5E7EB"/>
          <line x1="0" y1="238" x2="400" y2="238" stroke="#6B7280" stroke-width="2"/>
          <rect x="0" y="282" width="400" height="58" fill="#4B5563"/>
          <rect x="26" y="302" width="54" height="12" fill="#F8FAFC"/>
          <rect x="108" y="302" width="54" height="12" fill="#F8FAFC"/>
          <rect x="190" y="302" width="54" height="12" fill="#F8FAFC"/>
          <rect x="272" y="302" width="54" height="12" fill="#F8FAFC"/>
        `;

      case "park":
        return `
          <rect width="400" height="340" fill="#BAE6FD"/>
          <circle cx="332" cy="56" r="24" fill="#FDE047"/>
          <path d="M44 64 Q62 46 86 56 Q104 42 122 58 L38 64 Z" fill="#FFFFFF"/>
          <!-- Colinas suaves -->
          <path d="M0 240 Q110 185 230 225 Q320 190 400 228 L400 264 L0 264 Z" fill="#86EFAC"/>
          <!-- Árvores -->
          <rect x="64" y="160" width="16" height="84" fill="#7C4A2D"/>
          <circle cx="72" cy="134" r="42" fill="#15803D"/>
          <circle cx="50" cy="146" r="26" fill="#16A34A"/>
          <rect x="292" y="154" width="18" height="90" fill="#7C4A2D"/>
          <circle cx="301" cy="126" r="46" fill="#15803D"/>
          <circle cx="328" cy="142" r="28" fill="#16A34A"/>
          <!-- Gramado e trilha -->
          <rect x="0" y="242" width="400" height="98" fill="#65A30D"/>
          <path d="M126 340 Q180 280 212 242 L262 242 Q242 290 282 340 Z" fill="#E7D8C9"/>
          <!-- Banco de madeira -->
          <rect x="148" y="218" width="96" height="10" rx="2" fill="#9A6B4C" stroke="#5A3621" stroke-width="2"/>
          <rect x="160" y="228" width="7" height="22" fill="#374151"/>
          <rect x="226" y="228" width="7" height="22" fill="#374151"/>
        `;

      case "garden":
        return `
          <rect width="400" height="340" fill="#E0F2FE"/>
          <circle cx="64" cy="54" r="22" fill="#FDE047"/>
          <path d="M240 62 Q256 44 278 54 Q298 40 318 58 L234 62 Z" fill="#FFFFFF"/>
          <!-- Cerca branca -->
          <rect x="0" y="206" width="400" height="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <g fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5">
            <rect x="18" y="168" width="22" height="72" rx="3"/>
            <rect x="64" y="168" width="22" height="72" rx="3"/>
            <rect x="110" y="168" width="22" height="72" rx="3"/>
            <rect x="156" y="168" width="22" height="72" rx="3"/>
            <rect x="202" y="168" width="22" height="72" rx="3"/>
            <rect x="248" y="168" width="22" height="72" rx="3"/>
            <rect x="294" y="168" width="22" height="72" rx="3"/>
            <rect x="340" y="168" width="22" height="72" rx="3"/>
          </g>
          <!-- Grama e canteiros floridos -->
          <rect x="0" y="236" width="400" height="104" fill="#84CC16"/>
          <circle cx="52" cy="240" r="26" fill="#22C55E"/>
          <circle cx="348" cy="238" r="28" fill="#22C55E"/>
          <!-- Flores -->
          <g>
            <line x1="42" y1="280" x2="42" y2="254" stroke="#15803D" stroke-width="3"/>
            <circle cx="42" cy="252" r="8" fill="#C84B31"/>
            <circle cx="42" cy="252" r="3.5" fill="#FDE047"/>
            <line x1="88" y1="292" x2="88" y2="264" stroke="#15803D" stroke-width="3"/>
            <circle cx="88" cy="262" r="8" fill="#F472B6"/>
            <circle cx="88" cy="262" r="3.5" fill="#FEF08A"/>
            <line x1="316" y1="286" x2="316" y2="258" stroke="#15803D" stroke-width="3"/>
            <circle cx="316" cy="256" r="8" fill="#F59E0B"/>
            <circle cx="316" cy="256" r="3.5" fill="#FFFFFF"/>
            <line x1="360" y1="280" x2="360" y2="252" stroke="#15803D" stroke-width="3"/>
            <circle cx="360" cy="250" r="8" fill="#38BDF8"/>
            <circle cx="360" cy="250" r="3.5" fill="#FEF08A"/>
          </g>
        `;

      case "minimal":
      default:
        return `
          <rect width="400" height="340" fill="#FFFFFF"/>
          <line x1="0" y1="306" x2="400" y2="306" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="6 6"/>
        `;
    }
  }

  global.HQScenes = {
    SCENES,
    renderSceneMarkup,
  };
})(window);
