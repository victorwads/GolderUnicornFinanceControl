import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

interface EncryptionUnlockProps {
  model: EncryptionUnlockViewModel;
}

export default function EncryptionUnlock({ model }: EncryptionUnlockProps) {
  const { password, setPassword, handleSubmit, handleLogout } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-gradient-card border-border/50">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Insira sua senha de criptografia</h1>
        </div>

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

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
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

export interface EncryptionUnlockViewModel {
  navigate: (path: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleLogout: () => void;
}
