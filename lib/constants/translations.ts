export const translations = {
  // Navigation
  nav: {
    dashboard: 'Painel de Controle',
    actors: 'Actores',
    locations: 'Localizações',
    sprayConfig: 'Configurações de Pulverização',
    sprayTotals: 'Registos Diários',
    reports: 'Relatórios',
    settings: 'Configurações',
    logout: 'Sair',
  },

  // Common
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Adicionar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    export: 'Exportar',
    loading: 'A carregar...',
    noData: 'Nenhum dado disponível',
    actions: 'Acções',
    status: 'Estado',
    date: 'Data',
    year: 'Ano',
    name: 'Nome',
    code: 'Código',
    description: 'Descrição',
    notes: 'Notas',
    active: 'Activo',
    inactive: 'Inactivo',
    yes: 'Sim',
    no: 'Não',
    total: 'Total',
    percentage: 'Percentagem',
  },

  // Authentication
  auth: {
    signIn: 'Iniciar Sessão',
    signOut: 'Terminar Sessão',
    email: 'E-mail',
    password: 'Palavra-passe',
    welcome: 'Bem-vindo',
    invalidCredentials: 'Credenciais inválidas',
    roles: {
      ADMIN: 'Administrador',
      SUPERVISOR: 'Supervisor',
      SPRAYER: 'Pulverizador',
    },
  },

  // Dashboard
  dashboard: {
    title: 'Painel de Controle',
    progressCard: {
      title: 'Progresso da Pulverização',
      subtitle: 'Dias concluídos vs configurados',
      completedDays: 'Dias Concluídos',
      configuredDays: 'Dias Configurados',
    },
    coverageCard: {
      title: 'Cobertura',
      subtitle: 'Estruturas pulverizadas vs encontradas',
      structuresSprayed: 'Estruturas Pulverizadas',
      structuresFound: 'Estruturas Encontradas',
    },
    performanceCard: {
      title: 'Desempenho',
      subtitle: 'Estruturas por hora por brigada',
      structuresPerHour: 'Estruturas/Hora',
      brigades: 'Brigadas',
    },
    charts: {
      progressChart: 'Gráfico de Progresso',
      coverageChart: 'Gráfico de Cobertura',
      performanceChart: 'Gráfico de Desempenho',
    },
  },

  // Actors
  actors: {
    title: 'Gestão de Actores',
    actorTypes: 'Tipos de Actor',
    addActor: 'Adicionar Actor',
    editActor: 'Editar Actor',
    actorType: 'Tipo de Actor',
    actorNumber: 'Número do Actor',
    fields: {
      name: 'Nome do Actor',
      actorType: 'Tipo de Actor',
      isActive: 'Activo',
    },
    types: {
      sprayer: 'Pulverizador',
      brigadeChief: 'Chefe de Brigada',
    },
  },

  // Locations
  locations: {
    title: 'Gestão de Localizações',
    provinces: 'Províncias',
    districts: 'Distritos',
    localities: 'Localidades',
    communities: 'Comunidades',
    addProvince: 'Adicionar Província',
    addDistrict: 'Adicionar Distrito',
    addLocality: 'Adicionar Localidade',
    addCommunity: 'Adicionar Comunidade',
    fields: {
      provinceName: 'Nome da Província',
      provinceCode: 'Código da Província',
      districtName: 'Nome do Distrito',
      districtCode: 'Código do Distrito',
      localityName: 'Nome da Localidade',
      communityName: 'Nome da Comunidade',
      selectProvince: 'Seleccionar Província',
      selectDistrict: 'Seleccionar Distrito',
      selectLocality: 'Seleccionar Localidade',
    },
  },

  // Spray Configuration
  sprayConfig: {
    title: 'Configurações de Pulverização',
    addConfig: 'Adicionar Configuração',
    editConfig: 'Editar Configuração',
    fields: {
      year: 'Ano',
      province: 'Província',
      district: 'Distrito',
      proposedSprayDays: 'Dias de Pulverização Propostos',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',
      sprayRounds: 'Rondas de Pulverização',
      daysBetweenRounds: 'Dias Entre Rondas',
      description: 'Descrição',
      notes: 'Notas',
      isActive: 'Activo',
    },
  },

  // Spray Totals
  sprayTotals: {
    title: 'Registo Diário de Pulverização',
    addRecord: 'Adicionar Registo',
    editRecord: 'Editar Registo',
    dailyRecord: 'Registo Diário',
    fields: {
      sprayer: 'Pulverizador',
      brigadeChief: 'Chefe de Brigada',
      community: 'Comunidade',
      sprayConfiguration: 'Configuração de Pulverização',
      sprayType: 'Tipo de Pulverização',
      sprayDate: 'Data de Pulverização',
      sprayYear: 'Ano de Pulverização',
      sprayRound: 'Ronda de Pulverização',
      sprayStatus: 'Estado da Pulverização',
      insecticideUsed: 'Insecticida Utilizado',
      structuresFound: 'Estruturas Encontradas',
      structuresSprayed: 'Estruturas Pulverizadas',
      structuresNotSprayed: 'Estruturas Não Pulverizadas',
      compartmentsSprayed: 'Compartimentos Pulverizados',
      reasonNotSprayed: 'Razão Não Pulverizado',
      wallsType: 'Tipo de Paredes',
      roofsType: 'Tipo de Telhados',
      numberOfPersons: 'Número de Pessoas',
      childrenUnder5: 'Crianças Menores de 5 Anos',
      pregnantWomen: 'Mulheres Grávidas',
    },
    enums: {
      sprayType: {
        PRINCIPAL: 'Principal',
        SECUNDARIA: 'Secundária',
      },
      sprayStatus: {
        PLANNED: 'Planeado',
        IN_PROGRESS: 'Em Progresso',
        COMPLETED: 'Concluído',
        CANCELLED: 'Cancelado',
      },
      reasonNotSprayed: {
        RECUSA: 'Recusa',
        FECHADA: 'Fechada',
        OUTRO: 'Outro',
      },
      wallsType: {
        MATOPE: 'Matope',
        COLMO: 'Colmo',
        CIMENTO: 'Cimento',
      },
      roofsType: {
        CAPIM_PLASTICO: 'Capim/Plástico',
        ZINCO: 'Zinco',
      },
    },
  },

  // Reports
  reports: {
    title: 'Relatórios',
    sprayProgress: 'Progresso de Pulverização',
    coverage: 'Cobertura',
    performance: 'Desempenho',
    exportToExcel: 'Exportar para Excel',
    filters: {
      year: 'Filtrar por Ano',
      province: 'Filtrar por Província',
      district: 'Filtrar por Distrito',
      dateRange: 'Intervalo de Datas',
      sprayStatus: 'Estado da Pulverização',
    },
    columns: {
      date: 'Data',
      location: 'Localização',
      sprayer: 'Pulverizador',
      brigadeChief: 'Chefe de Brigada',
      structuresFound: 'Estruturas Encontradas',
      structuresSprayed: 'Estruturas Pulverizadas',
      coverage: 'Cobertura (%)',
      status: 'Estado',
    },
  },

  // Messages
  messages: {
    success: {
      saved: 'Dados guardados com sucesso!',
      deleted: 'Registo eliminado com sucesso!',
      exported: 'Relatório exportado com sucesso!',
    },
    error: {
      generic: 'Ocorreu um erro. Tente novamente.',
      notFound: 'Registo não encontrado.',
      unauthorized: 'Não autorizado.',
      validation: 'Por favor, verifique os dados inseridos.',
    },
    confirm: {
      delete: 'Tem certeza que deseja eliminar este registo?',
      logout: 'Tem certeza que deseja terminar a sessão?',
    },
  },

  // Validation
  validation: {
    required: 'Este campo é obrigatório',
    email: 'E-mail inválido',
    minLength: 'Mínimo de {0} caracteres',
    maxLength: 'Máximo de {0} caracteres',
    min: 'Valor mínimo: {0}',
    max: 'Valor máximo: {0}',
    invalidDate: 'Data inválida',
    futureDate: 'A data deve ser no futuro',
    pastDate: 'A data deve ser no passado',
  },
} as const;