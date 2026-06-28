/** Ordered stages of the escrow creation / action pipeline. */
export enum EscrowStage {
  Validate = "validate",
  Wallet = "wallet",
  Build = "build",
  Simulate = "simulate",
  Prepare = "prepare",
  Sign = "sign",
  Submit = "submit",
  Poll = "poll",
  Done = "done",
}

export const STAGE_LABELS: Record<EscrowStage, string> = {
  [EscrowStage.Validate]: "Validating inputs",
  [EscrowStage.Wallet]: "Checking wallet",
  [EscrowStage.Build]: "Building transaction",
  [EscrowStage.Simulate]: "Simulating transaction",
  [EscrowStage.Prepare]: "Preparing transaction",
  [EscrowStage.Sign]: "Awaiting signature",
  [EscrowStage.Submit]: "Submitting transaction",
  [EscrowStage.Poll]: "Confirming on-chain",
  [EscrowStage.Done]: "Done",
};

export const PIPELINE_STAGES: EscrowStage[] = [
  EscrowStage.Build,
  EscrowStage.Simulate,
  EscrowStage.Prepare,
  EscrowStage.Sign,
  EscrowStage.Submit,
  EscrowStage.Poll,
];
