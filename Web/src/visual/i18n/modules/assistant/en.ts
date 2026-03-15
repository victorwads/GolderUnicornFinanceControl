import type AssistantModuleTranslation from './base';

const en: AssistantModuleTranslation = {
  speech: {
    title: "Grocery Items",
    howToUseTitle: "How to use",
    intro1: "Speak naturally about groceries you already have and those you still need to buy. The assistant will understand your phrases to add, remove or update items and will separate owned items from your shopping list.",
    intro2: "You can mention the name, expiration, whether it is opened/in use, quantity, how much you paid, where it is stored, etc.",
    examplesTitle: "Examples:",
    examples: [
      "I need to buy eggs and milk",
      "I bought 2 packs of rice",
      "I have 3 packs of pasta in the cabinet",
      "I have ham and cheese opened in the fridge and they will spoil in 3 days",
      "The coffee package expires in 2 months",
      "I have no more beans"
    ],
    micStart: "Start listening",
    micStop: "Stop listening",
    placeholderListeningHasItems: "Feel free to talk",
    placeholderListeningNoItems: "Start speaking",
    placeholderNotListening: "Press the button to speak",
    haveListTitle: "Have",
    toBuyListTitle: "To Buy",
    browserNotSupported: "Browser does not support speech recognition.",
    changeLangTooltip: "Click to change the language",
    tokensUsed: (tokens,price)=>`Used: ${tokens} Tokens, R$ ${price}`
  },
  aiMic: {
    onboarding: {
      info: {
        title: "Speech recognition test",
        p1: "The speech recognition used in the app is native and depends on your device compatibility.",
        p2: "Let’s run a quick test to make sure everything is working."
      },
      lang: {
        title: "Confirm the language",
        p1: "Make sure the app language is correct and that your spoken language matches the one configured on your device."
      },
      verification: {
        title: "Repeat the phrase",
        instructions: "Say the phrase shown below so we can validate the speech recognition.",
        retry: "We could not match it, please try again.",
        success: "Great! Moving on to the next phrase.",
        waiting: "Waiting for you to speak…",
        targetLabel: "Expected phrase",
        transcriptLabel: "Transcript",
        scoreLabel: "Score"
      },
      progress: (passed,target)=>`${passed} of ${target}`,
      success: {
        title: "All set!",
        p1: "Your device is compatible with speech recognition."
      },
      fail: {
        title: "Could not validate",
        p1: "We were not able to confirm speech recognition compatibility right now."
      },
      actions: {
        start: "Start test",
        confirm: "Confirm language",
        back: "Back",
        imDone: "I'm done",
        tryAgain: "Try again",
        close: "Close"
      }
    },
    onboardingCases: ()=>["Testing a transfer of twelve reais from the salary account into savings.","Voice test for the amount R$ 20,00 recorded as a quick expense.","Second test saying only twenty reais to see if it works without the symbol.","Say transfer twelve BRL to the reserve account to confirm currency code handling.","Request moving fifty USD from checking to the travel fund and confirm the USD keyword.","Try adding a debit of thirty euros to groceries to observe multi-currency support.","Dictate logging a seventy-five dollar cash withdrawal with note ATM B3 to check amount plus note.","Pronounce pay the USB subscription and watch for confusion with USD.","Say register a reimbursement of one hundred twenty Mexican pesos to cover foreign currencies.","Speak search accounts for customer Maria da Silva to stress full name recognition.","Ask show Visa corporate card limit in BRL mixing languages on purpose.","Command generate a report comparing credit versus debit totals for April to test reporting.","Try mark invoice two zero four five as paid in dollars to validate spoken digits.","Say capture recurring payment of R$ 99,90 for Spotify to verify decimal amounts.","Experiment with convert two hundred BRL to USD and log the difference to stress conversions."]
  },
  assistant: {
    onboarding: {
      title: "Start with the finance assistant",
      description: "Let the assistant walk you through the initial setup and tailor the experience for you.",
      microRequirement: "We will first verify your microphone to ensure everything works properly.",
      start: "Start now",
      dismiss: "Don’t show again"
    }
  }
};

export default en;
