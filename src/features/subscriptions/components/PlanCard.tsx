import { useNavigate } from 'react-router-dom';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';
import './PlanCard.css';

interface PlanCardProps {
  title: string;
  price: string;
  description: string;
  highlighted?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ title, price, description, highlighted }) => {
  const navigate = useNavigate();
  return (
    <div className={`PlanCard ${highlighted ? 'highlighted' : ''}`}>
      {highlighted && <Badge>{Lang.subscriptions?.plans.badge || 'Most Popular'}</Badge>}
      <h3>{title}</h3>
      <div className="price">{price}</div>
      <p>{description}</p>
      <Button onClick={() => navigate(`/subscriptions/checkout/${title.toLowerCase()}`)}>
        {Lang.subscriptions?.plans.select || 'Choose'}
      </Button>
    </div>
  );
};

export default PlanCard;
