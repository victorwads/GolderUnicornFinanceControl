export class ProjectStorage {
  static PREFIX = "guapp_";

  static set(key: string, value: string) {
    localStorage.setItem(this.PREFIX + key, value);
  }

  static get(key: string): string | null {
    return localStorage.getItem(this.PREFIX + key);
  }

  static setSession(key: string, value: string) {
    sessionStorage.setItem(this.PREFIX + key, value);
  }

  static getSession(key: string): string | null {
    return sessionStorage.getItem(this.PREFIX + key);
  }

  static remove(key: string) {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}