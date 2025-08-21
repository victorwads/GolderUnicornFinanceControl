import { AI_TOKEN_RATIO } from '../planData';

const { input, output } = AI_TOKEN_RATIO;

const costs = [
  {
    title: 'Servidores & Banco de Dados',
    description: 'Hospedagem, escalabilidade e armazenamento de dados de usuários.',
    cost: '~R$ X.000 / mês'
  },
  {
    title: 'Integrações e APIs',
    description: 'Conexões com bancos, cartões e serviços financeiros.',
    cost: 'cobrado por volume de requisições'
  },
  {
    title: 'Inteligência Artificial',
    description: `Cada chamada à IA gera custo por token (${input * 100}% entrada / ${output * 100}% saída).`,
    cost: '~R$ 0,02 a R$ 0,10 por 1.000 tokens'
  },
  {
    title: 'Firebase (infraestrutura)',
    description: 'Autenticação, Firestore, Storage e notificações em tempo real.',
    cost: '~R$ Y por cada 100k de leituras/gravações'
  }
];

const CostsExplained: React.FC = () => (
  <div style={{ padding: 16, lineHeight: 1.6 }}>
    <h2>Custos Explicados</h2>
    <p>Queremos ser 100% transparentes sobre <strong>como utilizamos o dinheiro das assinaturas</strong>. A assinatura não é sobre lucro — é sobre manter o projeto funcionando e garantir que todos possam ter acesso a ferramentas de <strong>educação financeira</strong>.</p>
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 16 }}>
      {costs.map(c => (
        <div key={c.title} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <strong>{c.cost}</strong>
        </div>
      ))}
    </div>
    <p style={{ marginTop: 16 }}>* Valores variam conforme o volume de usuários, uso de IA e tráfego nos servidores.</p>
    <p>👉 Para detalhes atualizados: <a href="https://firebase.google.com/pricing" target="_blank" rel="noreferrer">Firebase Pricing</a> &nbsp;|&nbsp; <a href="https://openai.com/api/pricing" target="_blank" rel="noreferrer">OpenAI Pricing</a></p>
    <h3>Trabalho Independente & Comunidade</h3>
    <p>Este projeto é desenvolvido de forma <strong>independente</strong> — minha alma, tempo livre e energia estão investidos aqui. Não há uma equipe por trás: sou apenas eu, um desenvolvedor que acredita que <strong>controle financeiro acessível</strong> pode mudar vidas.</p>
    <p>Por isso, duas áreas que normalmente seriam listadas como custos (“Desenvolvimento & Manutenção” e “Suporte & Comunidade”) não aparecem como valores monetários, mas sim como esforço pessoal e paixão.</p>
    <p><em>✨ Se você é designer ou tem experiência em UX (Experiência do Usuário), sua ajuda seria <strong>incrivelmente bem-vinda</strong>. Queremos tornar o app mais simples e acessível para pessoas com limitações de visão, motoras ou intelectuais.</em></p>
    <p>📩 Se quiser colaborar, entre em contato no Telegram: <a href="https://t.me/victorwads" target="_blank" rel="noreferrer">@victorwads</a></p>
    <h3>Como isso afeta os planos</h3>
    <p><ul>
      <li><strong>Plano Free</strong>: custeado pelos assinantes, com limites para manter o uso viável.</li>
      <li><strong>Plano Basic</strong>: cobre parte dos custos de IA, libera mais registros e relatórios avançados.</li>
      <li><strong>Plano Plus</strong>: melhor custo‑benefício: assistente fluido.</li>
      <li><strong>Plano Pro</strong>: financia integrações extras, maior limite de registros e acesso prioritário a novos recursos.</li>
    </ul></p>
    <p>Em resumo: <strong>quanto mais avançado o plano, mais custos diretos ele cobre</strong> — e, ao mesmo tempo, mantém o plano Free vivo para quem precisa.</p>
    <h3>Reinvestindo em Todos</h3>
    <p>Nenhum valor é retirado como lucro pessoal. Cada real arrecadado vai para pagar os custos de servidores, Firebase e IA, garantir que o plano Free continue existindo e trazer novos recursos e melhorias para todos.</p>
  </div>
);

export default CostsExplained;
