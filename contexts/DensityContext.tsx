import { createContext, useContext, ReactNode, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";

type DensityContextType = {
  density: number;
  setDensity: (value: number) => void;
};

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export const DensityProvider = ({ children }: { children: ReactNode }) => {
  const [density, setDensity] = useLocalStorageState<number>("app-density", {
    defaultValue: 2,
  });

  // Apply density to root element
  const densityScale = {
    1: "0.875", // 87.5% - Compacto
    2: "1",     // 100% - Normal
    3: "1.125", // 112.5% - Confortável
    4: "1.25",  // 125% - Espaçoso
  } as const;

  useEffect(() => {
    const scale = densityScale[(density as keyof typeof densityScale) ?? 2];
    document.documentElement.style.setProperty("--density", scale);
  }, [density]);

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = () => {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error("useDensity must be used within DensityProvider");
  }
  return context;
};
