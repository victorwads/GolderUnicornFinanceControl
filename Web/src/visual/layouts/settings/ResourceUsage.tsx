import { ArrowLeft, Activity, Zap, MessageSquare, BarChart3 } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";

interface ResourceUsageProps {
  model: ResourceUsageViewModel;
}

export default function ResourceUsage({ model }: ResourceUsageProps) {
  const { navigate, aiModels } = model;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Resources Usages</h1>
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Monitore o uso de recursos do app</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Consumo mensal de IA */}
          <Card className="p-5 border-border/50 bg-gradient-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Consumo mensal de IA</h3>
                <span className="text-sm font-medium text-foreground">R$ 1,90 de R$ 5,00</span>
              </div>
              <Progress value={38} className="h-2" />
            </div>
          </Card>

          {/* Database */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Database</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local DB */}
              <Card className="p-5 border-border/50 bg-card/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Local</h4>
                    <Badge variant="outline" className="text-xs">DB</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Reads</p>
                      <p className="text-lg font-bold text-foreground">13753</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Writes</p>
                      <p className="text-lg font-bold text-foreground">1583</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Query Reads</p>
                      <p className="text-lg font-bold text-foreground">800</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Remote DB */}
              <Card className="p-5 border-border/50 bg-card/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Remote</h4>
                    <Badge variant="outline" className="text-xs">DB</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Reads</p>
                      <p className="text-lg font-bold text-foreground">743</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Writes</p>
                      <p className="text-lg font-bold text-foreground">1583</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Query Reads</p>
                      <p className="text-lg font-bold text-foreground">437</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* AI Models */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">AI Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiModels.map((model, index) => (
                <Card key={index} className="p-4 border-border/50 bg-card/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {model.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">IA</Badge>
                    </div>
                    <div className="space-y-2">
                      {model.requests !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">Requests</p>
                          <p className="text-lg font-bold text-foreground">{model.requests}</p>
                        </div>
                      )}
                      {model.tokensIn !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">Tokens In</p>
                          <p className="text-lg font-bold text-foreground">{model.tokensIn.toLocaleString()}</p>
                        </div>
                      )}
                      {model.tokensOut !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">Tokens Out</p>
                          <p className="text-lg font-bold text-foreground">{model.tokensOut.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="p-5 border-border/50 bg-gradient-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                  <p className="text-xl font-bold text-foreground">162</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tokens Input</p>
                  <p className="text-xl font-bold text-foreground">816,378</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tokens Output</p>
                  <p className="text-xl font-bold text-foreground">7,556</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  <p className="text-xl font-bold text-primary">R$ 1,868</p>
                </div>
              </div>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(new ToMoreRoute())}
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}

// Navigation Routes
export class ResourceUsageRoute {}

export class ToMoreRoute extends ResourceUsageRoute {}

export interface AIModel {
  name: string;
  requests: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
}

export interface ResourceUsageViewModel {
  navigate: (route: ResourceUsageRoute) => void;
  aiModels: AIModel[];
}
