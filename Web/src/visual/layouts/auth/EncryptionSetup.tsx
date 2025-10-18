import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";

interface EncryptionSetupProps {
  model: EncryptionSetupViewModel;
}

export default function EncryptionSetup({ model }: EncryptionSetupProps) {
  const { password, setPassword, confirmPassword, setConfirmPassword, handleSubmit, handleSkip } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-gradient-card border-border/50">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Proteja seus dados</h1>
          <p className="text-muted-foreground">
            Crie uma senha para criptografar seus dados localmente
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta senha é usada apenas para proteger seus dados neste dispositivo.
            Certifique-se de lembrá-la, pois não é possível recuperá-la.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Senha de criptografia
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="bg-background/50"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirme a senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente"
              className="bg-background/50"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
            >
              Sair
            </Button>
            <Button type="submit" className="flex-1">
              Entrar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export interface EncryptionSetupViewModel {
  navigate: (path: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSkip: () => void;
}
