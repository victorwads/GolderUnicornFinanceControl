import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@hooks/use-toast";
import { auth } from "@configs";
import { GoogleAuthProvider, OAuthProvider, linkWithCredential, signInWithPopup, unlink } from "firebase/auth";
import {
  ConnectedAccountsRoute,
  ToMoreRoute,
  ConnectedAccountsViewModel
} from "@layouts/settings/ConnectedAccounts";

export function useConnectedAccountsModel(): ConnectedAccountsViewModel {
  const router = useNavigate();
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: false,
    apple: false,
  });

  useEffect(() => {
    const updateConnectedAccounts = () => {
      const user = auth.currentUser;
      if (user) {
        const providers = user.providerData.map((p: any) => p.providerId);
        setConnectedAccounts({
          google: providers.includes('google.com'),
          apple: providers.includes('apple.com'),
        });
      } else {
        setConnectedAccounts({ google: false, apple: false });
      }
    };

    updateConnectedAccounts();
    const unsubscribe = auth.onAuthStateChanged(updateConnectedAccounts);
    return unsubscribe;
  }, []);

  function navigate(route: ConnectedAccountsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/more");
        break;

      default:
        console.warn('Unknown route type', route);
        break;
    }
  }

  const handleConnect = async (provider: "google" | "apple") => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      let credential;
      if (provider === "google") {
        const providerInstance = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, providerInstance);
        credential = GoogleAuthProvider.credentialFromResult(result);
      } else if (provider === "apple") {
        const providerInstance = new OAuthProvider('apple.com');
        const result = await signInWithPopup(auth, providerInstance);
        credential = OAuthProvider.credentialFromResult(result);
      }

      if (credential) {
        await linkWithCredential(user, credential);
        setConnectedAccounts(prev => ({ ...prev, [provider]: true }));
        toast({
          title: "Conta conectada",
          description: `Sua conta ${provider === "google" ? "Google" : "Apple"} foi conectada com sucesso.`,
        });
      }
    } catch (error: any) {
      console.error("Error linking account:", error);
      toast({
        title: "Erro",
        description: `Falha ao conectar conta ${provider === "google" ? "Google" : "Apple"}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (provider: "google" | "apple") => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      const providerId = provider === "google" ? "google.com" : "apple.com";
      await unlink(user, providerId);
      setConnectedAccounts(prev => ({ ...prev, [provider]: false }));
      toast({
        title: "Conta desconectada",
        description: `Sua conta ${provider === "google" ? "Google" : "Apple"} foi desconectada.`,
      });
    } catch (error: any) {
      console.error("Error unlinking account:", error);
      toast({
        title: "Erro",
        description: `Falha ao desconectar conta ${provider === "google" ? "Google" : "Apple"}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return {
    navigate,
    connectedAccounts,
    handleConnect,
    handleDisconnect,
  };
}
