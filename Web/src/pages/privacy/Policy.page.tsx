import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useNavigate } from "react-router-dom";

export default function PolicyPage() {
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
              <h1 className="text-2xl font-bold text-foreground">Política de Privacidade</h1>
              <p className="text-sm text-muted-foreground">Última atualização: Janeiro 2025</p>
            </div>
          </div>
        </header>

        <div className="p-4 pb-8 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>1. Informações que Coletamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p className="text-muted-foreground">
                Coletamos as seguintes informações para fornecer nossos serviços:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Informações de conta (email, nome)</li>
                <li>Dados financeiros inseridos por você (transações, contas, categorias)</li>
                <li>Informações de uso do aplicativo</li>
                <li>Dados de dispositivo e navegador</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>2. Como Usamos Suas Informações</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p className="text-muted-foreground">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência</li>
                <li>Processar suas transações e solicitações</li>
                <li>Enviar notificações importantes sobre o serviço</li>
                <li>Garantir a segurança da plataforma</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>3. Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados,
                incluindo criptografia de dados em trânsito e em repouso, autenticação segura,
                e controles de acesso rigorosos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>4. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing.
                Compartilhamos dados apenas quando necessário para fornecer nossos serviços ou quando exigido por lei.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>5. Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3">
              <p className="text-muted-foreground">
                Você tem o direito de:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Exportar seus dados em formato legível</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Retirar consentimento para processamento de dados</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
