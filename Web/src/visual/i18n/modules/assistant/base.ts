import type { Translation } from "../../core/types";

export default interface AssistantModuleTranslation extends Translation {
  speech: {
    title: string;
    howToUseTitle: string;
    intro1: string;
    intro2: string;
    examplesTitle: string;
    examples: string[];
    micStart: string;
    micStop: string;
    placeholderListeningHasItems: string;
    placeholderListeningNoItems: string;
    placeholderNotListening: string;
    haveListTitle: string;
    toBuyListTitle: string;
    browserNotSupported: string;
    changeLangTooltip: string;
    tokensUsed: (tokens: number, price: string) => string;
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
  assistant: {
    onboarding: {
      title: string;
      description: string;
      microRequirement: string;
      start: string;
      dismiss: string;
    };
  };
}
