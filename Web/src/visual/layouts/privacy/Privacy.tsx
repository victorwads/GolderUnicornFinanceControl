import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { ArrowLeft, FileJson, FileSpreadsheet, FileText, ShieldCheck, Download, Trash2 } from "lucide-react";
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
    progress,
    progressType,
    handleExport,
    showDeleteDataDialog,
    setShowDeleteDataDialog,
    deleteDataPhrase,
    deleteDataConfirmation,
    setDeleteDataConfirmation,
    openDeleteDataDialog,
    confirmDeleteData,
  } = model;

  return (
    <div className="min-h-full bg-background">
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
                  disabled={!!progress}
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
                  disabled={!!progress}
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

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Excluir meus dados</CardTitle>
              <CardDescription>
                Apaga seus dados financeiros mantendo a autenticação como conta ativa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={openDeleteDataDialog}
                disabled={!!progress}
              >
                <Trash2 className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Excluir apenas meus dados</p>
                  <p className="text-xs text-muted-foreground">
                    Faz backup automático antes de limpar seus dados locais e remotos.
                  </p>
                </div>
              </Button>
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
                disabled={!!progress}
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

      <DataProgress progress={progress} type={progressType} />

      <AlertDialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir apenas os seus dados</AlertDialogTitle>
            <AlertDialogDescription>
              Seus dados serão exportados antes da exclusão. Para continuar, digite a frase abaixo exatamente como aparece.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-mono text-foreground">
              {deleteDataPhrase}
            </div>
            <Input
              value={deleteDataConfirmation}
              onChange={(event) => setDeleteDataConfirmation(event.target.value)}
              placeholder="Digite a frase de confirmação"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir meus dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export interface PrivacyViewModel {
  navigate: (path: string) => void;
  progress: DataProgressInfo | null;
  progressType: "export" | "delete";
  handleExport: (format: 'json' | 'csv') => void;
  showDeleteDataDialog: boolean;
  setShowDeleteDataDialog: (open: boolean) => void;
  deleteDataPhrase: string;
  deleteDataConfirmation: string;
  setDeleteDataConfirmation: (value: string) => void;
  openDeleteDataDialog: () => void;
  confirmDeleteData: () => void;
}
