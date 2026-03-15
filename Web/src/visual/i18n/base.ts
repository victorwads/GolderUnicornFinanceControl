import type { Translation } from "./core/types";

import type AssistantModuleTranslation from "./modules/assistant/base";
import type AuthModuleTranslation from "./modules/auth/base";
import type CommonsModuleTranslation from "./modules/commons/base";
import type FinanceModuleTranslation from "./modules/finance/base";
import type GroceriesModuleTranslation from "./modules/groceries/base";
import type HomeModuleTranslation from "./modules/home/base";
import type SettingsModuleTranslation from "./modules/settings/base";
import type SubscriptionsModuleTranslation from "./modules/subscriptions/base";
import type VisualModuleTranslation from "./modules/visual/base";

export default interface FinanceTranslation
  extends Translation,
    CommonsModuleTranslation,
    FinanceModuleTranslation,
    GroceriesModuleTranslation,
    AuthModuleTranslation,
    SettingsModuleTranslation,
    HomeModuleTranslation,
    AssistantModuleTranslation,
    SubscriptionsModuleTranslation,
    VisualModuleTranslation {}
