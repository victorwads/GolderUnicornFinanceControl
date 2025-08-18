import { Link } from 'react-router-dom';

const WhyWeCharge: React.FC = () => (
  <div style={{ padding: 16, lineHeight: 1.6 }}>
    <p><strong>Resumindo: a assinatura não é sobre lucro. Nós cobramos apenas o valor mínimo necessário para manter o projeto vivo. Qualquer sobra será totalmente reinvestida no próprio app — seja para criar novas funcionalidades para quem paga, seja para garantir que quem não pode pagar ainda consiga usar gratuitamente para organizar suas finanças possivelmente melhorando sua qualidade de vida.</strong></p>
    <section>
      <h2>Seção 1 – Introdução Honesta</h2>
      <p>Acreditamos que educação financeira precisa ser acessível. Por isso, o nosso plano Básico é gratuito para sempre.
Mas gratuito não significa sem limites: nós custeamos a infraestrutura essencial para que qualquer pessoa consiga organizar seus fluxos financeiros de forma simples e viável. Esse plano cobre o básico, sem custo para o usuário, mas com algumas restrições que garantem que possamos manter o serviço sem inviabilizar o projeto.</p>
      <p>No plano gratuito, você terá:</p>
      <ul>
        <li>Limite de registros, para evitar custos excessivos com banco de dados</li>
        <li>Uso de Inteligência Artificial apenas na abertura de contas, já que cada requisição de IA tem um custo bem alto!</li>
        <li>Recursos básicos de controle financeiro.</li>
      </ul>
      <p>Fazemos isso porque não temos dinheiro infinito. Nosso objetivo é oferecer o máximo viável de graça, dentro do que conseguimos sustentar, para que mesmo quem não tem como pagar tenha condições de melhorar a sua vida financeira.</p>
      <p>Para mais detalhes dos nossos custos acesse <Link to="/subscriptions/why/cots">aqui</Link>.</p>
    </section>
    <section>
      <h2>Seção 2 – Por que existem planos pagos</h2>
      <p>Com os planos Plus e Premium, conseguimos:</p>
      <ul>
        <li>Financiar a infraestrutura que mantém o app funcionando</li>
        <li>Investir em novas funcionalidades e melhorias</li>
        <li>Garantir estabilidade e segurança</li>
        <li>Permitir que o plano gratuito continue existindo para quem precisa</li>
      </ul>
      <p>Para mais detalhes dos nossos custos acesse <Link to="/subscriptions/why/cots">aqui</Link>.</p>
    </section>
    <section>
      <h2>Seção 3 – Nossos Custos</h2>
      <p>Manter o aplicativo envolve custos reais, que crescem a cada novo usuário:</p>
      <ul>
        <li>Servidores e banco de dados</li>
        <li>APIs e integrações (bancos, cartões, pagamentos)</li>
        <li>Custos com Inteligência Artificial</li>
        <li>Desenvolvimento contínuo e manutenção</li>
        <li>Suporte e recursos para a comunidade</li>
      </ul>
      <p>Esses custos não param de crescer, e precisamos garantir que o projeto seja sustentável no longo prazo.</p>
      <p>Para mais detalhes dos nossos custos acesse <Link to="/subscriptions/why/cots">aqui</Link>.</p>
    </section>
    <section>
      <h2>Seção 4 – Com sua assinatura você ajuda!</h2>
      <p>Quando você assina, você não está apenas destravando funcionalidades extras. Você está financiando o acesso à educação financeira para milhares de pessoas no Brasil. O seu apoio garante que o projeto continue disponível e evoluindo, sem nunca virar um produto fechado apenas para quem pode pagar.</p>
    </section>
    <p>Queremos deixar muito claro: não existe lucro pessoal aqui. Cada real arrecadado vai direto para pagar servidores, integrações e desenvolvimento. E se sobrar algo volta para o próprio app e para a comunidade do plano free. É assim que conseguimos manter o acesso gratuito e, ao mesmo tempo, oferecer ferramentas mais poderosas para quem escolhe contribuir.</p>
  </div>
);

export default WhyWeCharge;
