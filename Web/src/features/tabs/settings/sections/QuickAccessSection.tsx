import { Link } from 'react-router-dom';
import { SettingsSection } from './types';

const FinanceList = () => <div className='list'>
  <Link to={'/categories'}>{Lang.categories.title}</Link>
  <Link to={'/accounts'}>{Lang.accounts.title}</Link>
  <Link to={'/creditcards'}>{Lang.creditcards.title}</Link>
  <Link to={'/recurrent'}>{Lang.recurrent.title}</Link>
</div>;

const section: SettingsSection = {
  id: 'finances',
  title: 'Gestão Financeira',
  content: <FinanceList />
};

export default section;
