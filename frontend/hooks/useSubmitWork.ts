import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import TaskEscrowABI from "@/lib/abis/TaskEscrow.json";
import { Address } from "viem";
import { useAllTasks } from './useGetAllTasks';
import { useAssignedTasks } from './useGetUserAssignedTasks';
import { useGetUserProfile } from './useGetUserProfile';

export function useSubmitWorkHook(userAddress?: Address) {
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const factoryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

  const { refreshAllTasks } = useAllTasks(factoryAddress);
    const { refreshAssignedTasks } = useAssignedTasks(factoryAddress, userAddress);
    const { refreshProfile } = useGetUserProfile(userAddress);

  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(toastIdRef.current);
      toast.success("Successfully submitted proof for the task!");
      refreshAllTasks();
      refreshAssignedTasks();
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

  const submitWork = async (taskAddress: Address, submissionDetails: string) => {
    if (!userAddress) {
        toast.error("Please connect your wallet to apply for a task.");
        return;
    }

    if (!taskAddress) {
      toast.error("Please select a task to submit proof.");
      return;
    }

    if (!submissionDetails) {
      toast.error("Please provide submission details.");
      return;
    }

    toast.loading("Submitting proof...");
    await writeContract({
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
