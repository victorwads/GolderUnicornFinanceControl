import { getAuth, signOut } from 'firebase/auth';

export const AccountSection = () => <ul>
  <li><a onClick={() => signOut(getAuth())}>{Lang.settings.logout}</a></li>
</ul>;
