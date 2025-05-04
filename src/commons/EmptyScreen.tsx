import { useParams, useLocation } from 'react-router-dom';
// import './EmptyScreen.css';

interface EmptyScreenProps {
  title: string;
}

const EmptyScreen: React.FC<EmptyScreenProps> = ({ title }) => {
  const params = useParams<{ [key: string]: string }>();
  const location = useLocation();

  return (
    <div className="Screen">
      <h1>{title}</h1>
      <p><strong>Current Path:</strong> {location.pathname}</p>
      <p><strong>Params:</strong> {JSON.stringify(params, null, 2)}</p>
    </div>
  );
};

export default EmptyScreen;