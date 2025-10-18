import { Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@lib/utils";

interface MicButtonProps {
  onToggle?: (isActive: boolean) => void;
}

export const MicButton = ({ onToggle }: MicButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    // Listen for storage changes
    window.addEventListener("storage", checkLoginStatus);
    
    // Also check periodically in case localStorage changes in same tab
    const interval = setInterval(checkLoginStatus, 500);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
    
    if (newState) {
      setIsListening(true);
      setTimeout(() => setIsListening(false), 2000);
    }
  };

  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
        "w-16 h-16 rounded-full",
        "flex items-center justify-center",
        "transition-all duration-300 active:scale-95",
        "backdrop-blur-md border",
        isActive 
          ? "bg-primary/20 border-primary/30 text-primary shadow-[0_8px_32px_hsl(262_83%_58%/0.3)]" 
          : "bg-background/20 border-border/30 text-foreground shadow-lg hover:bg-background/30 hover:shadow-xl"
      )}
    >
      <div className="relative">
        {isActive ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-white/20 animate-ping" />
            <div className="absolute w-10 h-10 rounded-full bg-white/10 animate-ping animation-delay-150" />
          </div>
        )}
      </div>
    </button>
  );
};
