import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Address } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";

import { getErrorMessage } from "../lib/errors";

type TxRequest = {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

type TxMessages = {
  pending: string;
  success: string;
};

export function useContractTx() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(
    async (request: TxRequest, messages: TxMessages) => {
      if (!publicClient) {
        throw new Error("No public client available");
      }

      const toastId = `tx-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setIsPending(true);

      try {
        toast.loading(messages.pending, { id: toastId });

        const hash = await writeContractAsync(request as never);

        toast.loading("Waiting for confirmation...", { id: toastId });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status !== "success") {
          throw new Error("Transaction reverted");
        }

        toast.success(messages.success, {
          id: toastId,
          description: "View the transaction on Sepolia Etherscan.",
        });

        await queryClient.invalidateQueries();

        return { hash, receipt };
      } catch (error) {
        toast.error("Transaction failed", {
          id: toastId,
          description: getErrorMessage(error),
        });
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [publicClient, queryClient, writeContractAsync],
  );

  return { execute, isPending };
}
