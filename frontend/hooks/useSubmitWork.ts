import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import TaskEscrowABI from "@/lib/abis/TaskEscrow.json";
import { Address } from "viem";

export function useSubmitWorkHook() {
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const factoryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(toastIdRef.current);
      toast.success("Successfully submitted proof for the task!");
    } else if (isError && receiptError) {
        toast.dismiss(toastIdRef.current);
        console.error("Transaction error:", receiptError);
      toast.error(`Transaction failed: ${receiptError.message}`);
    }
  }, [isSuccess, isError, receiptError]);

  useEffect(() => {
    if (writeError) {
        console.error("Write error:", writeError);
        toast.dismiss(toastIdRef.current);
      toast.error(`Write failed: ${writeError.message}`);
    }
  }, [writeError]);

  const submitWork = (taskAddress: Address, submissionDetails: string) => {
    toast.loading("Submitting proof...");
    writeContract({
      address: taskAddress,
      abi: TaskEscrowABI,
      functionName: "submitWork",
      args: [submissionDetails],
    });
  };

  return {
    submitWork,
    isPendingSubmit: isPending,
    isConfirmingSubmit: isConfirming,
    isSuccessSubmit: isSuccess,
  };
}
