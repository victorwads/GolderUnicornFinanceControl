import PlanCard from '../components/PlanCard';
import FeatureTable from '../components/FeatureTable';

const Plans: React.FC = () => {
  const t = Lang.subscriptions?.plans;
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <PlanCard
          title={t?.basic.title || 'Basic'}
          price={t?.basic.price || 'R$ 0/mês'}
          description={t?.basic.description || 'Grátis para sempre, ferramentas essenciais para quem está começando nas finanças pessoais.'}
        />
        <PlanCard
          title={t?.plus.title || 'Plus'}
          price={t?.plus.price || 'R$ 15/mês'}
          description={t?.plus.description || 'Plano mensal acessível, inclui insights avançados e sincronização na nuvem.'}
          highlighted
        />
        <PlanCard
          title={t?.premium.title || 'Premium'}
          price={t?.premium.price || 'R$ 30/mês'}
          description={t?.premium.description || 'Para usuários avançados, inclui exportação completa, integrações e suporte prioritário.'}
        />
      </div>
      <FeatureTable />
      <p style={{ marginTop: 24, textAlign: 'center' }}>
        {t?.disclaimer || 'Os valores existem para cobrir custos, garantir sustentabilidade e permitir que continuemos oferecendo acesso à educação financeira no Brasil.'}
      </p>
    </div>
  );
};

export default Plans;
