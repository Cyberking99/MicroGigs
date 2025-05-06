import { useEffect, useState } from 'react'
import { usePublicClient, useReadContract } from 'wagmi'
import { Address } from 'viem'
import TaskFactoryABI from '@/lib/abis/TaskFactory.json'
import TaskEscrowABI from '@/lib/abis/TaskEscrow.json'

export interface Task {
  taskAddress: Address
  poster: Address
  completer: Address
  reward: bigint
  deadline: bigint
  title: string
  description: string
  status: number
  category?: string
  submissionDetails?: string
}

export function usePostedTasks(factoryAddress: Address, userAddress: Address | undefined) {
    // console.log('useAssignedTasks called with:', factoryAddress, userAddress)
  const publicClient = usePublicClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const contractConfig = {
    address: factoryAddress,
    abi: TaskFactoryABI,
    functionName: 'getUserPostedTasks',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    }
  } as const;

    const { 
        data, 
        isError, 
        isLoading,
        refetch
    } = useReadContract(contractConfig);

    const allTasks = data as Address[] | undefined;
  const taskCount = allTasks ? allTasks.length : 0;
  const fetchedTasks = allTasks ? allTasks.map((taskAddress) => ({
    taskAddress,
    title: '',
    poster: '',
    completer: '',
    reward: BigInt(0),
    deadline: BigInt(0),
    description: '',
    status: 0,
    category: '',
    submissionDetails: '',
  })) : [];

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
  
    if (isError) {
      setLoading(false);
      setError('Failed to fetch tasks');
      setTasks([]);
      return;
    }
  
    if (!data || !Array.isArray(data)) return;
  
    const fetchTaskDetails = async () => {
      try {
        const detailedTasks = await Promise.all(
          (data as Address[]).map(async (taskAddress) => {
            const [title, poster, completer, reward, deadline, description, status, category, submissionDetails] =
              await Promise.all([
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'category' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'submissionDetails' }),
              ]);
  
            return {
              taskAddress,
              title,
              poster,
              completer,
              reward,
              deadline,
              description,
              status,
              category,
              submissionDetails,
            };
          })
        );
  
        setTasks(detailedTasks as any);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setError('Failed to fetch task details');
      }
    };
  
    fetchTaskDetails();
  }, [isLoading, isError, data, publicClient]);
  

  const refreshPostedTasks = () => {
    if (factoryAddress && userAddress) {
      refetch();
    }
  };

  return { loadingAssignedTasks: loading, errorAssignedTasks: error, tasksPosted: tasks, refreshPostedTasks }
}
