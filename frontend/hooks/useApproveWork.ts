import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import TaskEscrowABI from "@/lib/abis/TaskEscrow.json";
import { Address } from "viem";

export function useApproveWorkHook() {
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
      toast.success("Successfully approved the work!");
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

  const approveWork = (taskAddress: Address, rating: number) => {
    toast.loading("Approving work...");
    writeContract({
      address: taskAddress,
      abi: TaskEscrowABI,
      functionName: "releasePayment",
      args: [rating],
    });
  };

  return {
    approveWork,
    isPendingApprove: isPending,
    isConfirmingApprove: isConfirming,
    isSuccessApprove: isSuccess,
  };
}
