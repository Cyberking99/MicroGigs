import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TaskFactoryABI from '@/lib/abis/TaskFactory.json';
import { Address, parseEther } from 'viem';

export function useCreateTask(factoryAddress: Address) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

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
    console.log(parseEther(rewardInEth));
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
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash,
  };
}
