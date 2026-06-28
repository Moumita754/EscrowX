/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ID: string;
  readonly VITE_NETWORK: "testnet" | "mainnet" | "futurenet";
  readonly VITE_SOROBAN_RPC_URL?: string;
  readonly VITE_TOKEN_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
