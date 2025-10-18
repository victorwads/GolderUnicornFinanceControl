import { ChevronRight, User, Lock, HelpCircle, Info, Wallet, CreditCard, Receipt, Calendar, Settings as SettingsIcon, FileText, Download, Trash2, Link2, Repeat, Sparkles, LogOut } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { Card } from "@components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { Button } from "@components/ui/button";

interface MoreProps {
  model: MoreViewModel;
}

export default function More({ model }: MoreProps) {
  const { navigate, handleLogout } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <h1 className="text-2xl font-bold text-foreground">More</h1>
          <p className="text-sm text-muted-foreground">Suas informações e gerenciamento</p>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="flex items-center gap-4 p-5 bg-gradient-card border-border/50">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Victor Silva</h2>
              <p className="text-sm text-muted-foreground">victor@example.com</p>
              <p className="text-xs text-muted-foreground/50 mt-1">My id: fUztrRAGqQZ3lzT5AmvIki5x0443</p>
            </div>
          </Card>

          {/* Gestão Financeira */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Gestão Financeira
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToCategoriesRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Categorias</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToAccountsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Contas</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToCreditCardsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Cartões de Crédito</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToRecurrentsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Gastos e Entradas Recorrentes</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Conta / Meus Dados */}

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Conta / Meus Dados
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToResourceUsageRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Ver uso de recursos</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToConnectedAccountsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Contas Conectadas</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <Accordion type="single" collapsible className="border-0">
                <AccordionItem value="privacy" className="border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Privacidade e Segurança</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12"
                      onClick={() => navigate(new ToPrivacyExportRoute())}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar meus dados
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-destructive hover:text-destructive"
                      onClick={() => navigate(new ToPrivacyDeleteAccountRoute())}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir minha conta
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          {/* Suporte */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Suporte
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Central de Ajuda</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Configurações */}
          <div className="space-y-3">
            <Card className="border-border/50 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToSettingsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Configurações</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Sobre o App */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sobre o App
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs"
              >
                Buscar atualizações
              </Button>
            </div>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Versão</p>
                    <p className="text-xs text-muted-foreground">1.0.0 (Build 100)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Dev */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Dev
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToSubscriptionsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Subscrições</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToOnboardingThemeRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Repeat className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Refazer Onboarding</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Logout */}
          <div className="pb-4">
            <Button
              variant="outline"
              className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Deslogar
            </Button>
          </div>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class MoreRoute {}

export class ToCategoriesRoute extends MoreRoute {}
export class ToAccountsRoute extends MoreRoute {}
export class ToCreditCardsRoute extends MoreRoute {}
export class ToRecurrentsRoute extends MoreRoute {}
export class ToResourceUsageRoute extends MoreRoute {}
export class ToConnectedAccountsRoute extends MoreRoute {}
export class ToPrivacyExportRoute extends MoreRoute {}
export class ToPrivacyDeleteAccountRoute extends MoreRoute {}
export class ToSettingsRoute extends MoreRoute {}
export class ToSubscriptionsRoute extends MoreRoute {}
export class ToOnboardingThemeRoute extends MoreRoute {}

export interface MoreViewModel {
  navigate: (route: MoreRoute) => void;
  handleLogout: () => void;
}
