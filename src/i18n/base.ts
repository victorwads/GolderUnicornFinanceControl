export default interface Translation {
  commons: {
    search: string;
    save: string;
    cancel: string;
    loading: string;
    fillAllFields: string;
    currentPath: string;
    params: string;
  };
  timeline: {
    title: string;
    balance: string;
    clearFilter: string;
    registryCount: string;
  };
  accounts: {
    title: string;
    showArchived: string;
    noAccounts: string;
    addAccount: string;
    editAccount: string;
    accountName: string;
    bank: string;
    initialBalance: string;
    accountColor: string;
    types: {
      label: string;
      current: string;
      savings: string;
      investment: string;
      cash: string;
    }
    accountUpdated: string;
    accountCreated: string;
    includeInTotal: string;
  };
  creditcards: {
    title: string;
    noCreditCards: string;
    addCreditCard: string;
    selectedInvoice: string;
  };
  categories: {
    title: string;
    addCategory: string;
    categoryName: string;
    parentCategory: string;
    categoryCreated: string;
  };
  login: {
    loginWithGoogle: string;
    loginWithApple: string;
  };
  settings: {
    title: string;
    data: string;
    privacy: string;
    exportData: string;
    exportingData: (filename: string, current: string, max: string) => string;
    databaseUsage: string;
    auth: string;
    logout: string;
    clearLocalCaches: string;
    theme: string;
    density: string;
    loadingDatabaseUsage: string;
    language: string;
  };
  dashboard: {
    title: string;
    messages: {
      hello: string;
      otherThings: string;
      ideasWelcome: string;
    };
  };
}
