import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PrivacyViewModel } from "@layouts/privacy/Privacy";
import type { DataProgressInfo } from "@components/DataProgress";

const domains = [
  { name: "Transações", items: 5420 },
  { name: "Contas", items: 12 },
  { name: "Cartões", items: 8 },
  { name: "Categorias", items: 45 },
  { name: "Configurações", items: 1 },
];

export function usePrivacyModel(): PrivacyViewModel {
  const navigate = useNavigate();
  const [exportProgress, setExportProgress] = useState<DataProgressInfo | null>(null);

  const simulateExportProgress = async () => {
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      
      // Update main progress
      setExportProgress({
        domain: domain.name,
        current: i + 1,
        max: domains.length,
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Simulate sub-progress
      const batchSize = 500;
      const batches = Math.ceil(domain.items / batchSize);
      
      for (let j = 0; j < batches; j++) {
        const current = Math.min((j + 1) * batchSize, domain.items);
        setExportProgress({
          domain: domain.name,
          current: i + 1,
          max: domains.length,
          sub: {
            current,
            max: domain.items,
          },
        });
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }
    }

    // Finish
    setExportProgress(null);
    
    // Simulate download
    const blob = new Blob([JSON.stringify({ exported: "data" })], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: "json" | "csv") => {
    console.log(`Exporting as ${format}`);
    await simulateExportProgress();
  };

  return {
    navigate,
    exportProgress,
    handleExport,
  };
}
