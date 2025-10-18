import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";

interface LoginProps {
  model: LoginViewModel;
}

export default function Login({ model }: LoginProps) {
  const { handleGoogleLogin, handleAppleLogin } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-gradient-card border-border/50">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo</h1>
          <p className="text-muted-foreground">
            Faça login para continuar
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          <Button
            onClick={handleAppleLogin}
            className="w-full h-12"
            variant="outline"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continuar com Apple
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Ao continuar, você concorda com nossos</p>
          <div className="flex gap-2 justify-center mt-1">
            <a href="#" className="underline hover:text-foreground">
              Termos de Serviço
            </a>
            <span>e</span>
            <a href="#" className="underline hover:text-foreground">
              Política de Privacidade
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

export interface LoginViewModel {
  navigate: (path: string) => void;
  handleGoogleLogin: () => void;
  handleAppleLogin: () => void;
}
