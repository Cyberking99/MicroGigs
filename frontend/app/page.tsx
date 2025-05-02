"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { Plus, Check, ArrowRight, X, Filter, Award, Send, User } from "lucide-react"
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit"
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction"
import { useNotification } from "@coinbase/onchainkit/minikit"
import { useCreateTask } from '@/hooks/useCreateTask';
import { useAllTasks } from '@/hooks/useGetAllTasks';

export default function MicroGigs() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const [frameAdded, setFrameAdded] = useState(false)
  const [activeTab, setActiveTab] = useState("browse") // browse, my-tasks, create, profile
  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()
  const sendNotification = useNotification()
  const { address } = useAccount()
  const { createTask, isPending, isConfirming, isSuccess } = useCreateTask(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`);
  const { tasks, loading, error } = useAllTasks(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`)

  const [connected, setConnected] = useState(false)
  const [walletBalance, setWalletBalance] = useState("0.45")
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showSubmitWork, setShowSubmitWork] = useState(false)
  const [workSubmission, setWorkSubmission] = useState("")
  const [categories] = useState(["all", "design", "development", "content", "marketing"])

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame()
    setFrameAdded(Boolean(frameAdded))
  }, [addFrame])

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="flex items-center text-xs px-2 py-1 bg-zinc-800 rounded-full text-blue-500"
        >
          <Plus className="w-3 h-3 mr-1" />
          Save Frame
        </button>
      )
    }

    if (frameAdded) {
      return (
        <div className="flex items-center text-xs px-2 py-1 bg-zinc-800 rounded-full text-green-500">
          <Check className="w-3 h-3 mr-1" />
          <span>Saved</span>
        </div>
      )
    }

    return null
  }, [context, frameAdded, handleAddFrame])

  const calls = useMemo(
    () =>
      address
        ? [
            {
              to: address,
              data: "0x" as `0x${string}`,
              value: BigInt(0),
            },
          ]
        : [],
    [address],
  )
  
  const handleTransactionSuccess = useCallback(
    async (response: any) => {
      const transactionHash = response.transactionReceipts[0].transactionHash
      console.log(`Transaction successful: ${transactionHash}`)

      await sendNotification({
        title: "Transaction Successful!",
        body: `Your transaction was completed: ${transactionHash.substring(0, 10)}...`,
      })
      
      setWalletBalance((prev) => (Number.parseFloat(prev) - 0.001).toFixed(3))
    },
    [sendNotification],
  )

  const [tasksA, setTasks] = useState([
    {
      id: 1,
      title: "Design Logo for DeFi Project",
      budget: "0.05 ETH",
      status: "open",
      applied: false,
      category: "design",
      description:
        "Looking for a talented designer to create a modern, professional logo for our new DeFi platform. The logo should convey trust, innovation, and financial growth.",
      deadline: "2 days",
      poster: "0x1a2b...3c4d",
      posterRating: 4.8,
    },
    {
      id: 2,
      title: "Smart Contract Audit",
      budget: "0.2 ETH",
      status: "open",
      applied: false,
      category: "development",
      description:
        "Need an experienced developer to audit our smart contract for security vulnerabilities and optimization opportunities before mainnet deployment.",
      deadline: "5 days",
      poster: "0x5e6f...7g8h",
      posterRating: 4.9,
    },
    {
      id: 3,
      title: "Write Web3 Tutorial",
      budget: "0.08 ETH",
      status: "open",
      applied: false,
      category: "content",
      description:
        "Create a beginner-friendly tutorial explaining how to interact with our DApp. Should include step-by-step instructions with code examples.",
      deadline: "3 days",
      poster: "0x9i0j...1k2l",
      posterRating: 4.7,
    },
    {
      id: 6,
      title: "Social Media Campaign",
      budget: "0.12 ETH",
      status: "open",
      applied: false,
      category: "marketing",
      description:
        "Design and execute a social media campaign to promote our NFT launch across Twitter, Discord, and Telegram.",
      deadline: "7 days",
      poster: "0x7q8r...9s0t",
      posterRating: 4.5,
    },
  ])

  const [myTasks, setMyTasks] = useState([
    {
      id: 4,
      title: "Create NFT Collection",
      budget: "0.15 ETH",
      status: "in-progress",
      category: "design",
      description:
        "Create a collection of 10 unique NFT artworks with a cyberpunk theme for our upcoming marketplace launch.",
      deadline: "4 days remaining",
      poster: "0x3m4n...5o6p",
      posterRating: 4.6,
      progress: 60,
    },
    {
      id: 5,
      title: "Community Management",
      budget: "0.1 ETH",
      status: "completed",
      category: "marketing",
      description: "Manage our Discord community, moderate discussions, and organize weekly AMAs with the team.",
      deadline: "Completed",
      poster: "0x7q8r...9s0t",
      posterRating: 4.5,
      progress: 100,
    },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskBudget, setNewTaskBudget] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")

  const [transactions] = useState([
    { type: "Task Completed", name: "Community Management", amount: "+0.1 ETH", timestamp: "2 days ago" },
    { type: "Task Created", name: "Create NFT Collection", amount: "-0.15 ETH", timestamp: "1 week ago" },
    { type: "Deposit", name: "Wallet Funding", amount: "+0.5 ETH", timestamp: "2 weeks ago" },
  ])

  const [userStats] = useState({
    tasksCompleted: 12,
    tasksPosted: 8,
    totalEarned: "1.45 ETH",
    totalSpent: "1.2 ETH",
    rating: 4.9,
    reviews: 15,
    memberSince: "March 2025",
  })

  const handleApply = (id: any) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, applied: !task.applied } : task)))
    // Simulate wallet transaction
    if (!tasks.find((t: any) => t.id === id)?.applied) {
      setWalletBalance((Number.parseFloat(walletBalance) - 0.001).toFixed(3))
    }
  }

  const handleAddTask = () => {
    if (
      newTaskTitle.trim() &&
      newTaskBudget.trim() &&
      newTaskCategory.trim() &&
      newTaskDescription.trim() &&
      newTaskDeadline.trim()
    ) {
      const rewardEth = newTaskBudget.split(" ")[0]; // Extract just the number (assumes "0.01 ETH")
      const deadlineInSeconds = parseInt(newTaskDeadline); // Or compute from date input

      try {
        console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
        createTask({
          title: newTaskTitle,
          description: newTaskDescription,
          category: newTaskCategory,
          rewardInEth: rewardEth,
          deadlineInSeconds,
        });

        // if(isSuccess) {
        setTimeout(() => {
          sendNotification({
            title: "Task Created!",
            body: `Your task "${newTaskTitle}" has been created successfully.`,
          });
        
          setActiveTab("browse");

          setNewTaskTitle("");
          setNewTaskBudget("");
          setNewTaskCategory("");
          setNewTaskDescription("");
          setNewTaskDeadline("");
        }, 5000);
        // }
      } catch (err) {
        console.error("Error creating task:", err);
      }
    }
  }

  const handleSubmitWork = (taskId: any) => {
    if (workSubmission.trim()) {
      setMyTasks(
        myTasks.map((task) =>
          task.id === taskId ? { ...task, status: "pending-approval", submission: workSubmission } : task,
        ),
      )
      setShowSubmitWork(false)
      setWorkSubmission("")
    }
  }

  const handleApproveWork = (taskId: any) => {
    setMyTasks(myTasks.map((task) => (task.id === taskId ? { ...task, status: "completed", progress: 100 } : task)))

    // Simulate wallet transaction
    const task = myTasks.find((t) => t.id === taskId)
    if (task) {
      setWalletBalance((Number.parseFloat(walletBalance) + Number.parseFloat(task.budget.split(" ")[0])).toFixed(3))
    }
  }

  useEffect(() => {
    if (address) {
      setConnected(true)
    }
  }, [address])

  const filteredTasks = selectedCategory === "all" ? tasks : tasks.filter((task) => task.category === selectedCategory)
  console.log(tasks);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="w-full max-w-md p-6">
        <Wallet className="z-10">
              <ConnectWallet>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mb-8">
            Connect Wallet
          </button>
          </ConnectWallet>
          </Wallet>

          <div className="border border-zinc-800 rounded-lg mb-6">
            <div className="border-b border-zinc-800 p-4">
              <h1 className="text-xl font-medium">MicroGigs</h1>
            </div>
            <div className="p-4">
              <p className="text-sm text-zinc-400 mb-4">
                A decentralized marketplace for small tasks built with blockchain technology.
              </p>
              <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Features
              </button>
            </div>
          </div>

          <div className="border border-zinc-800 rounded-lg mb-6">
            <div className="border-b border-zinc-800 p-4">
              <h2 className="text-lg font-medium">Make Your First Transaction</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-zinc-400 mb-4">
                Experience the power of seamless blockchain transactions with secure smart contract escrow.
              </p>
              <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                Connect your wallet to send a transaction
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500 mt-4">Built on Base with MiniKit</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium">MicroGigs</h1>
          <div className="flex items-center gap-3">
          <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
          </div>
        </div>

        {saveFrameButton && <div className="flex justify-end mb-2">{saveFrameButton}</div>}

        <div className="border border-zinc-800 rounded-lg mb-6">
          <div className="border-b border-zinc-800 p-4">
            <div className="flex space-x-4">
              <button
                className={`text-sm font-medium ${activeTab === "browse" ? "text-blue-500" : "text-zinc-400"}`}
                onClick={() => setActiveTab("browse")}
              >
                Browse
              </button>
              <button
                className={`text-sm font-medium ${activeTab === "my-tasks" ? "text-blue-500" : "text-zinc-400"}`}
                onClick={() => setActiveTab("my-tasks")}
              >
                My Tasks
              </button>
              <button
                className={`text-sm font-medium ${activeTab === "create" ? "text-blue-500" : "text-zinc-400"}`}
                onClick={() => setActiveTab("create")}
              >
                Create
              </button>
              <button
                className={`text-sm font-medium ${activeTab === "profile" ? "text-blue-500" : "text-zinc-400"}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
            </div>
          </div>

          {activeTab === "browse" && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Available Gigs</div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 pr-8 text-xs"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2 top-1.5 w-3 h-3 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="cursor-pointer flex-1" onClick={() => setSelectedTask(task)}>
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-zinc-400">{task.budget}</div>
                        <div className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                          {task.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApply(task.id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        task.applied ? "bg-green-900 text-green-500" : "bg-blue-900 text-blue-500"
                      }`}
                    >
                      {task.applied ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "my-tasks" && (
            <div className="p-4">
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div key={task.id} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-zinc-400">{task.budget}</div>
                          <div className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                            {task.category}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-900 text-green-500"
                            : task.status === "in-progress"
                              ? "bg-amber-900 text-amber-500"
                              : task.status === "pending-approval"
                                ? "bg-purple-900 text-purple-500"
                                : "bg-blue-900 text-blue-500"
                        }`}
                      >
                        {task.status === "completed"
                          ? "Completed"
                          : task.status === "in-progress"
                            ? "In Progress"
                            : task.status === "pending-approval"
                              ? "Pending"
                              : "Open"}
                      </div>
                    </div>

                    {task.status === "in-progress" && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="w-full max-w-[180px] bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => {
                            setShowSubmitWork(true)
                            setSelectedTask(task)
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        >
                          Submit Work
                        </button>
                      </div>
                    )}

                    {task.status === "pending-approval" && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleApproveWork(task.id)}
                          className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                        >
                          Approve & Pay
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Describe your task..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Budget (ETH)</label>
                    <input
                      type="text"
                      value={newTaskBudget}
                      onChange={(e) => setNewTaskBudget(e.target.value)}
                      placeholder="0.00 ETH"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      {categories
                        .filter((c) => c !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Provide details about the task..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Deadline</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="e.g., 5 days"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleAddTask}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Create & Fund Gig
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="font-medium">0x1a2b...3c4d</div>
                <div className="text-xs text-zinc-400">Member since {userStats.memberSince}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span className="text-sm">{userStats.rating}</span>
                  <span className="text-xs text-zinc-400">({userStats.reviews} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-zinc-900 p-3 rounded-md text-center">
                  <div className="text-xs text-zinc-400 mb-1">Tasks Completed</div>
                  <div className="font-medium">{userStats.tasksCompleted}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-md text-center">
                  <div className="text-xs text-zinc-400 mb-1">Tasks Posted</div>
                  <div className="font-medium">{userStats.tasksPosted}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 p-3 rounded-md text-center">
                  <div className="text-xs text-zinc-400 mb-1">Total Earned</div>
                  <div className="font-medium text-green-500">{userStats.totalEarned}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-md text-center">
                  <div className="text-xs text-zinc-400 mb-1">Total Spent</div>
                  <div className="font-medium text-red-500">{userStats.totalSpent}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border border-zinc-800 rounded-lg mb-6">
          <div className="border-b border-zinc-800 p-4">
            <h2 className="text-lg font-medium">Transaction History</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{tx.type}</div>
                    <div className="text-xs text-zinc-400">{tx.name}</div>
                    <div className="text-xs text-zinc-500">{tx.timestamp}</div>
                  </div>
                  <div className={`text-sm ${tx.amount.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-zinc-500 mt-4">Built on Base with MiniKit</div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="border-b border-zinc-800 p-4 flex justify-between items-center">
              <h3 className="font-medium">Task Details</h3>
              <button onClick={() => setSelectedTask(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-lg font-medium">{selectedTask.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-sm font-medium text-amber-500">{selectedTask.budget}</div>
                  <div className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                    {selectedTask.category}
                  </div>
                  <div className="text-xs text-zinc-400">{selectedTask.deadline}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-zinc-400 mb-1">Description</div>
                <p className="text-sm">{selectedTask.description}</p>
              </div>

              <div>
                <div className="text-xs text-zinc-400 mb-1">Posted by</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">{selectedTask.poster}</div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" />
                    <span className="text-xs">{selectedTask.posterRating}</span>
                  </div>
                </div>
              </div>

              {selectedTask.status === "in-progress" && (
                <div>
                  <div className="text-xs text-zinc-400 mb-1">Progress</div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-zinc-400 mt-1">{selectedTask.progress}%</div>
                </div>
              )}

              {selectedTask.status === "completed" && (
                <div className="bg-green-900 text-green-500 p-3 rounded-md text-center text-sm">
                  This task has been completed
                </div>
              )}

              {selectedTask.status === "pending-approval" && (
                <div className="bg-purple-900 text-purple-500 p-3 rounded-md text-center text-sm">
                  Waiting for approval
                </div>
              )}

              <div className="flex justify-end pt-2">
                {selectedTask.status === "open" && !selectedTask.applied && (
                  <button
                    onClick={() => {
                      handleApply(selectedTask.id)
                      setSelectedTask(null)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Apply for this Gig
                  </button>
                )}

                {selectedTask.status === "in-progress" && (
                  <button
                    onClick={() => {
                      setShowSubmitWork(true)
                      setSelectedTask(null)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Submit Work
                  </button>
                )}

                {selectedTask.status === "pending-approval" && (
                  <button
                    onClick={() => {
                      handleApproveWork(selectedTask.id)
                      setSelectedTask(null)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Approve & Pay
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Modal */}
      {showSubmitWork && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="border-b border-zinc-800 p-4 flex justify-between items-center">
              <h3 className="font-medium">Submit Work</h3>
              <button onClick={() => setShowSubmitWork(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Work Submission</label>
                <textarea
                  value={workSubmission}
                  onChange={(e) => setWorkSubmission(e.target.value)}
                  placeholder="Describe your work and provide any relevant links..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSubmitWork(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSubmitWork(selectedTask.id)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
