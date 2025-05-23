import Translation from './base';

const ptBR: Translation = {
  commons: {
    search: 'Pesquisar',
    loading: 'Carregando...',
    fillAllFields: 'Preencha todos os campos',
    cancel: 'Cancelar',
    save: 'Salvar',
    currentPath: 'Caminho Atual',
    params: 'Parâmetros',
  },
  timeline: {
    title: 'Linha do Tempo',
    balance: 'Saldo',
    clearFilter: 'Mostrar todos',
    registryCount: 'Registros',
  },
  accounts: {
    title: 'Contas',
    showArchived: 'Mostrar Arquivados',
    noAccounts: 'Não há contas registradas ainda.',
    addAccount: 'Adicionar Conta',
    editAccount: 'Editar Conta',
    accountName: 'Nome da Conta',
    bank: 'Banco',
    initialBalance: 'Saldo Inicial',
    accountColor: 'Cor da Conta',
    includeInTotal: 'Incluir no Total',
    accountUpdated: 'Conta atualizada com sucesso',
    accountCreated: 'Conta criada com sucesso',
    types: {
      label: 'Tipos',
      current: 'Corrente',
      savings: 'Poupança',
      investment: 'Investimento',
      cash: 'Dinheiro',
    },
  },
  creditcards: {
    title: 'Cartões de Crédito',
    noCreditCards: 'Não há cartões de crédito registrados ainda.',
    addCreditCard: 'Adicionar Cartão de Crédito',
    selectedInvoice: 'Fatura Selecionada',
  },
  categories: {
    title: 'Categorias',
    addCategory: 'Adicionar Categoria',
    categoryName: 'Nome da Categoria',
    parentCategory: 'Categoria Pai',
    categoryCreated: 'Categoria criada com sucesso',
  },
  login: {
    loginWithGoogle: 'Entrar com Google',
    loginWithApple: 'Entrar com Apple ID',
  },
  settings: {
    title: 'Configurações',
    data: 'Dados',
    privacy: 'Privacidade',
    exportData: 'Exportar Meus Dados',
    exportingData: (filename: string, current: string, max: string) =>
      `Exportando ${filename} (${current}/${max})%`,
    databaseUsage: 'Uso do Banco de Dados',
    auth: 'Autenticação',
    logout: 'Sair',
    clearLocalCaches: 'Limpar caches locais',
    theme: 'Tema',
    density: 'Densidade',
    loadingDatabaseUsage: 'Carregando uso do banco de dados...',
    language: 'Idioma',
  },
  dashboard: {
    title: 'Visão Geral',
    messages: {
      hello: 'Olá',
      otherThings: 'Outras coisas',
      ideasWelcome: 'Ideias são bem-vindas',
    }
  }
};

export default ptBR;
