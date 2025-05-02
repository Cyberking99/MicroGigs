import { useReadContract } from 'wagmi';
import TaskFactoryABI from '@/lib/abis/TaskFactory.json';
import { Address } from 'viem';

export function useTaskStatus(contractAddress: Address) {
  return useReadContract({
    address: contractAddress,
    abi: TaskFactoryABI,
    functionName: 'status',
  });
}