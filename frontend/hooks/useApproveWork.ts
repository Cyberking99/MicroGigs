import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import TaskEscrowABI from "@/lib/abis/TaskEscrow.json";
import { Address } from "viem";
import { useAllTasks } from './useGetAllTasks';
import { usePostedTasks } from './useGetUserPostedTasks';
import { useGetUserProfile } from './useGetUserProfile';

export function useApproveWorkHook(userAddress?: Address) {
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const factoryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

  const { refreshAllTasks } = useAllTasks(factoryAddress);
      const { refreshPostedTasks } = usePostedTasks(factoryAddress, userAddress);
      const { refreshProfile } = useGetUserProfile(userAddress);

  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(toastIdRef.current);
      toast.success("Successfully approved the work!");
        refreshAllTasks();
        refreshPostedTasks();
        refreshProfile();
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

  const approveWork = async (taskAddress: Address, rating: number) => {
    if (!taskAddress) {
      toast.error("Please select a task to approve the work.");
      return;
    }
    
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }

    toast.loading("Approving work...");
    await writeContract({
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
