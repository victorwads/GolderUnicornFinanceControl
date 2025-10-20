import { useState } from "react";
import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const useLoginScreenModel = () => {
  const [isLoading, setIsLoading] =  useState<string | false>(false);

  async function handleLogin(providerName: string) {
    setIsLoading(providerName);
    let provider: OAuthProvider;
    switch (providerName) {
      case "apple.com":
        provider = new OAuthProvider(providerName);
        provider.addScope("name");
        break;
      case "google.com":
        provider = new OAuthProvider(providerName);
        provider.addScope("profile");
        break;

      default:
        return;
    }
    provider.addScope("email");

    await signInWithPopup(getAuth(), provider)
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
    setIsLoading(false);
  }

  return {
    isLoading,
    handleLogin,
  };
};

export default useLoginScreenModel;
