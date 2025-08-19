import { Link } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import FeatureTable from '../components/FeatureTable';
import { plans, transparencyNote } from '../planData';

const Plans: React.FC = () => (
  <div style={{ padding: 16 }}>
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      {plans.map((p) => (
        <PlanCard key={p.id} {...p} />
      ))}
    </div>
    <FeatureTable />
    <p style={{ marginTop: 24, textAlign: 'center' }}>{transparencyNote}</p>
    <p style={{ textAlign: 'center' }}>
      <Link to="/subscriptions/why">Por que cobramos?</Link> ·{' '}
      <Link to="/subscriptions/why/costs">Detalhes dos custos</Link>
    </p>
  </div>
);

export default Plans;
