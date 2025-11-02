import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { ArrowLeft, AlertCircle, FileJson, FileSpreadsheet, FileText, ShieldCheck, Download, Trash2 } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { DataProgress } from "@components/DataProgress";
import type { DataProgressInfo } from "@components/DataProgress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";

interface PrivacyProps {
  model: PrivacyViewModel;
}

export default function Privacy({ model }: PrivacyProps) {
  const { 
    navigate, 
    exportProgress, 
    handleExport,
  } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacidade e Segurança</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus dados e privacidade</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Seção 1: Exportar e Excluir Dados */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle>Seus Dados</CardTitle>
              </div>
              <CardDescription>
                Exporte ou exclua seus dados financeiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-16"
                  onClick={() => handleExport('json')}
                  disabled={!!exportProgress}
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
                  disabled={!!exportProgress}
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

          {/* Seção 2: Links para Termos */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Políticas e Termos</CardTitle>
              </div>
              <CardDescription>
                Saiba mais sobre como protegemos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={() => navigate("/privacy/terms")}
              >
                <FileText className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Termos de Uso</p>
                  <p className="text-xs text-muted-foreground">Regras e condições de uso do aplicativo</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={() => navigate("/privacy/policy")}
              >
                <ShieldCheck className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Política de Privacidade</p>
                  <p className="text-xs text-muted-foreground">Como coletamos e protegemos seus dados</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Excluir Conta */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Gerenciar Conta</CardTitle>
              <CardDescription>
                Ações relacionadas à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => navigate("/me/privacy/delete")}
                disabled={!!exportProgress}
              >
                <Trash2 className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Excluir minha conta</p>
                  <p className="text-xs text-muted-foreground">Remover permanentemente todos os seus dados</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <DataProgress progress={exportProgress} type="export" />

      <MicButton />
      <TabBar />
    </div>
  );
}

export interface PrivacyViewModel {
  navigate: (path: string) => void;
  exportProgress: DataProgressInfo | null;
  handleExport: (format: 'json' | 'csv') => void;
}
