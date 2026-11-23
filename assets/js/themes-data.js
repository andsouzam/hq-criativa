(function (global) {
  const WORKSHOP_THEMES = [
    {
      id: "fake-news",
      number: "Tema 01",
      title: "Checagem de Fake News",
      description:
        "Personagens recebem uma notícia duvidosa no celular e investigam fontes confiáveis antes de compartilhar.",
      prompts: [
        "Quadro 1: Mensagem alarmista chega no celular em casa",
        "Quadro 2: Investigação com lupa na biblioteca",
        "Quadro 3: Descoberta da farsa e alerta aos colegas",
      ],
      template: {
        title: "Nem Tudo Que Brilha é Verdade",
        authors: "Oficina Letramento Digital",
        panelCount: 3,
        panels: [
          {
            sceneId: "livingroom",
            items: [
              { id: "t1-1", kind: "character", assetId: "boy", expression: "surprised", pose: "holding", framing: "full", skinColor: "#F0B892", hairColor: "#1E1B18", hairStyle: "short", outfitColor: "#2563EB", accessories: { glasses: false, hat: false, necklace: false, watch: true }, x: 140, y: 215, scale: 0.85, flip: false },
              { id: "t1-2", kind: "object", assetId: "phone", x: 188, y: 210, scale: 0.78, flip: false },
              { id: "t1-3", kind: "bubble", type: "shout", text: "Chocante! Vou encaminhar agora!", fontSize: 13, tailDir: "left", x: 242, y: 74, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "library",
            items: [
              { id: "t1-4", kind: "character", assetId: "detective", expression: "alert", pose: "holding", framing: "full", skinColor: "#E8B490", hairColor: "#5C3A21", hairStyle: "short", outfitColor: "#B6935E", accessories: { glasses: false, hat: true, necklace: false, watch: true }, x: 132, y: 215, scale: 0.85, flip: false },
              { id: "t1-5", kind: "object", assetId: "magnifier", x: 182, y: 205, scale: 0.9, flip: false },
              { id: "t1-6", kind: "object", assetId: "fakenews", x: 298, y: 116, scale: 0.86, flip: false },
              { id: "t1-7", kind: "bubble", type: "speech", text: "Calma! Já conferiu a fonte e a data?", fontSize: 13, tailDir: "left", x: 204, y: 68, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "computerlab",
            items: [
              { id: "t1-8", kind: "character", assetId: "boy", expression: "happy", pose: "pointing", framing: "full", skinColor: "#F0B892", hairColor: "#1E1B18", hairStyle: "short", outfitColor: "#2563EB", accessories: { glasses: false, hat: false, necklace: false, watch: true }, x: 125, y: 215, scale: 0.85, flip: false },
              { id: "t1-9", kind: "character", assetId: "girl", expression: "happy", pose: "standing", framing: "full", skinColor: "#B5744B", hairColor: "#1E1B18", hairStyle: "puffs", outfitColor: "#C84B31", accessories: { glasses: false, hat: false, necklace: true, watch: false }, x: 280, y: 215, scale: 0.85, flip: true },
              { id: "t1-10", kind: "object", assetId: "lightbulb", x: 202, y: 148, scale: 0.85, flip: false },
              { id: "t1-11", kind: "bubble", type: "speech", text: "Era fake news! Agora eu sempre checo antes.", fontSize: 13, tailDir: "left", x: 200, y: 66, scale: 1, flip: false },
            ],
          },
        ],
      },
    },
    {
      id: "etica-digital",
      number: "Tema 02",
      title: "Ética Digital e Direitos Autorais",
      description:
        "Debate sobre respeito às criações de outras pessoas, créditos corretos e compartilhamento responsável em rede.",
      prompts: [
        "Quadro 1: Tentação de copiar trabalho pronto sem crédito",
        "Quadro 2: Diálogo sobre autoria com professor(a) na biblioteca",
        "Quadro 3: Produção autoral com referências e segurança",
      ],
      template: {
        title: "Criar é Melhor que Copiar",
        authors: "Oficina Letramento Digital",
        panelCount: 3,
        panels: [
          {
            sceneId: "classroom",
            items: [
              { id: "t2-1", kind: "character", assetId: "girl", expression: "thoughtful", pose: "typing", framing: "full", skinColor: "#B5744B", hairColor: "#1E1B18", hairStyle: "puffs", outfitColor: "#C84B31", accessories: { glasses: true, hat: false, necklace: false, watch: false }, x: 135, y: 215, scale: 0.85, flip: false },
              { id: "t2-2", kind: "object", assetId: "laptop", x: 208, y: 228, scale: 0.9, flip: false },
              { id: "t2-3", kind: "bubble", type: "thought", text: "Posso pegar essa imagem sem citar quem fez?", fontSize: 13, tailDir: "left", x: 215, y: 68, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "library",
            items: [
              { id: "t2-4", kind: "character", assetId: "teacher", expression: "happy", pose: "holding", framing: "full", skinColor: "#E6AE86", hairColor: "#5C3A21", hairStyle: "bun", outfitColor: "#102542", accessories: { glasses: true, hat: false, necklace: true, watch: true }, x: 138, y: 215, scale: 0.85, flip: false },
              { id: "t2-5", kind: "object", assetId: "book", x: 194, y: 212, scale: 0.82, flip: false },
              { id: "t2-6", kind: "bubble", type: "speech", text: "Todo conteúdo tem autor. Sempre dê os créditos!", fontSize: 13, tailDir: "left", x: 222, y: 66, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "computerlab",
            items: [
              { id: "t2-7", kind: "character", assetId: "girl", expression: "happy", pose: "standing", framing: "full", skinColor: "#B5744B", hairColor: "#1E1B18", hairStyle: "puffs", outfitColor: "#C84B31", accessories: { glasses: true, hat: false, necklace: false, watch: true }, x: 145, y: 215, scale: 0.85, flip: false },
              { id: "t2-8", kind: "object", assetId: "lock", x: 278, y: 224, scale: 0.9, flip: false },
              { id: "t2-9", kind: "bubble", type: "narrator", text: "Respeito aos direitos autorais fortalece a rede", fontSize: 12, tailDir: "left", x: 200, y: 30, scale: 1, flip: false },
              { id: "t2-10", kind: "bubble", type: "speech", text: "Vou criar minha própria HQ e citar as fontes!", fontSize: 13, tailDir: "left", x: 218, y: 84, scale: 1, flip: false },
            ],
          },
        ],
      },
    },
    {
      id: "quebrando-algoritmo",
      number: "Tema 03",
      title: "Quebrando o Algoritmo",
      description:
        "Narrativas sobre abandonar o consumo passivo de recomendações automáticas e pesquisar com autonomia crítica.",
      prompts: [
        "Quadro 1: O robô entrega sempre o mesmo conteúdo no espaço digital",
        "Quadro 2: Conversa crítica na praça com a família",
        "Quadro 3: Escolha consciente e busca ativa de novas ideias",
      ],
      template: {
        title: "Fora da Bolha do Algoritmo",
        authors: "Oficina Letramento Digital",
        panelCount: 3,
        panels: [
          {
            sceneId: "digital",
            items: [
              { id: "t3-1", kind: "character", assetId: "robot", expression: "happy", pose: "holding", framing: "full", skinColor: "#CBD5E1", hairColor: "#C84B31", hairStyle: "short", outfitColor: "#102542", accessories: { glasses: false, hat: false, necklace: false, watch: false }, x: 135, y: 215, scale: 0.85, flip: false },
              { id: "t3-2", kind: "object", assetId: "phone", x: 188, y: 208, scale: 0.78, flip: false },
              { id: "t3-3", kind: "bubble", type: "speech", text: "Assista só o que eu escolhi para você!", fontSize: 13, tailDir: "left", x: 222, y: 66, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "park",
            items: [
              { id: "t3-4", kind: "character", assetId: "elder", expression: "alert", pose: "sitting", framing: "full", skinColor: "#EBBFA4", hairColor: "#CBD5E1", hairStyle: "bun", outfitColor: "#0F766E", accessories: { glasses: true, hat: false, necklace: true, watch: false }, x: 145, y: 212, scale: 0.84, flip: false },
              { id: "t3-5", kind: "character", assetId: "boy", expression: "thoughtful", pose: "standing", framing: "full", skinColor: "#F0B892", hairColor: "#1E1B18", hairStyle: "curly", outfitColor: "#2563EB", accessories: { glasses: false, hat: false, necklace: false, watch: false }, x: 278, y: 215, scale: 0.85, flip: true },
              { id: "t3-6", kind: "bubble", type: "speech", text: "Por que só aparecem notícias iguais no meu feed?", fontSize: 13, tailDir: "right", x: 202, y: 66, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "schoolyard",
            items: [
              { id: "t3-7", kind: "character", assetId: "boy", expression: "happy", pose: "walking", framing: "full", skinColor: "#F0B892", hairColor: "#1E1B18", hairStyle: "curly", outfitColor: "#2563EB", accessories: { glasses: false, hat: true, necklace: false, watch: true }, x: 132, y: 215, scale: 0.85, flip: false },
              { id: "t3-8", kind: "character", assetId: "dog", isAnimal: true, expression: "happy", pose: "sitting", framing: "full", skinColor: "#D97706", hairColor: "#78350F", hairStyle: "short", outfitColor: "#C84B31", accessories: { glasses: false, hat: false, necklace: true, watch: false }, x: 276, y: 266, scale: 0.9, flip: true },
              { id: "t3-9", kind: "object", assetId: "notebook", x: 180, y: 224, scale: 0.78, flip: false },
              { id: "t3-10", kind: "bubble", type: "speech", text: "Eu escolho o que pesquisar e aprendo muito mais!", fontSize: 13, tailDir: "left", x: 210, y: 66, scale: 1, flip: false },
            ],
          },
        ],
      },
    },
  ];

  global.HQThemes = {
    WORKSHOP_THEMES,
  };
})(window);
