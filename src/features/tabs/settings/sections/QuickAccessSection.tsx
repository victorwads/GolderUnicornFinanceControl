import { Link } from 'react-router-dom';

export const QuickAccessSection = () => <ul>
  <li><Link to={'/categories'}>{Lang.categories.title}</Link></li>
  <li><Link to={'/accounts'}>{Lang.accounts.title}</Link></li>
  <li><Link to={'/creditcards'}>{Lang.creditcards.title}</Link></li>
</ul>;
