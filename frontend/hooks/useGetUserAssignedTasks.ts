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

export function useAssignedTasks(factoryAddress: Address, userAddress?: Address) {
  const publicClient = usePublicClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    data: taskAddresses,
    isLoading: isReadingTasks,
    isError,
    refetch
  } = useReadContract({
    address: factoryAddress,
    abi: TaskFactoryABI,
    functionName: 'getUserAssignedTasks',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  })

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskAddresses || !publicClient) return

      setLoading(true)
      try {
        const detailedTasks = await Promise.all(
          (taskAddresses as Address[]).map(async (taskAddress) => {
            const [
              title,
              poster,
              completer,
              reward,
              deadline,
              description,
              status,
              category,
              submissionDetails
            ] = await Promise.all([
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'category' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'submissionDetails' }),
            ])

            return {
              taskAddress,
              title: title as string,
              poster: poster as Address,
              completer: completer as Address,
              reward: reward as bigint,
              deadline: deadline as bigint,
              description: description as string,
              status: Number(status),
              category: category as string,
              submissionDetails: submissionDetails as string,
            }
          })
        )

        setTasks(detailedTasks)
        setError(null)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to fetch task details')
      } finally {
        setLoading(false)
      }
    }

    if (taskAddresses && !isReadingTasks && !isError) {
      fetchTaskDetails()
    } else if (isError) {
      setLoading(false)
      setError('Failed to fetch assigned task addresses')
    }
  }, [taskAddresses, isReadingTasks, isError, publicClient])

  const refreshAssignedTasks = () => {
    if (factoryAddress && userAddress) {
      refetch()
    }
  }

  return {
    loadingAssignedTasks: loading || isReadingTasks,
    errorAssignedTasks: error,
    tasksAssigned: tasks,
    refreshAssignedTasks,
  }
}
