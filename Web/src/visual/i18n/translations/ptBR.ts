import type FinanceTranslation from '../base';
import commons from '../modules/commons/ptBR';
import finance from '../modules/finance/ptBR';
import groceries from '../modules/groceries/ptBR';
import auth from '../modules/auth/ptBR';
import settings from '../modules/settings/ptBR';
import home from '../modules/home/ptBR';
import assistant from '../modules/assistant/ptBR';
import subscriptions from '../modules/subscriptions/ptBR';
import visual from '../modules/visual/ptBR';

const ptBR: FinanceTranslation = {
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

export default ptBR;
