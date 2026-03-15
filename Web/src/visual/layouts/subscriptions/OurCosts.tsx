import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OurCosts = () => {
  const navigate = useNavigate();

  const costItems = [
    {
      title: "Servidores & Banco de Dados",
      description: "Hospedagem, escalabilidade e armazenamento de dados de usuários.",
      cost: "~R$ X.000 / mês",
    },
    {
      title: "Integrações e APIs",
      description: "Conexões com bancos, cartões e serviços financeiros.",
      cost: "cobrado por volume de requisições",
    },
    {
      title: "Inteligência Artificial",
      description: "Cada chamada à IA gera custo por token (60% entrada / 40% saída).",
      cost: "~R$ 0,02 a R$ 0,10 por 1.000 tokens",
    },
    {
      title: "Firebase (infraestrutura)",
      description: "Autenticação, Firestore, Storage e notificações em tempo real.",
      cost: "~R$ Y por cada 100k de leituras/gravações",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/subscriptions/why")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Custos Explicados</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-11">
          100% de transparência sobre nossos custos
        </p>
      </header>

      <div className="p-4 space-y-6 animate-fade-in">
        {/* Intro */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground leading-relaxed">
              Queremos ser 100% transparentes sobre como utilizamos o dinheiro das assinaturas. A
              assinatura não é sobre lucro — é sobre manter o projeto funcionando e garantir que
              todos possam ter acesso a ferramentas de educação financeira.
            </p>
          </CardContent>
        </Card>

        {/* Custos já investidos */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">💰 Custos já investidos no desenvolvimento</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">
                Antes mesmo de o app gerar qualquer retorno, já houve investimento real — tanto financeiro quanto pessoal.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                O <strong>Golden Unicorn Finance Control</strong> tem sido desenvolvido inteiramente nas minhas horas vagas, nos finais de semana, nos momentos que normalmente eu estaria descansando ou com a minha família.
                É um projeto movido por empolgação, propósito e vontade de criar algo acessível, mas que já trouxe custos concretos:
              </p>

              <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                <p className="text-sm text-foreground">
                  <strong>Firebase:</strong> cerca de R$20 (~US$4) em testes e armazenamento inicial.
                </p>
                <p className="text-sm text-foreground">
                  <strong>OpenAI API:</strong> aproximadamente US$30 (~R$160) em chamadas de IA para validação e prototipagem.
                </p>
                <p className="text-sm text-foreground">
                  <strong>GitHub (recursos premium):</strong> US$30 (~R$160) em automações e pipelines privados.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Codex / ferramentas de IA para desenvolvimento:</strong> US$50 (~R$270) para acelerar a criação de código e componentes.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Design e infraestrutura de layout:</strong> mais US$25 (~R$135) investidos em ferramentas de IA para UI/UX.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Pesquisas e testes com pessoas reais:</strong> cerca de R$150 (~US$30) pagos a usuários para testar, dar feedback e ajudar a validar ideias.
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Além disso, há um custo intangível — o <strong>tempo e esforço de amigos</strong> que contribuíram com ideias, testes, discussões sobre criptografia, segurança e privacidade.
                Se fosse quantificado, esse apoio voluntário equivaleria facilmente a milhares de reais em consultoria técnica.
              </p>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground leading-relaxed">
                    Em resumo, mesmo sem nenhuma receita até agora, o projeto já consumiu aproximadamente <strong>US$135 (~R$750)</strong> em apenas dois meses.
                    Pode parecer pouco, mas isso é o início — à medida que o aplicativo cresce e mais usuários chegam, esses custos aumentam significativamente.
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mt-3">
                    Por isso, o apoio dos assinantes pagos será essencial não apenas para sustentar o futuro do app, mas também para cobrir o investimento pessoal que já tornou tudo isso possível.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>

        {/* Cost Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {costItems.map((item, index) => (
            <Card key={index} className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-lg font-bold text-primary">{item.cost}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <Card className="border-warning/50 bg-gradient-to-br from-card to-warning/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              * Valores variam conforme o volume de usuários, uso de IA e tráfego nos servidores.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="link"
                className="text-primary p-0 h-auto inline-flex items-center gap-1"
                onClick={() => window.open("https://firebase.google.com/pricing", "_blank")}
              >
                👉 Firebase Pricing
                <ExternalLink className="h-3 w-3" />
              </Button>
              <span className="text-muted-foreground">|</span>
              <Button
                variant="link"
                className="text-primary p-0 h-auto inline-flex items-center gap-1"
                onClick={() => window.open("https://openai.com/pricing", "_blank")}
              >
                OpenAI Pricing
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trabalho Independente */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Trabalho Independente & Comunidade</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Este projeto é desenvolvido de forma <strong>independente</strong> — minha alma,
                tempo livre e energia estão investidos aqui. Não há uma equipe por trás: sou apenas
                eu, um desenvolvedor que acredita que controle financeiro acessível pode mudar vidas.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Por isso, duas áreas que normalmente seriam listadas como custos ("Desenvolvimento &
                Manutenção" e "Suporte & Comunidade") não aparecem como valores monetários, mas sim
                como esforço pessoal e paixão.
              </p>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-foreground">
                    ✨ Se você é <strong>designer</strong> ou tem experiência em{" "}
                    <strong>UX (Experiência do Usuário)</strong>, sua ajuda seria incrivelmente
                    bem-vinda. Queremos tornar o app mais simples e acessível para pessoas com
                    limitações de visão, motoras ou intelectuais.
                  </p>
                  <p className="text-sm text-foreground">
                    📩 Se quiser colaborar, entre em contato no Telegram:{" "}
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto font-semibold"
                      onClick={() => window.open("https://t.me/victorwads", "_blank")}
                    >
                      @victorwads
                    </Button>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>

        {/* Como isso afeta os planos */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Como isso afeta os planos</h2>
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong className="text-foreground">Plano Free:</strong>{" "}
                  <span className="text-muted-foreground">
                    custeado pelos assinantes, com limites para manter o uso viável.
                  </span>
                </p>
                <p className="text-sm">
                  <strong className="text-foreground">Plano Basic:</strong>{" "}
                  <span className="text-muted-foreground">
                    cobre parte dos custos de IA, libera mais registros e relatórios avançados.
                  </span>
                </p>
                <p className="text-sm">
                  <strong className="text-foreground">Plano Plus:</strong>{" "}
                  <span className="text-muted-foreground">
                    melhor custo‑benefício: assistente fluido.
                  </span>
                </p>
                <p className="text-sm">
                  <strong className="text-foreground">Plano Pro:</strong>{" "}
                  <span className="text-muted-foreground">
                    financia integrações extras, maior limite de registros e acesso prioritário a
                    novos recursos.
                  </span>
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pt-4">
                Em resumo: quanto mais avançado o plano, mais custos diretos ele cobre — e, ao mesmo
                tempo, mantém o plano Free vivo para quem precisa.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Reinvestindo em Todos */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Reinvestindo em Todos</h2>
          <Card className="border-success/50 bg-gradient-to-br from-card to-success/5">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground leading-relaxed">
                Nenhum valor é retirado como lucro pessoal. Cada real arrecadado vai para pagar os
                custos de servidores, Firebase e IA, garantir que o plano Free continue existindo e
                trazer novos recursos e melhorias para todos.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default OurCosts;
