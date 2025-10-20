import { Loading } from "@components/Loading";

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loading show={true} />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

export interface AppLoadingViewModel {
  isReady: boolean;
}
