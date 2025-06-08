import Translation from './base';

const fr: Translation = {
  commons: {
    search: 'Rechercher',
    loading: 'Chargement...',
    fillAllFields: 'Remplissez tous les champs',
    cancel: 'Annuler',
    save: 'Enregistrer',
    currentPath: 'Chemin Actuel',
    params: 'Paramètres',
    selectOption: (label: string) => `Sélectionnez l'option pour ${label}`,
  },
  timeline: {
    title: 'Chronologie',
    balance: 'Solde',
    clearFilter: 'Afficher tout',
    registryCount: 'Enregistrements',
  },
  accounts: {
    title: 'Comptes',
    showArchived: 'Afficher les Archivés',
    noAccounts: 'Aucun compte enregistré pour le moment.',
    addAccount: 'Ajouter un Compte',
    editAccount: 'Modifier le Compte',
    accountName: 'Nom du Compte',
    bank: 'Banque',
    initialBalance: 'Solde Initial',
    accountColor: 'Couleur du Compte',
    includeInTotal: 'Inclure dans le Total',
    accountUpdated: 'Compte mis à jour avec succès',
    accountCreated: 'Compte créé avec succès',
    types: {
      label: 'Types',
      current: 'Courant',
      savings: 'Épargne',
      investment: 'Investissement',
      cash: 'Espèces',
    },
  },
  creditcards: {
    title: 'Cartes de Crédit',
    noCreditCards: 'Aucune carte de crédit enregistrée pour le moment.',
    addCreditCard: 'Ajouter une Carte de Crédit',
    selectedInvoice: 'Facture Sélectionnée',
  },
  categories: {
    title: 'Catégories',
    addCategory: 'Ajouter une Catégorie',
    categoryName: 'Nom de la Catégorie',
    parentCategory: 'Catégorie Parente',
    categoryCreated: 'Catégorie créée avec succès',
  },
  login: {
    loginWithGoogle: 'Se connecter avec Google',
    loginWithApple: 'Se connecter avec Apple ID',
  },
  settings: {
    title: 'Paramètres',
    data: 'Données',
    privacy: 'Confidentialité',
    exportData: 'Exporter Mes Données',
    exportingData: (filename: string, current: string, max: string) =>
      `Exportation de ${filename} (${current}/${max})%`,
    databaseUsage: 'Utilisation de la Base de Données',
    auth: 'Authentification',
    logout: 'Déconnexion',
    clearLocalCaches: 'Effacer les caches locaux',
    theme: 'Thème',
    density: 'Densité',
    loadingDatabaseUsage: 'Chargement de l\'utilisation de la base de données...',
    language: 'Langue',
  },
  dashboard: {
    title: 'Tableau de Bord',
    messages: {
      hello: 'Bonjour',
      otherThings: 'Autres choses',
      ideasWelcome: 'Les idées sont les bienvenues',
    },
  },
  registry: {
    title: 'Enregistrement',
    description: 'Description',
    value: 'Valeur',
    date: 'Date',
    account: 'Compte',
    paid: 'Payé',
    messages: {
      saved: 'Enregistrement sauvegardé avec succès',
    },
  },
};

export default fr;
