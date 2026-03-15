import type { Translation } from "../../core/types";

export default interface HomeModuleTranslation extends Translation {
  dashboard: {
    title: string;
    messages: {
      hello: string;
      otherThings: string;
      ideasWelcome: string;
    };
  };
}
