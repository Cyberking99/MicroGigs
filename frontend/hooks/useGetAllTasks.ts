import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
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
}

export function useAllTasks(factoryAddress: Address) {
  const publicClient = usePublicClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        
        const allTasks: any = await publicClient?.readContract({
          address: factoryAddress,
          abi: TaskFactoryABI,
          functionName: 'getAllTasks',
        })

        const totalTasks = allTasks.length;

        const taskCount = Number(totalTasks)

        const fetchedTasks = await Promise.all(
          Array.from({ length: taskCount }).map(async (_, i) => {
            const taskAddress = await publicClient?.readContract({
              address: factoryAddress,
              abi: TaskFactoryABI,
              functionName: 'tasks',
              args: [i],
            }) as Address

            const [title, poster, completer, reward, deadline, description, status, category] = await Promise.all([
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
              publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'category' }),
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
            }
          })
        )

        setTasks(fetchedTasks)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [factoryAddress, publicClient])

  return { tasks, loading, error }
}
