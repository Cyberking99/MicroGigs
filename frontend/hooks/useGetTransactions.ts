import { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { Address, decodeEventLog, parseAbiItem } from 'viem'
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

export function useAssignedTasks(factoryAddress: Address, userAddress: Address | undefined) {
  const publicClient = usePublicClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userAddress) return

    const fetchTasksFromEvents = async () => {
      try {
        setLoading(true)

        // Define the ABI item for the event
        const taskAssignedEvent = parseAbiItem(
          'event TaskAssigned(address indexed completer, address taskAddress)'
        )

        // Get logs from the factory contract
        const logs = await publicClient.getLogs({
          address: factoryAddress,
          event: taskAssignedEvent,
          args: {
            completer: userAddress,
          },
          fromBlock: 'earliest', // or a specific block
          toBlock: 'latest',
        })

        // Extract task addresses
        const taskAddresses: Address[] = logs.map(
          log => (log.args as any).taskAddress
        )

        const fetchedTasks = await Promise.all(
          taskAddresses.map(async (taskAddress) => {
            const [title, poster, completer, reward, deadline, description, status] = await Promise.all([
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'title' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskPoster' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'taskCompleter' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'reward' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'deadline' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'description' }),
              publicClient.readContract({ address: taskAddress, abi: TaskEscrowABI, functionName: 'status' }),
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

    fetchTasksFromEvents()
  }, [factoryAddress, publicClient, userAddress])

  return { loadingAssignedTasks: loading, errorAssignedTasks: error, tasksAssigned: tasks }
}
