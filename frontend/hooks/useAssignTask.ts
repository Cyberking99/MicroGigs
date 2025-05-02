import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TaskFactoryABI from '@/lib/abis/TaskFactory.json';
import { Address } from 'viem';

export function useAssignTask(contractAddress: Address) {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const assign = (completerAddress: Address) => {
    writeContract({
      address: contractAddress,
      abi: TaskFactoryABI,
      functionName: 'assignTask',
      args: [completerAddress],
    });
  };

  return { assign, isPending, isConfirming, isSuccess };
}