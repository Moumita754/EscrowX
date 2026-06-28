import {
  Account,
  Address,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { config, isContractConfigured } from "@/config";
import { EscrowStatus, STATUS_BY_INDEX, type Escrow } from "@/types/escrow";
import { EscrowStage } from "@/types/flow";
import { EscrowFlowError, parseError } from "@/utils/errors";
import { logger } from "@/utils/logger";

const server = new rpc.Server(config.rpcUrl, {
  allowHttp: config.rpcUrl.startsWith("http://"),
});

export type SignFn = (xdr: string) => Promise<string>;
export type ProgressFn = (stage: EscrowStage) => void;

export interface TxResult {
  hash: string;
  returnValue: unknown;
}

const getContract = (): Contract => {
  if (!isContractConfigured()) {
    throw new EscrowFlowError(
      EscrowStage.Build,
      "Contract is not configured. Set VITE_CONTRACT_ID in your environment.",
    );
  }
  return new Contract(config.contractId);
};

const addressArg = (value: string) => new Address(value).toScVal();
const u64Arg = (value: number | bigint) =>
  nativeToScVal(BigInt(value), { type: "u64" });
const i128Arg = (value: string) => nativeToScVal(BigInt(value), { type: "i128" });
const stringArg = (value: string) => nativeToScVal(value, { type: "string" });

// Map a TransactionResult error code to a clear, actionable message.
const SUBMIT_ERRORS: Record<string, string> = {
  txNoAccount:
    "Your account was not found on this network. Fund it on testnet and try again.",
  txBadSeq: "Transaction sequence was out of date. Please try again.",
  txBadAuth:
    "Signed with the wrong account. Switch your wallet to the account that owns this escrow and try again.",
  txBadAuthExtra:
    "Signature mismatch. Switch your wallet to the correct account and try again.",
  txInsufficientBalance:
    "Insufficient XLM balance to cover the amount and fees.",
  txInsufficientFee: "Network fee was too low. Please try again.",
  txTooLate: "The transaction expired before it was processed. Please retry.",
  txFailed: "A contract operation failed during execution.",
  txSorobanInvalid: "The contract call was rejected by the network.",
};

const decodeSubmitError = (errorResult: unknown): string => {
  try {
    const name = (
      errorResult as { result: () => { switch: () => { name: string } } }
    )
      ?.result?.()
      ?.switch?.()?.name;
    if (name) return SUBMIT_ERRORS[name] ?? `Network rejected the transaction (${name}).`;
  } catch {
    /* fall through to raw */
  }
  // Fallback: stringify and look for a known code.
  const raw = JSON.stringify(errorResult ?? {});
  const match = raw.match(/"name":"(tx[A-Za-z]+)"/);
  if (match) return SUBMIT_ERRORS[match[1]] ?? `Network rejected the transaction (${match[1]}).`;
  return "The network rejected the transaction. Please try again.";
};

const pollTransaction = async (hash: string): Promise<unknown> => {
  const deadline = Date.now() + 45_000;
  let attempt = await server.getTransaction(hash);

  while (
    attempt.status === rpc.Api.GetTransactionStatus.NOT_FOUND &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    attempt = await server.getTransaction(hash);
  }

  if (attempt.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    return attempt.returnValue ? scValToNative(attempt.returnValue) : null;
  }
  if (attempt.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed on-chain (${hash}).`);
  }
  throw new Error(`Transaction not confirmed in time (${hash}).`);
};

/**
 * The production escrow-write pipeline: build → simulate → prepare → sign →
 * submit → poll. Each stage is logged and any failure is wrapped in an
 * EscrowFlowError that records exactly where it failed.
 */
const invoke = async (
  signXdr: SignFn,
  source: string,
  method: string,
  args: xdr.ScVal[],
  onProgress?: ProgressFn,
): Promise<TxResult> => {
  const contract = getContract();
  logger.start("tx", `invoke ${method}`, {
    contractId: config.contractId,
    network: config.network,
    source,
  });

  // 1) Build
  let account: Account;
  try {
    onProgress?.(EscrowStage.Build);
    account = await server.getAccount(source);
  } catch (error) {
    logger.error("tx", "Build failed (account load)", error);
    throw new EscrowFlowError(
      EscrowStage.Build,
      "Could not load your account. Make sure it is funded on this network.",
      error,
    );
  }

  const built = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();
  logger.step("tx", "Built unsigned XDR", built.toXDR());

  // 2) Simulate + 3) Prepare. prepareTransaction() simulates and assembles in
  // one step and — crucially — preserves the source account sequence number.
  // (Manually calling assembleTransaction(built, sim).build() re-increments the
  // sequence, producing a txBadSeq the network rejects at submit.)
  let prepared;
  try {
    onProgress?.(EscrowStage.Simulate);
    logger.step("tx", "Simulating + preparing");
    onProgress?.(EscrowStage.Prepare);
    prepared = await server.prepareTransaction(built);
    logger.step("tx", "Prepared XDR", prepared.toXDR());
  } catch (error) {
    logger.error("tx", "Simulation/prepare failed", error);
    throw new EscrowFlowError(EscrowStage.Simulate, parseError(error), error);
  }

  // 4) Sign (wallet)
  let signedXdr: string;
  try {
    onProgress?.(EscrowStage.Sign);
    signedXdr = await signXdr(prepared.toXDR());
    logger.ok("tx", "Signed by wallet");
  } catch (error) {
    logger.error("tx", "Signing failed", error);
    throw new EscrowFlowError(EscrowStage.Sign, parseError(error), error);
  }

  // 5) Submit
  let hash: string;
  try {
    onProgress?.(EscrowStage.Submit);
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      config.networkPassphrase,
    );
    const sent = await server.sendTransaction(signedTx);
    logger.step("tx", "Submitted", { status: sent.status, hash: sent.hash });
    if (sent.status === "ERROR") {
      logger.error("tx", "Submission rejected", sent.errorResult);
      throw new Error(decodeSubmitError(sent.errorResult));
    }
    hash = sent.hash;
  } catch (error) {
    logger.error("tx", "Submission failed", error);
    throw new EscrowFlowError(EscrowStage.Submit, parseError(error), error);
  }

  // 6) Poll
  try {
    onProgress?.(EscrowStage.Poll);
    const returnValue = await pollTransaction(hash);
    onProgress?.(EscrowStage.Done);
    logger.ok("tx", "Confirmed on-chain", { hash, returnValue });
    return { hash, returnValue };
  } catch (error) {
    logger.error("tx", "Confirmation failed", error);
    throw new EscrowFlowError(EscrowStage.Poll, parseError(error), error);
  }
};

// ---- Read-only calls via simulation (no wallet needed) -------------------

// Valid all-zero ed25519 public key. Read-only simulation needs a *valid*
// strkey as the source, but it does not need to exist on-ledger.
// (The previous value was an invalid strkey, which made `new Account()` throw
// "accountId is invalid" — breaking every dashboard/detail read.)
const SIMULATION_SOURCE =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

const simulateRead = async <T>(method: string, args: xdr.ScVal[]): Promise<T> => {
  const contract = getContract();
  logger.start("read", `simulate ${method}`, { contractId: config.contractId });
  const account = new Account(SIMULATION_SOURCE, "0");
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    logger.error("read", `${method} simulation failed`, sim.error);
    throw new Error(sim.error);
  }
  if (!sim.result?.retval) {
    throw new Error(`No value returned from ${method}.`);
  }
  const value = scValToNative(sim.result.retval) as T;
  logger.ok("read", `${method} ok`, value);
  return value;
};

const normalizeStatus = (value: unknown): EscrowStatus => {
  if (typeof value === "string" && value in EscrowStatus) {
    return value as EscrowStatus;
  }
  if (typeof value === "number") {
    return STATUS_BY_INDEX[value] ?? EscrowStatus.Pending;
  }
  return EscrowStatus.Pending;
};

const mapEscrow = (raw: Record<string, unknown>): Escrow => ({
  id: Number(raw.id),
  buyer: String(raw.buyer),
  seller: String(raw.seller),
  token: String(raw.token),
  amount: String(raw.amount),
  description: String(raw.description),
  status: normalizeStatus(raw.status),
  createdAt: Number(raw.created_at),
});

// All calls target the Escrow contract only. The Escrow contract performs the
// cross-contract calls to the PaymentVault; the frontend never touches it.
export const contractService = {
  createEscrow: (
    signXdr: SignFn,
    source: string,
    input: { seller: string; amount: string; description: string },
    onProgress?: ProgressFn,
  ) =>
    invoke(
      signXdr,
      source,
      "create_escrow",
      [
        addressArg(source),
        addressArg(input.seller),
        i128Arg(input.amount),
        stringArg(input.description),
      ],
      onProgress,
    ),

  deposit: (signXdr: SignFn, source: string, escrowId: number, onProgress?: ProgressFn) =>
    invoke(signXdr, source, "deposit_funds", [u64Arg(escrowId)], onProgress),

  markDelivered: (signXdr: SignFn, source: string, escrowId: number, onProgress?: ProgressFn) =>
    invoke(signXdr, source, "mark_delivered", [u64Arg(escrowId)], onProgress),

  release: (signXdr: SignFn, source: string, escrowId: number, onProgress?: ProgressFn) =>
    invoke(signXdr, source, "release_payment", [u64Arg(escrowId)], onProgress),

  refund: (signXdr: SignFn, source: string, escrowId: number, onProgress?: ProgressFn) =>
    invoke(signXdr, source, "refund_payment", [u64Arg(escrowId)], onProgress),

  getEscrow: async (escrowId: number): Promise<Escrow> => {
    const raw = await simulateRead<Record<string, unknown>>("get_escrow", [
      u64Arg(escrowId),
    ]);
    return mapEscrow(raw);
  },

  listEscrows: async (): Promise<Escrow[]> => {
    const raw = await simulateRead<Record<string, unknown>[]>("list_escrows", []);
    return raw.map(mapEscrow);
  },
};
