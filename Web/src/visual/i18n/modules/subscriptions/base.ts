import type { Translation } from "../../core/types";

export default interface SubscriptionsModuleTranslation extends Translation {
  subscriptions: {
    checkout: {
      payNow: string;
    };
    thankyou: {
      title: string;
      message: string;
    };
  };
}
