import { ArrowLeft, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";

interface ExportDataProps {
  model: ExportDataViewModel;
}

export default function ExportData({ model }: ExportDataProps) {
  const { navigate, handleExport } = model;

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
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Exportar Dados</h1>
              <p className="text-sm text-muted-foreground">Faça download dos seus dados</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Seus Dados</CardTitle>
              <CardDescription>
                Você pode exportar todos os seus dados financeiros em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-16"
                  onClick={() => handleExport('json')}
                >
                  <FileJson className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Exportar como JSON</p>
                    <p className="text-xs text-muted-foreground">Formato completo com todos os dados</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-16"
                  onClick={() => handleExport('csv')}
                >
                  <FileSpreadsheet className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Exportar como CSV</p>
                    <p className="text-xs text-muted-foreground">Compatível com Excel e planilhas</p>
                  </div>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Os dados exportados incluem todas as suas transações, contas, cartões e categorias.
                  Seus dados são seus e você pode exportá-los a qualquer momento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class ExportDataRoute {}

export class ToMoreRoute extends ExportDataRoute {}

export interface ExportDataViewModel {
  navigate: (route: ExportDataRoute) => void;
  handleExport: (format: 'json' | 'csv') => void;
}
