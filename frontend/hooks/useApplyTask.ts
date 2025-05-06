import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "react-hot-toast";
import TaskFactoryABI from "@/lib/abis/TaskFactory.json";
import { Address } from "viem";
import { useAllTasks } from './useGetAllTasks';
import { useAssignedTasks } from './useGetUserAssignedTasks';
import { useGetUserProfile } from './useGetUserProfile';

export function useApplyTaskHook(userAddress?: Address) {
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
      toast.success("Successfully applied for the task!");
      refreshAllTasks();
      refreshAssignedTasks();
      refreshProfile();
    } else if (isError && receiptError) {
        toast.dismiss(toastIdRef.current);
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

  const applyTask = async (taskAddress: Address) => {
    if (!userAddress) {
      toast.error("Please connect your wallet to apply for a task.");
      return;
    }

    toast.loading("Applying...");
    await writeContract({
      address: factoryAddress,
      abi: TaskFactoryABI,
      functionName: "applyForTask",
      args: [taskAddress],
    });
  };

  return {
    applyTask,
    isPendingTask: isPending,
    isConfirmingTask: isConfirming,
    isSuccessTask: isSuccess,
  };
}
