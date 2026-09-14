/// <reference types="vite/client" />

// ============================================================================
//  VITE ENVIRONMENT TYPES
// ============================================================================

interface ImportMetaEnv {
  // Application
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_URL: string;

  // API
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;

  // Environnement
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;

  // Features flags
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_DEBUG?: string;

  // Services externes
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;

  // Configuration
  readonly VITE_DEFAULT_LANGUAGE?: 'fr' | 'en' | 'mg';
  readonly VITE_DEFAULT_THEME?: 'light' | 'dark';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================================================
//  TYPES VITE
// ============================================================================

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.eot' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}

declare module '*.json' {
  const value: any;
  export default value;
}

// ============================================================================
//  TYPES PERSONNALISÉS
// ============================================================================

declare module 'qrcode' {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any
  ): Promise<void>;
  export function toDataURL(text: string, options?: any): Promise<string>;
  export function toBuffer(text: string, options?: any): Promise<Buffer>;
  export function toString(text: string, options?: any): Promise<string>;
}

declare module 'jsqr' {
  interface QRCode {
    data: string;
    location: any;
    binaryData: number[];
  }
  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: any
  ): QRCode | null;
  export default jsQR;
}

// ============================================================================
//  GLOBAL TYPES
// ============================================================================

declare global {
  interface Window {
    __socket?: any;
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

export {};