(function () {
  const ACTIVITIES_KEY = "escotista.activities";

  const activitiesInit = [
    {
      id: 1,
      name: "Pedro Silva",
      tag: "Especialidade: Culinaria",
      tagType: "gold",
      time: "Ha 2 horas",
      quote: "Fiz o pao de cacador na fogueira do quintal com meu pai. Ficou bem assado e crocante!",
      block: "Habilidades para a Vida",
      date: "24/05/2026",
      status: "pendente",
    },
    {
      id: 2,
      name: "Mariana Costa",
      tag: "Atividade: Observacao",
      tagType: "teal",
      time: "Ha 5 horas",
      quote: "Identifiquei um Bem-te-vi e um Sabia-laranjeira no parque hoje de manha.",
      block: "Meio Ambiente",
      date: "24/05/2026",
      status: "pendente",
    },
    {
      id: 3,
      name: "Lucas Rocha",
      tag: "Atividade: Primeiros Socorros",
      tagType: "red",
      time: "Ha 8 horas",
      quote: "Aprendi a fazer curativo e imobilizacao de fraturas com o kit de primeiros socorros.",
      block: "Saude e Bem-Estar",
      date: "23/05/2026",
      status: "pendente",
    },
  ];

  const lobinhos = [
    { id: 1, name: "Mowgli", level: "PATA-TENRA", progress: 45, pending: 2, color: "gold" },
    { id: 2, name: "Bagheera", level: "SALTADOR", progress: 87, pending: 0, color: "teal" },
    { id: 3, name: "Baloo", level: "PATA-TENRA", progress: 30, pending: 1, color: "gold" },
    { id: 4, name: "Raksha", level: "RASTREADOR", progress: 55, pending: 0, color: "green" },
  ];

  const axes = [
    {
      slug: "habilidades",
      title: "Habilidades para a Vida",
      pct: 85,
      color: "gold",
      desc: "Aprenda a cuidar de si mesmo, cozinhar e organizar sua mochila para grandes aventuras.",
      icon: "gear",
    },
    {
      slug: "meio-ambiente",
      title: "Meio Ambiente",
      pct: 42,
      color: "green",
      desc: "Explore a natureza, conheca as plantas e animais da nossa mata e aprenda a reciclar.",
      icon: "tree",
    },
    {
      slug: "paz",
      title: "Paz e Desenvolvimento",
      pct: 60,
      color: "teal",
      desc: "Trabalhe em equipe na Alcateia e entenda como ajudar sua comunidade e amigos.",
      icon: "people",
    },
    {
      slug: "saude",
      title: "Saude e Bem-Estar",
      pct: 25,
      color: "red",
      desc: "Mantenha seu corpo forte, alimente-se bem e participe de jogos ativos na Jangal.",
      icon: "activity",
    },
  ];

  function readActivities() {
    try {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      return saved ? JSON.parse(saved) : activitiesInit.slice();
    } catch (error) {
      return activitiesInit.slice();
    }
  }

  function writeActivities(activities) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }

  function getActivities() {
    return readActivities();
  }

  function getPendingActivities() {
    return readActivities().filter((activity) => activity.status === "pendente");
  }

  function updateActivityStatus(ids, status) {
    const normalizedIds = Array.isArray(ids) ? ids : [ids];
    const activities = readActivities().map((activity) =>
      normalizedIds.includes(activity.id) ? { ...activity, status } : activity,
    );
    writeActivities(activities);
    return activities;
  }

  function addActivity(activity) {
    const activities = readActivities();
    const nextId = activities.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const newActivity = { id: nextId, status: "pendente", time: "Agora", ...activity };
    writeActivities([newActivity, ...activities]);
    return newActivity;
  }

  function resetActivities() {
    writeActivities(activitiesInit.slice());
    return getActivities();
  }

  function tagTypeForBlock(block) {
    if (block === "Meio Ambiente") return "teal";
    if (block === "Saude e Bem-Estar") return "red";
    if (block === "Paz e Desenvolvimento") return "green";
    return "gold";
  }

  window.EscotistaData = {
    axes,
    lobinhos,
    activitiesInit,
    getActivities,
    getPendingActivities,
    updateActivityStatus,
    addActivity,
    resetActivities,
    tagTypeForBlock,
  };
})();