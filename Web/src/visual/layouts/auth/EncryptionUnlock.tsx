import { useRef } from "react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { AlertCircle, FileKey2, KeyRound, Loader2, LockKeyhole } from "lucide-react";

interface EncryptionUnlockProps {
  model: EncryptionUnlockViewModel;
}

export default function EncryptionUnlock({ model }: EncryptionUnlockProps) {
  const recoveryInputRef = useRef<HTMLInputElement | null>(null);
  const {
    mode,
    password,
    setPassword,
    recoveryFileName,
    recoveryExampleFileName,
    openRecovery,
    closeRecovery,
    handleRecoveryFile,
    handleSubmit,
    handleLogout,
    loading,
    error,
  } = model;
  const LocalLang = Lang.auth.encryptionUnlock;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_34%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--muted)/0.55))]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 md:p-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.92fr]">
          <Card className="hidden border-border/50 bg-gradient-to-br from-primary/12 via-background to-background p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                <LockKeyhole className="h-6 w-6" />
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

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
              {LocalLang.helper}
            </div>
          </Card>

          <Card className="w-full border-border/50 bg-background/88 p-6 shadow-xl shadow-primary/5 backdrop-blur md:p-8">
            <div className="space-y-6">
              <div className="space-y-3 lg:hidden">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
                  <p className="text-sm text-muted-foreground">{LocalLang.description}</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "password" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        {LocalLang.password}
                      </Label>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={LocalLang.password}
                          className="bg-background/50 pl-9"
                          autoFocus
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="link"
                      className="h-auto px-0 text-sm text-muted-foreground"
                      onClick={openRecovery}
                      disabled={loading}
                    >
                      {LocalLang.forgotPassword}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/35 p-4">
                    <div className="space-y-2">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <FileKey2 className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {LocalLang.recoveryTitle}
                      </h2>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {LocalLang.recoveryDescription}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {LocalLang.recoveryWarning}
                      </p>
                      <p className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        {LocalLang.recoveryLoggedInHint}
                      </p>
                      <p className="rounded-xl border border-dashed border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                        {LocalLang.recoveryFileExample(recoveryExampleFileName)}
                      </p>
                    </div>

                    <input
                      ref={recoveryInputRef}
                      id="recovery-file"
                      className="hidden"
                      type="file"
                      accept="text/plain,.txt"
                      disabled={loading}
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        void handleRecoveryFile(file);
                        event.target.value = "";
                      }}
                    />
                    {recoveryFileName && (
                      <p className="text-xs text-muted-foreground">
                        {LocalLang.recoveryFileSelected(recoveryFileName)}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  {mode === "password" ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full"
                        disabled={loading}
                      >
                        {Lang.settings.logout}
                      </Button>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {LocalLang.unlock}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={closeRecovery}
                        className="w-full"
                        disabled={loading}
                      >
                        {LocalLang.backToPassword}
                      </Button>
                      <Button
                        type="button"
                        className="w-full"
                        disabled={loading}
                        onClick={() => recoveryInputRef.current?.click()}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {Lang.commons.uploadFile}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export interface EncryptionUnlockViewModel {
  mode: "password" | "recovery";
  password: string;
  setPassword: (value: string) => void;
  recoveryFileName: string | null;
  recoveryExampleFileName: string;
  openRecovery: () => void;
  closeRecovery: () => void;
  handleRecoveryFile: (file?: File | null) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  handleLogout: () => void;
  loading: boolean;
  error: string | null;
}
