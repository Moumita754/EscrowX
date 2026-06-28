import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction,
  WatchWalletChanges,
} from "@stellar/freighter-api";
import { logger } from "@/utils/logger";
import {
  WalletError,
  type WalletAccount,
  type WalletAdapter,
} from "./types";

export class FreighterWalletAdapter implements WalletAdapter {
  readonly kind = "freighter" as const;
  readonly name = "Freighter";
  readonly downloadUrl = "https://www.freighter.app/";

  async isAvailable(): Promise<boolean> {
    const { isConnected: installed } = await isConnected();
    return Boolean(installed);
  }

  private async account(): Promise<WalletAccount> {
    const details = await getNetworkDetails();
    if (details.error) throw new WalletError(String(details.error));
    const account = await getAddress();
    if (account.error || !account.address) {
      throw new WalletError("Could not read the Freighter address.");
    }
    return {
      address: account.address,
      network: details.network,
      networkPassphrase: details.networkPassphrase,
    };
  }

  async connect(): Promise<WalletAccount> {
    if (!(await this.isAvailable())) {
      throw new WalletError(
        "Freighter is not installed. Get it at freighter.app.",
      );
    }
    const allowed = await isAllowed();
    if (!allowed.isAllowed) await setAllowed();

    const access = await requestAccess();
    if (access.error) throw new WalletError(String(access.error));

    const account = await this.account();
    logger.ok("wallet", "Freighter connected", account);
    return account;
  }

  async restore(): Promise<WalletAccount | null> {
    if (!(await this.isAvailable())) return null;
    const allowed = await isAllowed();
    if (!allowed.isAllowed) return null;
    try {
      return await this.account();
    } catch {
      return null;
    }
  }

  disconnect(): void {
    // Freighter has no programmatic disconnect; local state is cleared by caller.
  }

  async signTransaction(
    xdr: string,
    opts: { networkPassphrase: string; address: string },
  ): Promise<string> {
    // Passing `address` forces Freighter to sign with the expected account.
    const result = await signTransaction(xdr, {
      networkPassphrase: opts.networkPassphrase,
      address: opts.address,
    });
    if (result.error) throw new WalletError(String(result.error));
    if (result.signerAddress && result.signerAddress !== opts.address) {
      throw new WalletError(
        "Freighter signed with a different account than expected. Switch Freighter to the account that owns this escrow and try again.",
      );
    }
    return result.signedTxXdr;
  }

  watch(callback: (account: WalletAccount | null) => void): () => void {
    const watcher = new WatchWalletChanges(2000);
    watcher.watch((changes) => {
      if (changes.error || !changes.address) {
        callback(null);
        return;
      }
      callback({
        address: changes.address,
        network: changes.network,
        networkPassphrase: changes.networkPassphrase,
      });
    });
    return () => watcher.stop();
  }
}
