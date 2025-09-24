import { Link } from 'react-router-dom';
import { SettingsSection } from './types';

const BetaContent = () => <div className='list'>
  <Link to={'/subscriptions'}>Subscriptions <small>(Only Informative)</small></Link>
</div>;

const section: SettingsSection = {
  id: 'beta',
  title: 'Beta',
  content: <BetaContent />
};

export default section;
