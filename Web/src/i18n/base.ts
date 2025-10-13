export default interface Translation {
  commons: {
    search: string;
    save: string;
    cancel: string;
    loading: string;
    fillAllFields: string;
    currentPath: string;
    params: string;
    selectOption: (label: string) => string;
    default: string;
    gohome: string;
  };
  timeline: {
    title: string;
    balance: string;
    clearFilter: string;
    registryCount: string;
    filters: string;
    from: string;
    to: string;
    apply: string;
    importOfx: string;
    importOfxTitle: string;
    importOfxAccountOption: string;
    importOfxCreditOption: string;
    importOfxAccountLabel: string;
    importOfxCardLabel: string;
    importOfxFileLabel: string;
    importOfxLoaded: (count: number) => string;
    importOfxNoTransactions: string;
    importOfxImport: string;
    importOfxError: string;
    importOfxSuccess: string;
  };
  registry: {
    title: string;
    description: string;
    value: string;
    date: string;
    account: string;
    paid: string;
    messages: {
      saved: string;
    };
  }
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
    editCreditCard: string;
    cardName: string;
    brand: string;
    limit: string;
    account: string;
    closingDay: string;
    dueDay: string;
    creditCardCreated: string;
    creditCardUpdated: string;
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
  groceries: {
    title: string;
    addItem: string;
    editItem: string;
    name: string;
    barcode: string;
    expirationDate: string;
    quantity: string;
    unit: string;
    paidPrice: string;
    purchaseDate: string;
    storageLocation: string;
    scanBarcode: string;
    itemCreated: string;
    productCreated: string;
    expired: string;
    expiringSoon: string;
    thisWeek: string;
    thisMonth: string;
    valid: string;
  };
  settings: {
    title: string;
    data: string;
    myData: string;
    exportData: string;
    exportingData: (filename: string, current: string, max: string) => string;
    auth: string;
    logout: string;
    clearLocalCaches: string;
    theme: string;
    density: string;
    loadingDatabaseUsage: string;
    language: string;
    toggleEncryption: (isDisabled: boolean) => string;
    resavingWithEncryption: (filename: string, current: string, max: string) => string;
    timelineMode: string;
    timelineModeStart: string;
    timelineModeNext: string;
    timelineCutoffDay: string;
    resetOnboarding: string;
    appVersion: string;
    checkUpdates: string;
    checkingUpdates: string;
    newUpdateAvailable: string;
    installUpdate: string;
    upToDate: string;
    offlineReady: string;
    speechRate: string;
    speechRateSlow: string;
    speechRateFast: string;
    testSpeech: string;
    testSpeechMessage: string;
    listVoices: string;
    hideVoices: string;
    availableVoices: string;
  };
  dashboard: {
    title: string;
    messages: {
      hello: string;
      otherThings: string;
      ideasWelcome: string;
    };
  };
  speech: {
    title: string;
    howToUseTitle: string;
    intro1: string;
    intro2: string;
    examplesTitle: string;
    examples: string[]; // ordered list of example utterances
    micStart: string; // aria label start listening
    micStop: string; // aria label stop listening
    placeholderListeningHasItems: string;
    placeholderListeningNoItems: string;
    placeholderNotListening: string;
    haveListTitle: string;
    toBuyListTitle: string;
    browserNotSupported: string;
    changeLangTooltip: string;
    tokensUsed: (tokens: number, price: string) => string; // e.g. "Used: 123 tokens,"
  };
  aiMic: {
    onboarding: {
      info: {
        title: string;
        p1: string;
        p2: string;
      };
      lang: {
        title: string;
        p1: string;
      };
      verification: {
        title: string;
        instructions: string;
        retry: string;
        success: string;
        waiting: string;
        targetLabel: string;
        transcriptLabel: string;
        scoreLabel: string;
      };
      progress: (passed: number, target: number) => string;
      success: {
        title: string;
        p1: string;
      };
      fail: {
        title: string;
        p1: string;
      };
      actions: {
        start: string;
        confirm: string;
        back: string;
        imDone: string;
        tryAgain: string;
        close: string;
      };
    };
    onboardingCases: () => string[];
  };
  recurrent: {
    title: string;
    empty: string;
    day: string;
    next: string;
    typeMonthly: string;
  };
  subscriptions?: import("@features/subscriptions/i18n/base").default;
}
