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
    selectOption: (label: string) => `Selecione a opção para ${label}`,
    default: 'Padrão',
  },
  timeline: {
    title: 'Linha do Tempo',
    balance: 'Saldo',
    clearFilter: 'Mostrar todos',
    registryCount: 'Registros',
  },
  registry: {
    title: 'Registro',
    description: 'Descrição',
    value: 'Valor',
    date: 'Data',
    account: 'Conta',
    paid: 'Pago',
    messages: {
      saved: 'Registro salvo com sucesso',
    },
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
  groceries: {
    title: 'Mercado',
    addItem: 'Adicionar Item',
    editItem: 'Editar Item',
    name: 'Nome',
    barcode: 'Código de Barras',
    expirationDate: 'Validade',
    quantity: 'Quantidade',
    unit: 'Unidade',
    paidPrice: 'Preço Pago',
    purchaseDate: 'Data da Compra',
    storageLocation: 'Local',
    scanBarcode: 'Ler Código de Barras',
    itemCreated: 'Item salvo',
    productCreated: 'Produto salvo',
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
    toggleEncryption: (disabled: boolean) => disabled ? 'Ativar Criptografia (DEV only)' : 'Desativar Criptografia (DEV only)',
    resavingWithEncryption: (filename: string, current: string, max: string) => `Salvando novamente ${filename} (${current}/${max})...`,
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
