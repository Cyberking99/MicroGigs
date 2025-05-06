import { useEffect, useMemo, useState } from 'react'
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

export function useAllTasks(factoryAddress: Address) {
  const publicClient = usePublicClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data, isError, isLoading, refetch } = useReadContract({
    address: factoryAddress,
    abi: TaskFactoryABI,
    functionName: 'getAllTasks',
    query: { enabled: !!factoryAddress },
  } as const)

  const fetchedTasks = useMemo(() => {
    if (!data) return []
    return (data as Address[]).map((taskAddress) => ({ taskAddress }))
  }, [data])

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (fetchedTasks.length === 0 || !publicClient) return

      try {
        const detailedTasks = await Promise.all(
          fetchedTasks.map(async ({ taskAddress }) => {
            const [title, poster, completer, reward, deadline, description, status, category] = await Promise.all([
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'category' }),
            ])

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
            }
          })
        )

        setTasks(detailedTasks as Task[])
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch task details')
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && !isError) {
      setLoading(true)
      fetchTaskDetails()
    } else if (isError) {
      setTasks([])
      setError('Failed to fetch tasks')
      setLoading(false)
    }
  }, [isLoading, isError, fetchedTasks, publicClient])

  const refreshAllTasks = () => {
    if (factoryAddress) refetch()
  }

  return { tasks, loading, error, taskCount: tasks.length, refreshAllTasks }
}
