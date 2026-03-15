import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "@configs";
import { clearSession } from "@utils/clearSession";
import { useAppUpdates } from "@componentsDeprecated/AppUpdatesProvider";

import {
  MoreRoute,
  ToSettingsRoute,
  MoreViewModel
} from "@layouts/core/More";
import { Calendar, CreditCard, FileCode2, FileText, Link2, Receipt, Sparkles, Wallet, Lock, Bot } from "lucide-react";

export function useMoreModel(): MoreViewModel {
  const router = useNavigate();

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
          { label: "Assistente", icon: Bot, route: "/assistant" },
          { label: "Contas Conectadas", icon: Link2, route: "/me/linkedaccounts" },
          { label: "Uso de Recursos", icon: FileText, route: "/me/resource-usage" },
          { label: "Privacidade e Segurança", icon: Lock, route: "/me/privacy" },
        ],
      },
      {
        title: "Developer Options / Beta",
        items: [
          { label: "AI Calls", icon: Bot, route: "/ai-calls" },
          { label: "Subscrições", icon: Sparkles, route: "/subscriptions" },
          { label: "Utilitários de Desenvolvedor", icon: FileCode2, route: "/settings/developer" },
        ],
      },
    ],
    navigate,
    handleLogout: clearSession,
    handleUpdateCheck: checkForUpdates,
    checkingForUpdate,
  };
}
