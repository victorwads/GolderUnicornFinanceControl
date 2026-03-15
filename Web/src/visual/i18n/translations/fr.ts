import type FinanceTranslation from '../base';
import commons from '../modules/commons/fr';
import finance from '../modules/finance/fr';
import groceries from '../modules/groceries/fr';
import auth from '../modules/auth/fr';
import settings from '../modules/settings/fr';
import home from '../modules/home/fr';
import assistant from '../modules/assistant/fr';
import subscriptions from '../modules/subscriptions/fr';
import visual from '../modules/visual/fr';

const fr: FinanceTranslation = {
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

export default fr;
