import type SettingsModuleTranslation from './base';

const fr: SettingsModuleTranslation = {
  settings: {
    title: "Paramètres",
    data: "Données",
    myData: "Mes Données",
    exportData: "Exporter Mes Données",
    exportingData: (filename,current,max)=>`Exportation de ${filename} (${current}/${max})%`,
    exportDataError: "Impossible d'exporter vos données. Réessayez.",
    deleteData: "Supprimer toutes mes données",
    deleteDataConfirm: "Êtes-vous sûr ? Vos données seront exportées puis supprimées définitivement.",
    deleteDataPrompt: phrase=>`Saisissez \xAB ${phrase} \xBB pour confirmer.`,
    deleteDataMismatch: "La phrase saisie ne correspond pas. Rien n'a été supprimé.",
    deleteDataSuccess: "Toutes vos données ont été supprimées. Vous serez déconnecté ensuite.",
    deleteDataError: "Impossible de terminer la suppression des données. Réessayez.",
    deleteDataPhrases: ()=>["J'accepte de supprimer toutes mes donn\xE9es","Je veux effacer d\xE9finitivement mes donn\xE9es","Je comprends que cette action est irr\xE9versible","Je souhaite retirer tout ce qui concerne mon compte","Oui, supprime maintenant toutes mes donn\xE9es"],
    deletingData: (filename,current,max)=>`Suppression de ${filename} (${current}/${max})...`,
    auth: "Authentification",
    logout: "Déconnexion",
    clearLocalCaches: "Effacer les caches locaux",
    resetOnboarding: "Réinitialiser l'onboarding",
    theme: "Thème",
    density: "Densité",
    loadingDatabaseUsage: "Chargement de l'utilisation de la base de données...",
    language: "Langue",
    toggleEncryption: disabled=>disabled?"Activer le Chiffrement (DEV only)":"D\xE9sactiver le Chiffrement (DEV only)",
    resavingWithEncryption: (filename,current,max)=>`R\xE9enregistrement de ${filename} (${current}/${max})...`,
    timelineMode: "Mode (pour définir le nom du mois financier)",
    timelineModeStart: day=>`Nom du mois actuel jusqu'au jour ${day}`,
    timelineModeNext: day=>`Nom du prochain mois apr\xE8s le jour ${day}`,
    timelineCutoffDay: "Jour de coupure",
    appVersion: "Version de l’application",
    checkUpdates: "Rechercher des mises à jour",
    checkingUpdates: "Recherche de mises à jour...",
    newUpdateAvailable: "Une nouvelle version est disponible",
    installUpdate: "Mettre à jour maintenant",
    upToDate: "Vous utilisez la dernière version",
    offlineReady: "Disponible hors ligne",
    speechRate: "Vitesse de Parole",
    speechRateSlow: "Lent",
    speechRateNormal: "Normal",
    speechRateFast: "Rapide",
    enableVoice: "Activer la voix",
    testSpeech: "Tester la Parole",
    selectVoice: "Sélectionner la voix",
    testSpeechMessage: "Ceci est un message de test pour exemplifier ma parole.",
    listVoices: "Lister les Voix",
    hideVoices: "Masquer les Voix",
    availableVoices: "Voix Disponibles",
    assistantMode: {
      title: "Mode assistant",
      live: {
        name: "Mode live",
        description: "L'assistant écoute en continu et répond automatiquement quand vous arrêtez de parler. Idéal pour des conversations naturelles et fluides.",
      },
      manual: {
        name: "Mode manuel",
        description: "Vous contrôlez quand l'assistant doit écouter. Appuyez sur le micro pour parler puis à nouveau pour envoyer. Plus de contrôle et de confidentialité.",
      },
    },
    microphoneMode: {
      title: "Mode microphone",
      hold: {
        name: "Maintenir pour parler",
        description: "Maintenez le bouton enfoncé pendant que vous parlez",
      },
      click: {
        name: "Cliquer pour démarrer / Cliquer pour arrêter",
        description: "Cliquez une fois pour démarrer puis de nouveau pour terminer",
      },
    }
  }
};

export default fr;
