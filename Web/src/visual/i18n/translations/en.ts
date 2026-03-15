import type FinanceTranslation from '../base';
import commons from '../modules/commons/en';
import finance from '../modules/finance/en';
import groceries from '../modules/groceries/en';
import auth from '../modules/auth/en';
import settings from '../modules/settings/en';
import home from '../modules/home/en';
import assistant from '../modules/assistant/en';
import subscriptions from '../modules/subscriptions/en';
import visual from '../modules/visual/en';

const en: FinanceTranslation = {
  ...commons,
  ...finance,
  ...groceries,
  ...auth,
  ...settings,
  ...home,
  ...assistant,
  ...subscriptions,
  ...visual,
};

export default en;
