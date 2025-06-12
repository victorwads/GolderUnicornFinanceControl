import { useParams, useLocation } from 'react-router-dom';
import { ModalScreen } from '@components/conteiners/ModalScreen';

interface EmptyScreenProps {
  title: string;
}

const EmptyScreen: React.FC<EmptyScreenProps> = ({ title }) => {
  const params = useParams<{ [key: string]: string }>();
  const location = useLocation();

  return <ModalScreen title={title + " - Placeholder Screen"}>
      <p><strong>{Lang.commons.currentPath}:</strong> {location.pathname}</p>
      <p><strong>{Lang.commons.params}:</strong> {JSON.stringify(params, null, 2)}</p>
  </ModalScreen>;
};

export default EmptyScreen;
