import { useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TaskFactoryABI from '@/lib/abis/TaskFactory.json';
import { Address, parseEther } from 'viem';
import { toast } from 'react-hot-toast';

export function useCreateTask(factoryAddress: Address) {
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const toastIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(toastIdRef.current);
      toast.success("Task created successfully!");
    } else if (isError && receiptError) {
      toast.dismiss(toastIdRef.current);
      toast.error(`Task creation failed: ${receiptError.message}`);
    }
  }, [isSuccess, isError, receiptError]);

  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError);
      toast.dismiss(toastIdRef.current);
      toast.error(`Write failed: ${writeError.message}`);
    }
  }, [writeError]);

  const createTask = ({
    title,
    description,
    category,
    rewardInEth,
    deadlineInSeconds,
  }: {
    title: string;
    category: string;
    description: string;
    rewardInEth: string;
    deadlineInSeconds: number;
  }) => {
    toastIdRef.current = toast.loading("Creating task...");
    writeContract({
      address: factoryAddress,
      abi: TaskFactoryABI,
      functionName: 'createTask',
      args: [title, description, category, BigInt(deadlineInSeconds)],
      value: parseEther(rewardInEth),
    });
  };

  return {
    createTask,
    isPendingCreate: isPending,
    isConfirmingCreate: isConfirming,
    isSuccessCreate: isSuccess,
    txHash: hash,
  };
}
