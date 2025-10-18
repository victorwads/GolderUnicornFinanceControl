import { ChevronRight, Check } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";

interface ConnectedAccountsProps {
  model: ConnectedAccountsViewModel;
}

export default function ConnectedAccounts({ model }: ConnectedAccountsProps) {
  const { navigate, connectedAccounts, handleConnect, handleDisconnect } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contas Conectadas</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas contas vinculadas</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Redes Sociais
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              {/* Google Account */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Google</p>
                      {connectedAccounts.google && (
                        <p className="text-xs text-muted-foreground">victor@example.com</p>
                      )}
                    </div>
                  </div>
                  {connectedAccounts.google ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect("google")}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConnect("google")}
                    >
                      Conectar
                    </Button>
                  )}
                </div>
              </div>

              {/* Apple Account */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Apple</p>
                      {connectedAccounts.apple && (
                        <p className="text-xs text-muted-foreground">Conectado</p>
                      )}
                    </div>
                  </div>
                  {connectedAccounts.apple ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect("apple")}
                      >
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConnect("apple")}
                    >
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center text-xs text-muted-foreground p-4">
            <p>Você pode desconectar suas contas a qualquer momento.</p>
            <p className="mt-1">Suas credenciais são armazenadas de forma segura.</p>
          </div>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class ConnectedAccountsRoute {}

export class ToMoreRoute extends ConnectedAccountsRoute {}

export interface ConnectedAccountsViewModel {
  navigate: (route: ConnectedAccountsRoute) => void;
  connectedAccounts: {
    google: boolean;
    apple: boolean;
  };
  handleConnect: (provider: "google" | "apple") => void;
  handleDisconnect: (provider: "google" | "apple") => void;
}
