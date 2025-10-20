import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TabBar } from "@components/TabBar";
import { MicButton } from "@components/MicButton";

const WhyCharge = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/subscriptions")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Por que cobramos?</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Entenda nossa filosofia de precificação
          </p>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Resumo */}
          <Card className="border-primary/50 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Resumindo:</strong> a assinatura não é sobre lucro. Nós cobramos apenas o
                valor mínimo necessário para manter o projeto vivo. Qualquer sobra será totalmente
                reinvestida no próprio app — seja para criar novas funcionalidades para quem paga,
                seja para garantir que quem não pode pagar ainda consiga usar gratuitamente para
                organizar suas finanças possivelmente melhorando sua qualidade de vida.
              </p>
            </CardContent>
          </Card>

          {/* Seção 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Seção 1 – Introdução Honesta</h2>
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Acreditamos que educação financeira precisa ser acessível. Por isso, o nosso plano
                  Free é gratuito para sempre. Mas gratuito não significa sem limites: nós custeamos
                  a infraestrutura essencial para que qualquer pessoa consiga organizar seus fluxos
                  financeiros de forma simples e viável. Esse plano cobre o básico, sem custo para o
                  usuário, mas com algumas restrições que garantem que possamos manter o serviço sem
                  inviabilizar o projeto.
                </p>

                <div className="pl-4 border-l-2 border-primary/50 space-y-2">
                  <p className="text-sm font-medium text-foreground">No plano Free, você terá:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Limite de registros, para evitar custos excessivos com banco de dados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Uso de Inteligência Artificial apenas na abertura de contas, já que cada
                        requisição de IA tem um custo bem alto!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Recursos básicos de controle financeiro.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fazemos isso porque não temos dinheiro infinito. Nosso objetivo é oferecer o máximo
                  viável de graça, dentro do que conseguimos sustentar, para que mesmo quem não tem
                  como pagar tenha condições de melhorar a sua vida financeira.
                </p>

                <Button
                  variant="link"
                  className="text-primary p-0 h-auto"
                  onClick={() => navigate("/subscriptions/why/costs")}
                >
                  Para mais detalhes dos nossos custos acesse aqui.
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Seção 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Seção 2 – Por que existem planos pagos</h2>
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Com os planos Basic, Plus e Pro, conseguimos:
                </p>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Financiar a infraestrutura que mantém o app funcionando</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Investir em novas funcionalidades e melhorias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Garantir estabilidade e segurança</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Permitir que o plano Free continue existindo para quem precisa</span>
                  </li>
                </ul>

                <Button
                  variant="link"
                  className="text-primary p-0 h-auto"
                  onClick={() => navigate("/subscriptions/why/costs")}
                >
                  Para mais detalhes dos nossos custos acesse aqui.
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Seção 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Seção 3 – Nossos Custos</h2>
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Manter o aplicativo envolve custos reais, que crescem a cada novo usuário:
                </p>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Servidores e banco de dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>APIs e integrações (bancos, cartões, pagamentos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Custos com Inteligência Artificial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Desenvolvimento contínuo e manutenção</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Suporte e recursos para a comunidade</span>
                  </li>
                </ul>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Esses custos não param de crescer, e precisamos garantir que o projeto seja
                  sustentável no longo prazo.
                </p>

                <Button
                  variant="link"
                  className="text-primary p-0 h-auto"
                  onClick={() => navigate("/subscriptions/why/costs")}
                >
                  Para mais detalhes dos nossos custos acesse aqui.
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Seção 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Seção 4 – Com sua assinatura você ajuda!
            </h2>
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quando você assina, você não está apenas destravando funcionalidades extras. Você
                  está financiando o acesso à educação financeira para milhares de pessoas no Brasil.
                  O seu apoio garante que o projeto continue disponível e evoluindo, sem nunca virar
                  um produto fechado apenas para quem pode pagar.
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Queremos deixar muito claro: não existe lucro pessoal aqui. Cada real arrecadado vai
                  direto para pagar servidores, integrações e desenvolvimento. E se sobrar algo volta
                  para o próprio app e para a comunidade do plano Free. É assim que conseguimos manter
                  o acesso gratuito e, ao mesmo tempo, oferecer ferramentas mais poderosas para quem
                  escolhe contribuir.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <TabBar />
      <MicButton />
    </div>
  );
};

export default WhyCharge;
