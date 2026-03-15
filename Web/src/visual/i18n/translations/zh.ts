import type FinanceTranslation from '../base';
import commons from '../modules/commons/zh';
import finance from '../modules/finance/zh';
import groceries from '../modules/groceries/zh';
import auth from '../modules/auth/zh';
import settings from '../modules/settings/zh';
import home from '../modules/home/zh';
import assistant from '../modules/assistant/zh';
import subscriptions from '../modules/subscriptions/zh';
import visual from '../modules/visual/zh';

const zh: FinanceTranslation = {
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

export default zh;
