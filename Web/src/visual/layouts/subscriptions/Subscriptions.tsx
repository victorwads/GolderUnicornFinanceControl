import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TabBar } from "@components/TabBar";
import { MicButton } from "@components/MicButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

const Subscriptions = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "R$0",
      period: "/mês",
      description: "Grátis para sempre. Sync ativo, IA só no setup inicial.",
      badge: null,
      features: [
        "5.000 registros totais",
        "IA no onboarding (1x) ou sua própria chave OpenAI",
        "Sync ativo + devices ilimitados (limite de novos devices por mês)",
      ],
      buttonText: "Começar agora",
      buttonVariant: "outline" as const,
    },
    {
      name: "Basic",
      price: "R$7,90",
      period: "/mês (≈ $1.50)",
      description: "Para começar com IA no dia a dia.",
      badge: "Entrada",
      badgeColor: "bg-warning text-warning-foreground",
      features: [
        "50.000 registros",
        "1M tokens de IA/mês (gerenciados pelo app)",
        "Devices ilimitados + novos devices sem limite prático (monitorado)",
        "Pode usar sua própria chave OpenAI se preferir",
      ],
      buttonText: "Assinar Basic",
      buttonVariant: "default" as const,
    },
    {
      name: "Plus",
      price: "R$14,90",
      period: "/mês (≈ $3.00)",
      description: "Melhor custo‑benefício: assistente fluido.",
      badge: "Mais Popular",
      badgeColor: "bg-primary text-primary-foreground",
      features: [
        "200.000 registros",
        "5M tokens de IA/mês",
        "Devices ilimitados + novos devices sem limite prático",
        "Pode usar sua própria chave OpenAI",
      ],
      buttonText: "Assinar Plus",
      buttonVariant: "default" as const,
      highlighted: true,
    },
    {
      name: "Pro",
      price: "R$29,90",
      period: "/mês (≈ $6.00)",
      description: "Para uso intenso e automações.",
      badge: "Máximo",
      badgeColor: "bg-warning text-warning-foreground",
      features: [
        "1.000.000 de registros",
        "10M tokens de IA/mês",
        "Devices ilimitados + novos devices sem limite prático",
        "Pode usar sua própria chave OpenAI",
      ],
      buttonText: "Assinar Pro",
      buttonVariant: "default" as const,
    },
  ];

  const comparisonData = [
    {
      feature: "Sync na nuvem",
      free: true,
      basic: true,
      plus: true,
      pro: true,
    },
    {
      feature: "Devices conectados ilimitados",
      free: true,
      basic: true,
      plus: true,
      pro: true,
    },
    {
      feature: "Novos devices (full first sync)",
      free: "5 vitalício",
      basic: "Sem limite prático (monitorado)",
      plus: "Sem limite prático",
      pro: "Sem limite prático",
    },
    {
      feature: "Limite de registros",
      free: "5.000",
      basic: "50.000",
      plus: "200.000",
      pro: "1.000.000",
    },
    {
      feature: "IA incluída (tokens/mês)",
      free: "Somente no onboarding (1x)",
      basic: "1M",
      plus: "5M",
      pro: "10M",
    },
    {
      feature: "Onboarding com IA (voz/texto)",
      free: "✓ (1x)",
      basic: true,
      plus: true,
      pro: true,
    },
    {
      feature: "Usar a própria chave OpenAI (opcional)",
      free: true,
      basic: true,
      plus: true,
      pro: true,
    },
    {
      feature: "Exportar/Importar dados",
      free: true,
      basic: true,
      plus: true,
      pro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-6xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <h1 className="text-2xl font-bold text-foreground">Planos e Assinaturas</h1>
          <p className="text-sm text-muted-foreground">Escolha o melhor plano para você</p>
        </header>

        <div className="p-4 space-y-8 animate-fade-in">
          {/* Plans Grid - Vertical Scroll on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden border-border/50 transition-all hover:shadow-lg ${
                  plan.highlighted ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className={`${plan.badgeColor} text-center py-2 px-4 text-xs font-semibold`}>
                      {plan.badge}
                    </div>
                  </div>
                )}
                <CardHeader className={plan.badge ? "pt-12" : "pt-6"}>
                  <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-foreground">{plan.price}</div>
                    <div className="text-sm text-muted-foreground">{plan.period}</div>
                  </div>
                  <CardDescription className="text-center text-sm min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.buttonVariant} className="w-full">
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card className="overflow-hidden border-border/50">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-1/3 font-semibold text-foreground">Recurso</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Free</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Basic</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Plus</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Pro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                      <TableCell className="text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check className="h-4 w-4 mx-auto text-success" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.free}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof row.basic === "boolean" ? (
                          row.basic ? (
                            <Check className="h-4 w-4 mx-auto text-success" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.basic}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof row.plus === "boolean" ? (
                          row.plus ? (
                            <Check className="h-4 w-4 mx-auto text-success" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.plus}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="h-4 w-4 mx-auto text-success" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.pro}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Footer Text */}
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              Cobramos valores acessíveis para cobrir Firebase (leituras/escritas/armazenamento) e IA
              (tokens por uso). Assinantes pagos subsidiam o plano Free. Você pode usar sua própria
              chave OpenAI em qualquer plano.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="link"
                className="text-primary"
                onClick={() => navigate("/subscriptions/why")}
              >
                Por que cobramos?
              </Button>
              <span className="text-muted-foreground">·</span>
              <Button
                variant="link"
                className="text-primary"
                onClick={() => navigate("/subscriptions/why/costs")}
              >
                Detalhes dos custos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <TabBar />
      <MicButton />
    </div>
  );
};

export default Subscriptions;
