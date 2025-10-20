import { ChevronRight, User, Lock, HelpCircle, Info, Wallet, CreditCard, Receipt, Calendar, Settings as SettingsIcon, FileText, Download, Trash2, Link2, Repeat, Sparkles, LogOut } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { Card } from "@components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import { Button } from "@components/ui/button";
import { NamedExoticComponent } from "react";

interface MoreProps {
  model: MoreViewModel;
}

export default function More({ model }: MoreProps) {
  const { navigate, handleLogout, sections = [], lang = {} as MoreLang, user } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <h1 className="text-2xl font-bold text-foreground">{lang.title || "Mais"}</h1>
          <p className="text-sm text-muted-foreground">{lang.subtitle || "Suas informações e gerenciamento"}</p>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="flex items-center gap-4 p-5 bg-gradient-card border-border/50">
            <div 
              className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30"
              style={user.imageURL ? { backgroundImage: `url(${user.imageURL})`, backgroundSize: 'cover' } : { }}>
              {!user.imageURL && <User className="h-8 w-8 text-primary" />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground/50 mt-1">{lang.account?.myId || "Meu ID"}: {user.id}</p>
            </div>
          </Card>

          {sections.map((section) => 
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {section.title}
            </h3>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              {section.items.map((item) =>
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(item.route)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>)}
            </Card>
          </div>)}

          {/* Sobre o App */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang.appInfo?.title || "Sobre o App"}
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs"
              >
                {lang.appInfo?.searchUpdates || "Buscar atualizações"}
              </Button>
            </div>
            <Card className="divide-y divide-border/50 border-border/50 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(new ToSettingsRoute())}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Configurações</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{lang.appInfo?.version || "Versão"}</p>
                    <p className="text-xs text-muted-foreground">{model.appVersion}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Logout */}
          <div className="pb-4">
            <Button
              variant="outline"
              className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Deslogar
            </Button>
          </div>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class MoreRoute {}
export class ToSettingsRoute extends MoreRoute {}

export interface User {
  imageURL?: string;
  name: string;
  email: string;
  id: string;
}

export interface MoreLang {
  title: string;
  subtitle: string;
  account?: {
    myId: string;
  }
  appInfo?: {
    title: string;
    version: string;
    searchUpdates: string;
  };
  logout: string;
}

export interface MoreViewModel {
  user: User;
  lang?: MoreLang;
  appVersion: string;
  sections: {
    title: string;
    items: {
      label: string;
      icon: NamedExoticComponent<{ className?: string | undefined; }>;
      route: string;
    }[];
  }[];
  navigate: (route: MoreRoute | string) => void;
  handleUpdateCheck: () => void;
  handleLogout: () => void;
}
