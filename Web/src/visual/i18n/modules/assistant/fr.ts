import type AssistantModuleTranslation from './base';

const fr: AssistantModuleTranslation = {
  speech: {
    title: "Articles d'Achats",
    howToUseTitle: "Comment utiliser",
    intro1: "Parlez naturellement des articles que vous avez déjà et de ceux que vous devez acheter. L'assistant comprendra vos phrases pour ajouter, retirer ou mettre à jour les articles et séparera ceux que vous possédez de votre liste d'achats.",
    intro2: "Vous pouvez mentionner le nom, la date d'expiration, si c'est ouvert/en usage, la quantité, le prix payé, où c'est stocké, etc.",
    examplesTitle: "Exemples :",
    examples: [
      "je dois acheter des œufs et du lait",
      "j'ai acheté 2 paquets de riz",
      "j'ai 3 paquets de pâtes dans l'armoire",
      "j'ai du jambon et du fromage ouverts dans le frigo qui vont périmer dans 3 jours",
      "le paquet de café expire dans 2 mois",
      "je n'ai plus de haricots"
    ],
    micStart: "Démarrer l'écoute",
    micStop: "Arrêter l'écoute",
    placeholderListeningHasItems: "Parlez librement",
    placeholderListeningNoItems: "Commencez à parler",
    placeholderNotListening: "Appuyez sur le bouton pour parler",
    haveListTitle: "J'ai",
    toBuyListTitle: "À acheter",
    browserNotSupported: "Le navigateur ne supporte pas la reconnaissance vocale.",
    changeLangTooltip: "Cliquez pour changer la langue",
    tokensUsed: (tokens,price)=>`Utilis\xE9s : ${tokens} Tokens, R$ ${price}`
  },
  aiMic: {
    onboarding: {
      info: {
        title: "Test de reconnaissance vocale",
        p1: "La reconnaissance vocale utilisée dans l'application est native et dépend de la compatibilité de votre appareil.",
        p2: "Faisons un test rapide pour vérifier que tout fonctionne."
      },
      lang: {
        title: "Confirmez la langue",
        p1: "Vérifiez que la langue de l'application est correcte et que la langue parlée correspond à celle configurée sur votre appareil."
      },
      verification: {
        title: "Répétez la phrase",
        instructions: "Prononcez la phrase affichée ci-dessous afin de valider la reconnaissance vocale.",
        retry: "La reconnaissance est insuffisante, réessayez.",
        success: "Parfait ! Passons à la phrase suivante.",
        waiting: "En attente de votre voix...",
        targetLabel: "Phrase attendue",
        transcriptLabel: "Transcription",
        scoreLabel: "Score"
      },
      progress: (passed,target)=>`${passed} sur ${target}`,
      success: {
        title: "Tout est prêt !",
        p1: "Votre appareil est compatible avec la reconnaissance vocale."
      },
      fail: {
        title: "Impossible de valider",
        p1: "Nous n'avons pas pu confirmer la compatibilité de la reconnaissance vocale pour le moment."
      },
      actions: {
        start: "Commencer le test",
        confirm: "Confirmer la langue",
        back: "Retour",
        imDone: "Terminé",
        tryAgain: "Réessayer",
        close: "Fermer"
      }
    },
    onboardingCases: ()=>["Tester un virement de douze reais du compte salaire vers l'\xE9pargne.","Test vocal pour le montant R$ 20,00 saisi comme d\xE9pense rapide.","Autre test en disant seulement vingt reais pour v\xE9rifier sans symbole.","Dire transf\xE9rer douze BRL vers le compte de r\xE9serve afin de confirmer la gestion du code devise.","Demander de d\xE9placer cinquante USD du compte courant vers le fonds voyage et confirmer le mot USD.","Essayer d'ajouter un d\xE9bit de trente euros \xE0 la cat\xE9gorie \xE9picerie pour observer le support multi-devises.","Dicter l'enregistrement d'un retrait de soixante-quinze dollars avec la note ATM B3 pour v\xE9rifier montant et note.","Prononcer payer l'abonnement USB et observer une \xE9ventuelle confusion avec USD.","Dire enregistrer un remboursement de cent vingt pesos mexicains pour tester les devises \xE9trang\xE8res.","Dire rechercher les comptes de la cliente Maria da Silva pour \xE9prouver la reconnaissance du nom complet.","Demander d'afficher le plafond de la carte Visa entreprise en BRL en m\xE9langeant volontairement les langues.","Ordonner de g\xE9n\xE9rer un rapport comparant les totaux cr\xE9dit et d\xE9bit d'avril pour tester la g\xE9n\xE9ration de rapports.","Essayer de marquer la facture deux z\xE9ro quatre cinq comme pay\xE9e en dollars pour valider les chiffres dict\xE9s.","Dire capturer le paiement r\xE9current de R$ 99,90 pour Spotify afin de v\xE9rifier les d\xE9cimales.","Exp\xE9rimenter la conversion de deux cents BRL en USD et l'enregistrement de l'\xE9cart pour \xE9prouver les conversions."]
  },
  assistant: {
    onboarding: {
      title: "Lancer l’assistant financier",
      description: "Laissez l’assistant vous guider dans la configuration initiale et personnaliser votre expérience.",
      microRequirement: "Nous vérifierons d’abord votre microphone pour nous assurer que tout fonctionne correctement.",
      start: "Commencer maintenant",
      dismiss: "Ne plus afficher"
    }
  }
};

export default fr;
