import { useRef, useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { ArrowLeft, FileText, ShieldCheck, Download, Trash2, Upload, AlertCircle, CheckCircle2, Lock, UserCog, KeyRound } from "lucide-react";
import { DataProgress } from "@components/DataProgress";
import type { DataProgressInfo } from "@components/DataProgress";
import type { ExportUserDataResult, ImportUserDataResult } from "@features/settings/settingsActions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
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
  const LocalLang = Lang.visual.privacy;
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [exportExpanded, setExportExpanded] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [exportPasswordEnabled, setExportPasswordEnabled] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const { 
    navigate, 
    progress,
    progressType,
    lastImportResult,
    lastExportResult,
    handleExport,
    handleImportFiles,
    handleDownloadEncryptionKey,
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
              <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
              <p className="text-sm text-muted-foreground">{LocalLang.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>{LocalLang.policiesTitle}</CardTitle>
              </div>
              <CardDescription>
                {LocalLang.policiesDescription}
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
                  <p className="font-medium">{LocalLang.terms}</p>
                  <p className="text-xs text-muted-foreground">{LocalLang.termsDescription}</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={() => navigate("/privacy/policy")}
              >
                <ShieldCheck className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">{LocalLang.policy}</p>
                  <p className="text-xs text-muted-foreground">{LocalLang.policyDescription}</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle>{LocalLang.dataTitle}</CardTitle>
              </div>
              <CardDescription>
                {LocalLang.dataDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="secondary"
                className="w-full justify-start h-14"
                onClick={() => importInputRef.current?.click()}
                disabled={!!progress}
              >
                <Upload className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">{LocalLang.importJsonTitle}</p>
                  <p className="text-xs text-muted-foreground">{LocalLang.importJsonDescription}</p>
                </div>
              </Button>

              <Accordion
                type="single"
                collapsible
                value={exportExpanded ? "export" : ""}
                onValueChange={(value) => setExportExpanded(value === "export")}
                className="rounded-lg border border-border"
              >
                <AccordionItem value="export" className="border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <Download className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{LocalLang.exportActionTitle}</p>
                        <p className="text-xs text-muted-foreground">{LocalLang.exportActionDescription}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{LocalLang.exportFormatTitle}</p>
                        <RadioGroup
                          value={exportFormat}
                          onValueChange={(value) => {
                            const nextValue = value as "json" | "csv";
                            setExportFormat(nextValue);
                          }}
                          className="flex flex-wrap gap-2"
                        >
                          <label
                            htmlFor="privacy-export-json"
                            className="flex min-w-[220px] flex-1 items-start gap-3 rounded-lg border border-border px-3 py-3 cursor-pointer"
                          >
                            <RadioGroupItem value="json" id="privacy-export-json" className="mt-1" />
                            <div>
                              <p className="text-sm font-medium">{LocalLang.exportJsonTitle}</p>
                              <p className="text-xs text-muted-foreground">{LocalLang.exportJsonDescription}</p>
                            </div>
                          </label>

                          <label
                            htmlFor="privacy-export-csv"
                            className="flex min-w-[220px] flex-1 items-start gap-3 rounded-lg border border-border px-3 py-3 cursor-pointer"
                          >
                            <RadioGroupItem value="csv" id="privacy-export-csv" className="mt-1" />
                            <div>
                              <p className="text-sm font-medium">{LocalLang.exportCsvTitle}</p>
                              <p className="text-xs text-muted-foreground">{LocalLang.exportCsvDescription}</p>
                            </div>
                          </label>
                        </RadioGroup>
                      </div>

                      <div className="rounded-lg bg-muted/40 px-3 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="pr-4">
                            <Label htmlFor="privacy-export-password-toggle" className="text-sm font-medium">
                              <span className="inline-flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {LocalLang.exportPasswordToggleTitle}
                              </span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {LocalLang.exportPasswordToggleDescription}
                            </p>
                          </div>
                          <Switch
                            id="privacy-export-password-toggle"
                            checked={exportPasswordEnabled}
                            onCheckedChange={(checked) => {
                              setExportPasswordEnabled(checked);
                              if (!checked) {
                                setExportPassword("");
                              }
                            }}
                            disabled={!!progress}
                          />
                        </div>

                        {exportPasswordEnabled && (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="privacy-export-password">{LocalLang.exportPasswordFieldTitle}</Label>
                            <Input
                              id="privacy-export-password"
                              type="password"
                              value={exportPassword}
                              onChange={(event) => setExportPassword(event.target.value)}
                              placeholder={LocalLang.exportPasswordFieldPlaceholder}
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleExport(exportFormat, exportPasswordEnabled ? exportPassword : undefined)}
                        disabled={!!progress || (exportPasswordEnabled && exportPassword.trim().length === 0)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {LocalLang.exportActionTitle}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <>
                <input
                  ref={importInputRef}
                  type="file"
                  multiple
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    void handleImportFiles(files);
                    event.currentTarget.value = "";
                  }}
                />
              </>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {LocalLang.exportHint}
                </p>
              </div>

              {lastImportResult && (
                <ImportResultSummary
                  result={lastImportResult}
                  title={LocalLang.importSuccessTitle}
                  countLabel={LocalLang.importSuccessCount(lastImportResult.totalImportedCount)}
                />
              )}

              {lastExportResult && (
                <ExportResultSummary
                  result={lastExportResult}
                  title={lastExportResult.failedDomains.length > 0
                    ? LocalLang.exportPartialTitle
                    : LocalLang.exportSuccessTitle}
                  successLabel={LocalLang.exportSuccessCount(lastExportResult.exportedDomains.length)}
                  errorLabel={LocalLang.exportErrorCount(lastExportResult.failedDomains.length)}
                  fileLabel={LocalLang.exportFileLabel(lastExportResult.fileName)}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                <CardTitle>{LocalLang.manageAccountTitle}</CardTitle>
              </div>
              <CardDescription>
                {LocalLang.manageAccountDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-14"
                  onClick={() => void handleDownloadEncryptionKey()}
                  disabled={!!progress}
                >
                  <KeyRound className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{LocalLang.downloadEncryptionKeyTitle}</p>
                    <p className="text-xs text-muted-foreground">{LocalLang.downloadEncryptionKeyDescription}</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={openDeleteDataDialog}
                  disabled={!!progress}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{LocalLang.deleteOnlyDataTitle}</p>
                    <p className="text-xs text-muted-foreground">{LocalLang.deleteOnlyDataDescription}</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => navigate("/me/privacy/delete")}
                  disabled={!!progress}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{LocalLang.deleteMyAccountTitle}</p>
                    <p className="text-xs text-muted-foreground">{LocalLang.deleteMyAccountDescription}</p>
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
            <AlertDialogTitle>{LocalLang.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {LocalLang.deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm font-mono text-foreground">
              {deleteDataPhrase}
            </div>
            <Input
              value={deleteDataConfirmation}
              onChange={(event) => setDeleteDataConfirmation(event.target.value)}
              placeholder={LocalLang.deleteDialogPlaceholder}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{LocalLang.deleteDialogCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {LocalLang.deleteDialogConfirm}
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
  progressType: "export" | "delete" | "import";
  lastImportResult: ImportUserDataResult | null;
  lastExportResult: ExportUserDataResult | null;
  handleExport: (format: 'json' | 'csv', password?: string) => void;
  handleImportFiles: (files: File[]) => Promise<void>;
  handleDownloadEncryptionKey: () => Promise<void>;
  showDeleteDataDialog: boolean;
  setShowDeleteDataDialog: (open: boolean) => void;
  deleteDataPhrase: string;
  deleteDataConfirmation: string;
  setDeleteDataConfirmation: (value: string) => void;
  openDeleteDataDialog: () => void;
  confirmDeleteData: () => void;
}

function ImportResultSummary({
  result,
  title,
  countLabel,
}: {
  result: ImportUserDataResult;
  title: string;
  countLabel: string;
}) {
  const hasErrors = result.failedFiles.length > 0;
  const Icon = hasErrors ? AlertCircle : CheckCircle2;

  return (
    <Alert variant={hasErrors ? "destructive" : "default"}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{countLabel}</p>
        <p>{result.importedFiles.length} arquivo(s) importado(s).</p>
        {result.importedFiles.map(({ fileName, domain, importedCount }) => (
          <p key={`${fileName}-${domain}`}>
            {fileName} {"->"} {domain} ({importedCount} item(ns))
          </p>
        ))}
        {hasErrors && (
          <ul className="list-disc pl-5">
            {result.failedFiles.map(({ fileName, message }) => (
              <li key={fileName}>
                <strong>{fileName}:</strong> {message}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}

function ExportResultSummary({
  result,
  title,
  successLabel,
  errorLabel,
  fileLabel,
}: {
  result: ExportUserDataResult;
  title: string;
  successLabel: string;
  errorLabel: string;
  fileLabel: string;
}) {
  const hasErrors = result.failedDomains.length > 0;
  const Icon = hasErrors ? AlertCircle : CheckCircle2;

  return (
    <Alert variant={hasErrors ? "destructive" : "default"}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{successLabel}</p>
        <p>{errorLabel}</p>
        <p>{fileLabel}</p>
        {hasErrors && (
          <ul className="list-disc pl-5">
            {result.failedDomains.map(({ domain, message }) => (
              <li key={domain}>
                <strong>{domain}:</strong> {message}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
