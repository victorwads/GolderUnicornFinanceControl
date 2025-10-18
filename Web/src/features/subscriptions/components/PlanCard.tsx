import { useNavigate } from 'react-router-dom';
import Badge from '@componentsDeprecated/common/Badge';
import Button from '@componentsDeprecated/common/Button';
import './PlanCard.css';

interface PlanCardProps {
  id: string;
  title: string;
  price: string;
  description: string;
  bullets: string[];
  cta: string;
  badge?: string;
  highlighted?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ id, title, price, description, bullets, cta, badge, highlighted }) => {
  const navigate = useNavigate();
  return (
    <div className={`PlanCard ${highlighted ? 'highlighted' : ''}`}>
      {badge && <Badge>{badge}</Badge>}
      <h3>{title}</h3>
      <div className="price">{price}</div>
      <p>{description}</p>
      <ul>
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <Button onClick={() => navigate(`/subscriptions/checkout/${id}`)}>{cta}</Button>
    </div>
  );
};

export default PlanCard;
