import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { AlertCircle, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";

interface EncryptionSetupProps {
  model: EncryptionSetupViewModel;
}

export default function EncryptionSetup({ model }: EncryptionSetupProps) {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    handleSkip,
    loading,
    error,
  } = model;
  const LocalLang = Lang.auth.encryptionSetup;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_34%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)/0.55))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 md:p-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="hidden border-border/50 bg-gradient-to-br from-primary/12 via-background to-background p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/80">
                  Golden Unicorn
                </p>
                <h1 className="max-w-md text-4xl font-semibold leading-tight text-foreground">
                  {LocalLang.title}
                </h1>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  {LocalLang.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                {LocalLang.deviceOnly}
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                {LocalLang.noRecovery}
              </div>
            </div>
          </Card>

          <Card className="w-full border-border/50 bg-background/88 p-6 shadow-xl shadow-primary/5 backdrop-blur md:p-8">
            <div className="space-y-6">
              <div className="space-y-3 lg:hidden">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
                  <p className="text-sm text-muted-foreground">{LocalLang.description}</p>
                </div>
              </div>

              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-300" />
                <AlertDescription className="text-amber-100/90">
                  {LocalLang.noRecovery}
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    {LocalLang.createPassword}
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={LocalLang.createPassword}
                      className="bg-background/50 pl-9"
                      autoFocus
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    {LocalLang.confirmPassword}
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={LocalLang.confirmPassword}
                      className="bg-background/50 pl-9"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full"
                    disabled={loading}
                  >
                    {Lang.settings.logout}
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {LocalLang.savePassword}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export interface EncryptionSetupViewModel {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleSkip: () => void;
  loading: boolean;
  error: string | null;
}
