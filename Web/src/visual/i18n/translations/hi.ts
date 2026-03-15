import type FinanceTranslation from '../base';
import commons from '../modules/commons/hi';
import finance from '../modules/finance/hi';
import groceries from '../modules/groceries/hi';
import auth from '../modules/auth/hi';
import settings from '../modules/settings/hi';
import home from '../modules/home/hi';
import assistant from '../modules/assistant/hi';
import subscriptions from '../modules/subscriptions/hi';
import visual from '../modules/visual/hi';

const hi: FinanceTranslation = {
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

export default hi;
