import { Networks } from "@stellar/stellar-sdk";

type NetworkName = "testnet" | "mainnet" | "futurenet";

const RPC_BY_NETWORK: Record<NetworkName, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.sorobanrpc.com",
  futurenet: "https://rpc-futurenet.stellar.org",
};

const HORIZON_BY_NETWORK: Record<NetworkName, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
  futurenet: "https://horizon-futurenet.stellar.org",
};

const PASSPHRASE_BY_NETWORK: Record<NetworkName, string> = {
  testnet: Networks.TESTNET,
  mainnet: Networks.PUBLIC,
  futurenet: Networks.FUTURENET,
};

// Native XLM Stellar Asset Contract address on testnet, used as the default
// escrow payment asset when VITE_TOKEN_ID is not supplied.
const DEFAULT_TESTNET_TOKEN =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const network = (import.meta.env.VITE_NETWORK ?? "testnet") as NetworkName;

export const config = {
  network,
  // The Escrow contract — the only contract the frontend ever calls.
  contractId: import.meta.env.VITE_CONTRACT_ID ?? "",
  // The PaymentVault contract — shown for transparency; never called directly.
  vaultId: import.meta.env.VITE_VAULT_ID ?? "",
  tokenId: import.meta.env.VITE_TOKEN_ID ?? DEFAULT_TESTNET_TOKEN,
  rpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL ?? RPC_BY_NETWORK[network],
  horizonUrl: HORIZON_BY_NETWORK[network],
  networkPassphrase: PASSPHRASE_BY_NETWORK[network],
  explorerBaseUrl:
    network === "mainnet"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet",
} as const;

export const isContractConfigured = () => config.contractId.startsWith("C");

// Stroops per unit for 7-decimal Stellar assets.
export const ASSET_DECIMALS = 7;
