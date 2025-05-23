import Translation from './base';

const en: Translation = {
  commons: {
    search: 'Search',
    loading: 'Loading...',
    fillAllFields: 'Fill all fields',
    cancel: 'Cancel',
    save: 'Save',
    currentPath: 'Current Path',
    params: 'Parameters',
  },
  timeline: {
    title: 'Timeline',
    balance: 'Balance',
    clearFilter: 'Show all',
    registryCount: 'Records',
  },
  accounts: {
    title: 'Accounts',
    showArchived: 'Show Archived',
    noAccounts: 'There is no account registered yet.',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    accountName: 'Account Name',
    bank: 'Bank',
    initialBalance: 'Initial Balance',
    accountColor: 'Account Color',
    includeInTotal: 'Include in Total',
    accountUpdated: 'Account updated successfully',
    accountCreated: 'Account created successfully',
    types: {
      label: 'Types',
      current: 'Current',
      savings: 'Savings',
      investment: 'Investment',
      cash: 'Cash',
    },
  },
  creditcards: {
    title: 'Credit Cards',
    noCreditCards: 'There is no credit card registered yet.',
    addCreditCard: 'Add Credit Card',
    selectedInvoice: 'Selected Invoice',
  },
  categories: {
    title: 'Categories',
    addCategory: 'Add Category',
    categoryName: 'Category Name',
    parentCategory: 'Parent Category',
    categoryCreated: 'Category created successfully',
  },
  login: {
    loginWithGoogle: 'Login with Google',
    loginWithApple: 'Login with Apple ID',
  },
  settings: {
    title: 'Settings',
    data: 'Data',
    privacy: 'Privacy',
    exportData: 'Export My Data',
    exportingData: (filename: string, current: string, max: string) =>
      `Exporting ${filename} (${current}/${max})%`,
    databaseUsage: 'Database Usage',
    auth: 'Auth',
    logout: 'Logout',
    clearLocalCaches: 'Clear local caches',
    theme: 'Theme',
    density: 'Density',
    loadingDatabaseUsage: 'Loading database usage...',
    language: 'Language',
  },
  dashboard: {
    title: 'Dashboard',
    messages: {
      hello: 'Hello',
      otherThings: 'Other things',
      ideasWelcome: 'Ideas are welcome',
    },
  }
};

export default en;
