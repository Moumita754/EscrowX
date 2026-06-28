import { StrKey } from "@stellar/stellar-sdk";
import { config } from "@/config";

export const isValidStellarAddress = (address: string): boolean => {
  try {
    return StrKey.isValidEd25519PublicKey(address.trim());
  } catch {
    return false;
  }
};

export const txExplorerUrl = (hash: string): string =>
  `${config.explorerBaseUrl}/tx/${hash}`;

export const accountExplorerUrl = (address: string): string =>
  `${config.explorerBaseUrl}/account/${address}`;

export const contractExplorerUrl = (contractId: string): string =>
  `${config.explorerBaseUrl}/contract/${contractId}`;
