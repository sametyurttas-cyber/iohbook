import type { TokenAllocationStatus } from "@/types/database";

export function validateTokenAllocationUpdate(input: {
  status: TokenAllocationStatus;
  txHash: string | null;
}) {
  if (input.status === "sent" && !input.txHash) {
    return "tx-hash-required";
  }

  return null;
}
