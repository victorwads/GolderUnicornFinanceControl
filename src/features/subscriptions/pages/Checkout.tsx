import { useParams } from 'react-router-dom';
import EmptyScreen from '@features/commons/EmptyScreen';
import Button from '@components/common/Button';

const Checkout: React.FC = () => {
  const { plan } = useParams<{ plan: string }>();
  return (
    <div>
      <EmptyScreen title={`Checkout for ${plan}`} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Button>{Lang.subscriptions?.checkout.payNow || 'Pay Now'}</Button>
      </div>
    </div>
  );
};

export default Checkout;
