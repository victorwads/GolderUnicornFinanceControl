import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] overflow-y-auto overscroll-contain bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Termos de Uso</h1>
              <p className="text-sm text-muted-foreground">Última atualização: Janeiro 2025</p>
            </div>
          </div>
        </header>

        <div className="p-4 pb-8 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Ao utilizar este aplicativo de finanças pessoais, você concorda com estes termos de uso.
                Se você não concordar com qualquer parte destes termos, não deve utilizar o aplicativo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>2. Uso do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p className="text-muted-foreground">
                Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Fornecer informações precisas e completas</li>
                <li>Manter suas informações de conta atualizadas</li>
                <li>Não compartilhar suas credenciais com terceiros</li>
                <li>Notificar imediatamente sobre uso não autorizado</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>3. Propriedade de Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Todos os dados financeiros inseridos por você permanecem de sua propriedade.
                Você pode exportar ou excluir seus dados a qualquer momento através das configurações de privacidade.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>4. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                O aplicativo é fornecido "como está". Não nos responsabilizamos por decisões financeiras
                tomadas com base nas informações do aplicativo. Este não é um serviço de consultoria financeira.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
