(function (global) {
  const WORKSHOP_THEMES = [
    {
      id: "fake-news",
      number: "Tema 01",
      title: "Checagem de Fake News",
      description:
        "Personagens recebem uma notícia duvidosa no celular e investigam fontes confiáveis antes de compartilhar.",
      prompts: [
        "Quadro 1: Mensagem alarmista chega no celular",
        "Quadro 2: Uso da lupa e busca em fontes oficiais",
        "Quadro 3: Descoberta da farsa e alerta à turma",
      ],
      template: {
        title: "Nem Tudo Que Brilha é Verdade",
        authors: "Oficina Letramento Digital",
        panelCount: 3,
        panels: [
          {
            sceneId: "bedroom",
            items: [
              { id: "t1-1", kind: "character", assetId: "boy", expression: "surprised", x: 145, y: 248, scale: 1, flip: false },
              { id: "t1-2", kind: "object", assetId: "phone", x: 255, y: 230, scale: 1.05, flip: false },
              { id: "t1-3", kind: "bubble", type: "shout", text: "Chocante! Vou encaminhar agora!", fontSize: 13, tailDir: "left", x: 230, y: 88, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "library",
            items: [
              { id: "t1-4", kind: "character", assetId: "detective", expression: "alert", x: 130, y: 248, scale: 1, flip: false },
              { id: "t1-5", kind: "object", assetId: "magnifier", x: 245, y: 220, scale: 1.1, flip: false },
              { id: "t1-6", kind: "object", assetId: "fakenews", x: 296, y: 116, scale: 0.9, flip: false },
              { id: "t1-7", kind: "bubble", type: "speech", text: "Calma! Já conferiu a fonte e a data?", fontSize: 13, tailDir: "left", x: 195, y: 78, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "classroom",
            items: [
              { id: "t1-8", kind: "character", assetId: "boy", expression: "happy", x: 130, y: 248, scale: 0.96, flip: false },
              { id: "t1-9", kind: "character", assetId: "girl", expression: "happy", x: 270, y: 248, scale: 0.96, flip: true },
              { id: "t1-10", kind: "object", assetId: "lightbulb", x: 200, y: 145, scale: 0.9, flip: false },
              { id: "t1-11", kind: "bubble", type: "speech", text: "Era fake news! Agora eu sempre checo antes.", fontSize: 13, tailDir: "left", x: 198, y: 72, scale: 1, flip: false },
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
        "Quadro 2: Diálogo sobre autoria e responsabilidade digital",
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
              { id: "t2-1", kind: "character", assetId: "girl", expression: "thoughtful", x: 135, y: 248, scale: 0.98, flip: false },
              { id: "t2-2", kind: "object", assetId: "laptop", x: 268, y: 235, scale: 1.05, flip: false },
              { id: "t2-3", kind: "bubble", type: "thought", text: "Posso pegar essa imagem sem citar quem fez?", fontSize: 13, tailDir: "left", x: 205, y: 80, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "library",
            items: [
              { id: "t2-4", kind: "character", assetId: "teacher", expression: "happy", x: 140, y: 248, scale: 0.98, flip: false },
              { id: "t2-5", kind: "object", assetId: "book", x: 265, y: 225, scale: 1.1, flip: false },
              { id: "t2-6", kind: "bubble", type: "speech", text: "Todo conteúdo tem autor. Sempre dê os créditos!", fontSize: 13, tailDir: "left", x: 215, y: 78, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "classroom",
            items: [
              { id: "t2-7", kind: "character", assetId: "girl", expression: "happy", x: 150, y: 248, scale: 1, flip: false },
              { id: "t2-8", kind: "object", assetId: "lock", x: 270, y: 215, scale: 1, flip: false },
              { id: "t2-9", kind: "bubble", type: "narrator", text: "Respeito aos direitos autorais fortalece a rede", fontSize: 12, tailDir: "left", x: 200, y: 32, scale: 1, flip: false },
              { id: "t2-10", kind: "bubble", type: "speech", text: "Vou criar minha própria HQ e citar as fontes!", fontSize: 13, tailDir: "left", x: 215, y: 92, scale: 1, flip: false },
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
        "Quadro 1: O algoritmo entrega apenas o mesmo tipo de vídeo",
        "Quadro 2: O estudante percebe a bolha de filtro",
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
              { id: "t3-1", kind: "character", assetId: "robot", expression: "happy", x: 135, y: 248, scale: 0.98, flip: false },
              { id: "t3-2", kind: "object", assetId: "phone", x: 275, y: 228, scale: 1.05, flip: false },
              { id: "t3-3", kind: "bubble", type: "speech", text: "Assista só o que eu escolhi para você!", fontSize: 13, tailDir: "left", x: 210, y: 78, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "square",
            items: [
              { id: "t3-4", kind: "character", assetId: "elder", expression: "alert", x: 130, y: 248, scale: 0.95, flip: false },
              { id: "t3-5", kind: "character", assetId: "boy", expression: "thoughtful", x: 265, y: 248, scale: 0.95, flip: true },
              { id: "t3-6", kind: "bubble", type: "speech", text: "Por que só aparecem notícias iguais no meu feed?", fontSize: 13, tailDir: "right", x: 198, y: 78, scale: 1, flip: false },
            ],
          },
          {
            sceneId: "library",
            items: [
              { id: "t3-7", kind: "character", assetId: "boy", expression: "happy", x: 135, y: 248, scale: 0.98, flip: false },
              { id: "t3-8", kind: "object", assetId: "lightbulb", x: 245, y: 175, scale: 1, flip: false },
              { id: "t3-9", kind: "object", assetId: "book", x: 300, y: 230, scale: 1, flip: false },
              { id: "t3-10", kind: "bubble", type: "speech", text: "Eu escolho o que pesquisar e aprendo muito mais!", fontSize: 13, tailDir: "left", x: 210, y: 76, scale: 1, flip: false },
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
