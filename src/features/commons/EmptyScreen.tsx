import { useParams, useLocation } from 'react-router-dom';
import { ModalScreen } from '../../components/conteiners/ModalScreen';

interface EmptyScreenProps {
  title: string;
}

const EmptyScreen: React.FC<EmptyScreenProps> = ({ title }) => {
  const params = useParams<{ [key: string]: string }>();
  const location = useLocation();

  return <ModalScreen title={title + " - Placeholder Screen"}>
      <p><strong>Current Path:</strong> {location.pathname}</p>
      <p><strong>Params:</strong> {JSON.stringify(params, null, 2)}</p>
  </ModalScreen>;
};

export default EmptyScreen;