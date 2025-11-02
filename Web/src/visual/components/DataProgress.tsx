import { Card } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { FileDown, Trash2, Loader2 } from "lucide-react";

export interface DataProgressInfo {
  domain: string;
  current: number;
  max: number;
  sub?: { max: number; current: number };
}

type DataProgressProps = {
  progress?: DataProgressInfo | null;
  type?: "export" | "delete";
}

export const DataProgress = ({ progress, type = "export" }: DataProgressProps) => {
  if (!progress) return null;

  const Icon = type === "export" ? FileDown : Trash2;
  const title = type === "export" ? "Exportando dados..." : "Excluindo dados...";
  const mainPercentage = (progress.current / progress.max) * 100;
  const subPercentage = progress.sub ? (progress.sub.current / progress.sub.max) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 border-border/50 shadow-lg animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Seção {progress.current} de {progress.max}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress.domain}</span>
            <span className="font-medium text-foreground">{Math.round(mainPercentage)}%</span>
          </div>
          <Progress value={mainPercentage} className="h-2" />
        </div>

        {progress.sub && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Registro {progress.sub.current} de {progress.sub.max}
              </span>
              <span className="font-medium text-foreground">{Math.round(subPercentage)}%</span>
            </div>
            <Progress value={subPercentage} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>
            {progress.sub 
              ? `Processando ${progress.domain}...`
              : `Preparando dados de ${progress.domain}...`
            }
          </span>
        </div>
      </Card>
    </div>
  );
};
