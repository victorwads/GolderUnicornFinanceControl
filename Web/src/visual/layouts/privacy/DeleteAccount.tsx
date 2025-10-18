import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
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

interface DeleteAccountProps {
  model: DeleteAccountViewModel;
}

export default function DeleteAccount({ model }: DeleteAccountProps) {
  const { navigate, confirmText, setConfirmText, showDialog, setShowDialog, handleDelete, confirmDelete } = model;

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
              <h1 className="text-2xl font-bold text-foreground">Excluir Conta</h1>
              <p className="text-sm text-muted-foreground">Remova permanentemente sua conta</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              </div>
              <CardDescription>
                Esta ação é irreversível. Por favor, tenha certeza antes de prosseguir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">O que será excluído:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Todas as suas transações financeiras</li>
                  <li>Contas bancárias e cartões de crédito cadastrados</li>
                  <li>Categorias personalizadas</li>
                  <li>Configurações e preferências</li>
                  <li>Dados de sincronização na nuvem</li>
                </ul>
              </div>

              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Para confirmar, digite <span className="font-mono font-bold text-foreground">EXCLUIR</span> no campo abaixo:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite EXCLUIR"
                  className="mb-3"
                />
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={confirmText !== "EXCLUIR"}
                >
                  Excluir Conta Permanentemente
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos de nossos servidores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.
              Você não poderá recuperar suas informações financeiras após a exclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class DeleteAccountRoute {}

export class ToMoreRoute extends DeleteAccountRoute {}

export interface DeleteAccountViewModel {
  navigate: (route: DeleteAccountRoute) => void;
  confirmText: string;
  setConfirmText: (text: string) => void;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  handleDelete: () => void;
  confirmDelete: () => void;
}
