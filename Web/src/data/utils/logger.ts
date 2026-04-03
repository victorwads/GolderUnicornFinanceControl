type LogMethod = "debug" | "info" | "warn" | "error";

const DEBUG_FLAG_PREFIX = "debug:";

function isProdBuild(): boolean {
  return import.meta.env.PROD;
}

function readDebugFlag(scope: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const value = window.localStorage.getItem(`${DEBUG_FLAG_PREFIX}${scope}`);
  return value === "1" || value === "true" || value === "on";
}

export function createLogger(scope: string) {
  const prefixedScope = `[${scope}]`;

  const shouldLog = (): boolean => {
    if (isProdBuild()) return false;
    return readDebugFlag(scope) || readDebugFlag("*");
  };

  const write = (method: LogMethod, message: string, ...args: unknown[]) => {
    if (!shouldLog()) return;
    const output = [prefixedScope, message, ...args];
    switch (method) {
      case "debug":
      case "info":
        console.log(...output);
        return;
      case "warn":
        console.warn(...output);
        return;
      case "error":
        console.error(...output);
        return;
    }
  };

  return {
    debug: (message: string, ...args: unknown[]) => write("debug", message, ...args),
    info: (message: string, ...args: unknown[]) => write("info", message, ...args),
    warn: (message: string, ...args: unknown[]) => write("warn", message, ...args),
    error: (message: string, ...args: unknown[]) => write("error", message, ...args),
  };
}
