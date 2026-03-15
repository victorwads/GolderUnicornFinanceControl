import type VisualModuleTranslation from './base';

const fr: VisualModuleTranslation = {
  visual: {
    home: {
      greeting: userName=>`Hello, ${userName} \u{1F44B}`,
      subtitle: "Check your financial summary",
      quickActions: "Quick Actions",
      quickActionTransfer: "Transfer",
      quickActionIncome: "Account income",
      quickActionExpense: "Account expense",
      quickActionCreditCard: "Card expense",
      quickActionRecurring: "New recurring",
      quickActionPay: "Pay",
      accountsActive: count=>`${count} active accounts`,
      creditCardsCount: count=>`${count} cards`,
      totalInvoices: "Total Invoices"
    },
    more: {
      title: "More",
      subtitle: "Access other areas of the app",
      myId: "My ID",
      financeSection: "Financial management",
      accountSection: "My account",
      developerSection: "Developer Options / Beta",
      accounts: "Accounts",
      creditCards: "Credit Cards",
      categories: "Categories",
      recurrents: "Recurring expenses and income",
      assistant: "Assistant",
      assistantHistory: "Historique de l'assistant",
      settings: "Settings",
      settingsDescription: "App preferences",
      connectedAccounts: "Connected accounts",
      connectedAccountsDescription: "Banks and integrations",
      resourceUsage: "Resource usage",
      resourceUsageDescription: "App costs and consumption",
      privacyAndSecurity: "Privacy and security",
      privacy: "Privacy",
      privacyDescription: "Your data, terms and policy",
      developer: "Developer",
      developerDescription: "Advanced tools and options",
      subscriptions: "Subscriptions",
      developerUtilities: "Developer utilities",
      aiCalls: "AI Calls",
      aboutApp: "About the app",
      searchUpdates: "Check for updates",
      searchingUpdates: "Checking...",
      version: "Version",
      logout: "Log out"
    },
    settings: {
      title: "Settings",
      subtitle: "App preferences",
      appearance: "Appearance",
      themeAndColors: "Theme and Colors",
      customizeAppearance: "Customize appearance",
      languageTitle: "Language",
      densityTitle: "Density",
      densityDescription: "Adjust the visual spacing of the app.",
      aiAssistant: "AI Assistant Settings",
      voiceAndAudio: "Voice and Audio",
      speechSettings: "Speech settings",
      behavior: "Behavior",
      interactionMode: "Interaction mode",
      timelineBehavior: "Timeline / App behavior",
      financialMonthStartDay: "Financial month start day",
      financialMonthName: "Financial month naming",
      currentMonthMode: "Current month until selected day",
      currentMonthDescription: "From 10/15 onward it will be called October. Before 10/15 it will be called September.",
      nextMonthMode: "Next month after selected day",
      nextMonthDescription: "From 10/15 onward it will be called November. Before 10/15 it will be called October.",
      density: {
        compact: "Compact",
        normal: "Normal",
        comfortable: "Comfortable",
        spacious: "Spacious"
      },
      languageScreen: {
        title: "Language",
        chooseTitle: "Choose the app language",
        chooseDescription: "The change is applied immediately across the entire app.",
        deviceDefault: language=>`Device default (${language})`,
        deviceDefaultDescription: "Follows your browser and system preferred language.",
        interfaceDescription: locale=>`Interface and formatting in ${locale}.`
      },
      connectedAccounts: {
        title: "Connected accounts",
        subtitle: "Connect banks and services to sync your data",
        sectionTitle: "Connected accounts",
        emptyTitle: "No connected accounts",
        emptyDescription: "Connect an institution to track balances and transactions with less manual work.",
        connectButton: "Connect account",
        connected: "Connected",
        disconnect: "Disconnect",
        socialSection: "Social accounts",
        disconnectAnytime: "You can disconnect your accounts at any time.",
        secureStorage: "Your credentials are stored securely."
      },
      developer: {
        title: "Developer Options / Beta",
        subtitle: "Utilities recovered from legacy settings.",
        toolsTitle: "Tools",
        toolsDescription: "Shortcuts to technical screens and beta resources.",
        aiCalls: "AI Calls",
        subscriptions: "Subscriptions",
        onboardingTitle: "Onboarding",
        onboardingDescription: "Reopens onboarding flows for a new test.",
        resetAssistant: "Reset assistant onboarding",
        resetMicrophone: "Reset microphone onboarding",
        encryptionTitle: "Encryption",
        encryptionDescription: "Toggles `disableEncryption` and resaves encrypted repositories.",
        disableEncryption: "Disable encryption",
        disableEncryptionDescription: "Technical use only. The change resaves compatible data.",
        rewrittenItems: "Rewritten items",
        killAccountTitle: "Kill Account Registers",
        killAccountDescription: "Permanently removes every record of an account by ID.",
        accountIdPlaceholder: "Account ID",
        runAction: "Run",
        killAccountHint: "Use this only when you know exactly which account must be cleaned."
      },
      resourceUsage: {
        title: "Resource usage",
        subtitle: "Monitor app resource usage",
        beta: "Beta",
        monthlyAiUsage: "Monthly AI usage",
        exceededBy: amount=>`Limit exceeded by ${amount}`,
        database: "Database",
        reads: "Reads",
        writes: "Writes",
        queryReads: "Query reads",
        aiModels: "AI models",
        requests: "Requests",
        tokensIn: "Input tokens",
        tokensOut: "Output tokens",
        totalRequests: "Total requests",
        totalInputTokens: "Total input tokens",
        totalOutputTokens: "Total output tokens",
        estimatedCost: "Estimated cost",
        back: "Back"
      }
    },
    onboarding: {
      theme: {
        title: "Choose the app appearance",
        subtitle: "Set theme, color, and density before continuing.",
        continue: "Continue"
      },
      audio: {
        title: "Audio test",
        subtitle: "Let’s validate language and capture for voice.",
        startTest: "Start test",
        confirmLanguage: "Confirm language",
        skip: "Skip"
      },
      voiceSettings: {
        title: "Voice settings",
        subtitle: "Adjust rate and preferred voice.",
        continue: "Continue"
      },
      assistantMode: {
        title: "Assistant mode",
        subtitle: "Choose how the assistant should interact with you.",
        continue: "Continue"
      },
      voiceIntro: {
        title: "Voice assistant",
        subtitle: "Learn how to talk to your financial assistant.",
        continue: "Enter app"
      }
    },
    privacy: {
      title: "Privacy",
      subtitle: "Manage your data and review legal documents",
      exportData: "Export data",
      deleteAccount: "Delete account",
      terms: "Terms of use",
      policy: "Privacy policy",
      settingsAndPreferences: "Settings and preferences",
      dataTitle: "Your Data",
      dataDescription: "Export or delete your financial data",
      exportJsonTitle: "Export as JSON",
      exportJsonDescription: "Full format with all data",
      exportCsvTitle: "Export as CSV",
      exportCsvDescription: "Compatible with Excel and spreadsheets",
      exportHint: "Exported data includes all your transactions, accounts, cards and categories. Your data belongs to you and can be exported at any time.",
      exportSuccessTitle: "Export completed",
      exportPartialTitle: "Export completed with errors",
      exportSuccessCount: (count: number) => `${count} section(s) exported successfully.`,
      exportErrorCount: (count: number) => count > 0
        ? `${count} section(s) failed and are listed below.`
        : "No sections failed.",
      exportFileLabel: (fileName: string) => `Generated file: ${fileName}`,
      deleteDataTitle: "Delete my data",
      deleteDataDescription: "Deletes your financial data while keeping the authenticated account active.",
      deleteOnlyDataTitle: "Delete only my data",
      deleteOnlyDataDescription: "Creates an automatic backup before cleaning local and remote data.",
      policiesTitle: "Policies and Terms",
      policiesDescription: "Learn more about how we protect your data",
      termsDescription: "Rules and conditions for using the app",
      policyDescription: "How we collect and protect your data",
      manageAccountTitle: "Manage Account",
      manageAccountDescription: "Actions related to your account",
      deleteMyAccountTitle: "Delete my account",
      deleteMyAccountDescription: "Permanently remove all your data",
      deleteDialogTitle: "Delete only your data",
      deleteDialogDescription: "Your data will be exported before deletion. To continue, type the phrase below exactly as shown.",
      deleteDialogPlaceholder: "Type the confirmation phrase",
      deleteDialogCancel: "Cancel",
      deleteDialogConfirm: "Delete my data"
    },
    assistant: {
      aiCallsTitle: "Historique de l'assistant",
      aiCallsSubtitle: "Historique et coût de vos interactions avec l'assistant"
    }
  }
};

export default fr;
