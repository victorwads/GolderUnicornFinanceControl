import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { ArrowLeft, FileJson, FileSpreadsheet, FileText, ShieldCheck, Download, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { DataProgress } from "@components/DataProgress";
import type { DataProgressInfo } from "@components/DataProgress";
import type { ExportUserDataResult } from "@features/settings/settingsActions";
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
  const { 
    navigate, 
    progress,
    progressType,
    lastExportResult,
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
              <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
              <p className="text-sm text-muted-foreground">{LocalLang.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
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
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-16"
                  onClick={() => handleExport('json')}
                  disabled={!!progress}
                >
                  <FileJson className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{LocalLang.exportJsonTitle}</p>
                    <p className="text-xs text-muted-foreground">{LocalLang.exportJsonDescription}</p>
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
                    <p className="font-medium">{LocalLang.exportCsvTitle}</p>
                    <p className="text-xs text-muted-foreground">{LocalLang.exportCsvDescription}</p>
                  </div>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {LocalLang.exportHint}
                </p>
              </div>

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
              <CardTitle>{LocalLang.deleteDataTitle}</CardTitle>
              <CardDescription>
                {LocalLang.deleteDataDescription}
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
                  <p className="font-medium">{LocalLang.deleteOnlyDataTitle}</p>
                  <p className="text-xs text-muted-foreground">{LocalLang.deleteOnlyDataDescription}</p>
                </div>
              </Button>
            </CardContent>
          </Card>

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
              <CardTitle>{LocalLang.manageAccountTitle}</CardTitle>
              <CardDescription>
                {LocalLang.manageAccountDescription}
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
  progressType: "export" | "delete";
  lastExportResult: ExportUserDataResult | null;
  handleExport: (format: 'json' | 'csv') => void;
  showDeleteDataDialog: boolean;
  setShowDeleteDataDialog: (open: boolean) => void;
  deleteDataPhrase: string;
  deleteDataConfirmation: string;
  setDeleteDataConfirmation: (value: string) => void;
  openDeleteDataDialog: () => void;
  confirmDeleteData: () => void;
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
