import { Link } from 'react-router-dom';

interface Props {
  encryptionDisabled: boolean;
  toggleEncryption: () => void;
  clearFirestore: () => void;
}

export const BetaDevSection = ({ encryptionDisabled, toggleEncryption, clearFirestore }: Props) => <ul>
  <li><Link to={'/subscriptions'}>Subscriptions</Link> <small>(Only Informative)</small></li>
  {window.isDevelopment && <>
    <li><a onClick={clearFirestore}>{Lang.settings.clearLocalCaches}</a></li>
    <li><a onClick={toggleEncryption}>{Lang.settings.toggleEncryption(encryptionDisabled)}</a></li>
  </>}
</ul>;
