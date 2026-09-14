// ============================================================================
//  STORAGE WRAPPER — localStorage / sessionStorage
// ============================================================================

type StorageType = 'local' | 'session';

class StorageManager {
  private getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  // ========================================================================
  // GET
  // ========================================================================
  get<T = any>(key: string, defaultValue: T | null = null, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const item = storage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  getString(key: string, defaultValue = '', type: StorageType = 'local'): string {
    try {
      const storage = this.getStorage(type);
      return storage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // ========================================================================
  // SET
  // ========================================================================
  set<T = any>(key: string, value: T, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // REMOVE
  // ========================================================================
  remove(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // CLEAR
  // ========================================================================
  clear(type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      storage.clear();
      return true;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // EXISTS
  // ========================================================================
  has(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      return storage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // KEYS
  // ========================================================================
  keys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type);
      return Object.keys(storage);
    } catch {
      return [];
    }
  }

  // ========================================================================
  // SIZE
  // ========================================================================
  size(type: StorageType = 'local'): number {
    try {
      const storage = this.getStorage(type);
      return storage.length;
    } catch {
      return 0;
    }
  }
}

export const storage = new StorageManager();

// ============================================================================
//  HELPERS SPÉCIFIQUES
// ============================================================================

export const tokenStorage = {
  getAccessToken: (): string | null => storage.getString('odc_access_token'),
  getRefreshToken: (): string | null => storage.getString('odc_refresh_token'),
  setTokens: (accessToken: string, refreshToken?: string): void => {
    storage.set('odc_access_token', accessToken);
    if (refreshToken) storage.set('odc_refresh_token', refreshToken);
  },
  clearTokens: (): void => {
    storage.remove('odc_access_token');
    storage.remove('odc_refresh_token');
    storage.remove('odc_user');
  },
};

export const userStorage = {
  getUser: <T = any>(): T | null => storage.get('odc_user'),
  setUser: (user: any): void => storage.set('odc_user', user),
  clearUser: (): void => storage.remove('odc_user'),
};

export const themeStorage = {
  get: (): 'light' | 'dark' | null => storage.get('odc-theme'),
  set: (theme: string): void => storage.set('odc-theme', theme),
};

export const languageStorage = {
  get: (): string => storage.getString('odc-language', 'fr'),
  set: (lang: string): void => storage.set('odc-language', lang),
};

export default storage;