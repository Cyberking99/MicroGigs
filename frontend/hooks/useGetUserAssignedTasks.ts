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

export function useAssignedTasks(factoryAddress: Address, userAddress: Address | undefined) {
    console.log('useAssignedTasks called with:', factoryAddress, userAddress)
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
          functionName: 'getUserAssignedTasks',
          args: [userAddress],
        })

        console.log('Fetched assigned tasks:', allTasks)

        const fetchedTasks = await Promise.all(
            (allTasks as Address[]).map(async (taskAddress) => {
              const [title, poster, completer, reward, deadline, description, status, category, submissionDetails] = await Promise.all([
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'category' }),
                publicClient?.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'submissionDetails' }),
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
          

        setTasks(fetchedTasks)
        console.log('Fetched the tasks:', fetchedTasks)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [factoryAddress, publicClient, userAddress])

  return { loadingAssignedTasks: loading, errorAssignedTasks: error, tasksAssigned: tasks }
}
