import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { ModalScreen } from '@componentsDeprecated/conteiners/ModalScreen';
import Button from '@componentsDeprecated/Button';

interface EmptyScreenProps {
  title: string;
}

const EmptyScreen: React.FC<EmptyScreenProps> = ({ title }) => {
  const params = useParams<{ [key: string]: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  return <ModalScreen title={title + " - Placeholder Screen"}>
      <p><strong>{Lang.commons.currentPath}:</strong> {location.pathname}</p>
      <p><strong>{Lang.commons.params}:</strong> {JSON.stringify(params, null, 2)}</p>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 24}}>
        <Button text={Lang.commons.gohome} onClick={() => navigate('/')} />
      </div>
  </ModalScreen>;
};

export default EmptyScreen;
