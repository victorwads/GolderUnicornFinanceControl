import type FinanceTranslation from '../base';
import commons from '../modules/commons/es';
import finance from '../modules/finance/es';
import groceries from '../modules/groceries/es';
import auth from '../modules/auth/es';
import settings from '../modules/settings/es';
import home from '../modules/home/es';
import assistant from '../modules/assistant/es';
import subscriptions from '../modules/subscriptions/es';
import visual from '../modules/visual/es';

const es: FinanceTranslation = {
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

export default es;
