import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "@configs";
import { clearSession } from "@utils/clearSession";
import { useAppUpdates } from "@componentsDeprecated/AppUpdatesProvider";
import { useToast } from "@hooks/use-toast";
import { isDeveloperOptionsEnabled, setDeveloperOptionsEnabled } from "./developerOptions";

import {
  MoreRoute,
  ToSettingsRoute,
  MoreViewModel
} from "@layouts/core/More";
import { Calendar, CreditCard, FileCode2, FileText, Link2, Receipt, Sparkles, Wallet, Lock, Bot } from "lucide-react";

export function useMoreModel(): MoreViewModel {
  const router = useNavigate();
  const { toast } = useToast();
  const versionTapCountRef = useRef(0);
  const versionTapResetTimerRef = useRef<number | null>(null);
  const [developerOptionsEnabled, setDeveloperOptionsEnabledState] = useState(() => isDeveloperOptionsEnabled());

  function navigate(route: MoreRoute | string) {
    if (typeof route === "string") {
      router(route);
      return;
    }

    switch (true) {
      case route instanceof ToSettingsRoute: router("/settings/app"); break;
    }
  }

  const { version, checkForUpdates, checkingForUpdate } = useAppUpdates();
  const user = getCurrentUser();

  return {
    user: {
      id: user?.uid || "",
      email: user?.email || "user@example.com",
      name: user?.displayName || "",
      imageURL: user?.photoURL || undefined,
    },
    appVersion: version,
    sections: [
      {
        title: "Gestão Financeira",
        items: [
          { label: "Contas", icon: Wallet, route: "/accounts" },
          { label: "Cartões de Crédito", icon: CreditCard, route: "/creditcards" },
          { label: "Categorias", icon: Receipt, route: "/categories" },
          { label: "Gastos e Entradas Recorrentes", icon: Calendar, route: "/recurrents" },
        ],
      },
      {
        title: "Minha Conta",
        items: [
          { label: "Assistant History", icon: Bot, route: "/assistant" },
          { label: "Contas Conectadas", icon: Link2, route: "/me/linkedaccounts" },
          { label: "Uso de Recursos", icon: FileText, route: "/me/resource-usage" },
          { label: "Privacidade e Segurança", icon: Lock, route: "/me/privacy" },
        ],
      },
      ...(developerOptionsEnabled ? [{
        title: "Developer Options / Beta",
        items: [
          { label: "Subscrições", icon: Sparkles, route: "/subscriptions" },
          { label: "Utilitários de Desenvolvedor", icon: FileCode2, route: "/settings/developer" },
        ],
      }] : []),
    ],
    navigate,
    onVersionPress: () => {
      if (developerOptionsEnabled) {
        return;
      }

      versionTapCountRef.current += 1;

      if (versionTapResetTimerRef.current !== null) {
        window.clearTimeout(versionTapResetTimerRef.current);
      }

      versionTapResetTimerRef.current = window.setTimeout(() => {
        versionTapCountRef.current = 0;
        versionTapResetTimerRef.current = null;
      }, 4000);

      if (versionTapCountRef.current < 10) {
        return;
      }

      setDeveloperOptionsEnabled(true);
      setDeveloperOptionsEnabledState(true);
      versionTapCountRef.current = 0;
      if (versionTapResetTimerRef.current !== null) {
        window.clearTimeout(versionTapResetTimerRef.current);
        versionTapResetTimerRef.current = null;
      }

      toast({
        title: "Developer options enabled",
        description: "Advanced options are now available in settings.",
      });
    },
    handleLogout: clearSession,
    handleUpdateCheck: async () => {
      const result = await checkForUpdates({ applyIfAvailable: true });

      if (result === "no-update") {
        toast({
          title: Lang.settings.checkUpdates,
          description: Lang.settings.upToDate,
        });
        return;
      }

      if (result === "unsupported") {
        toast({
          variant: "destructive",
          title: Lang.settings.checkUpdates,
          description: Lang.settings.updateCheckUnavailable,
        });
        return;
      }

      if (result === "error") {
        toast({
          variant: "destructive",
          title: Lang.settings.checkUpdates,
          description: Lang.settings.updateCheckFailed,
        });
      }
    },
    checkingForUpdate,
  };
}
