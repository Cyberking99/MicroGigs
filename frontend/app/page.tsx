"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useAccount, useConnect } from "wagmi"
import { Plus, Check, ArrowRight, X, Filter, Award, Send, User } from "lucide-react"
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit"
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"
import { toast } from "react-hot-toast";
import { convertDate, taskStatus } from "@/lib/utils"
import { useNotification } from "@coinbase/onchainkit/minikit"
import { useCreateTask } from '@/hooks/useCreateTask';
import { useAllTasks } from '@/hooks/useGetAllTasks';
import { usePostedTasks } from '@/hooks/useGetUserPostedTasks';
import { useAssignedTasks } from "@/hooks/useGetUserAssignedTasks"
import { useApplyTaskHook } from "@/hooks/useApplyTask";
import { useGetUserProfile } from "@/hooks/useGetUserProfile";
import { useSubmitWorkHook } from "@/hooks/useSubmitWork";
import { useApproveWorkHook } from "@/hooks/useApproveWork";
import { MicroGigsLogo } from "../components/logo"
import { SplashScreen } from "../components/splash-screen"

interface Task {
  taskAddress: string;
  completer?: string;
  poster?: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  deadline: string;
  status: string;
  submissionDetails?: string;
  posterRating?: number;
}

export default function MicroGigs() {
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(false)
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    const search = window.location.search
    const isFC = search.includes('fc_user') || search.includes('frame_id')
    const isFrame = window !== window.parent

    setIsFarcasterFrame(isFC)
    setIsEmbedded(isFrame)

    console.log(isFC, isFrame);
    if (isFC || isFrame) {
      setShowSplash(false)
    }
  }, [])


  const [showSplash, setShowSplash] = useState(true)

  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const [frameAdded, setFrameAdded] = useState(false)
  const [activeTab, setActiveTab] = useState("browse") // browse, my-tasks, create, profile
  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()
  const sendNotification = useNotification()
  
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const factoryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

  const { createTask, isPendingCreate, isConfirmingCreate, isSuccessCreate } = useCreateTask(factoryAddress,  (address as `0x${string}`) || undefined);
  const { tasks, loading, error, refreshAllTasks } = useAllTasks(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`)
  const { tasksPosted, refreshPostedTasks } = usePostedTasks(factoryAddress,  address);
  const { tasksAssigned, refreshAssignedTasks } = useAssignedTasks(factoryAddress,  address);
  const { profile, profileLoading, profileError, refreshProfile } = useGetUserProfile(address);
  const { applyTask, isPendingTask, isSuccessTask, isConfirmingTask } = useApplyTaskHook(address);
  const { submitWork, isPendingSubmit, isConfirmingSubmit, isSuccessSubmit } = useSubmitWorkHook(address);
  const { approveWork, isPendingApprove, isConfirmingApprove, isSuccessApprove } = useApproveWorkHook(address);

  const [connected, setConnected] = useState(false)
  
  const [myTasks, setMyTasks] = useState(tasksPosted)
  const [myAssignedTasks, setMyAssignedTasks] = useState(tasksAssigned)
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const [categories] = useState(["all", "design", "development", "content", "marketing"])
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  const [showSubmitWork, setShowSubmitWork] = useState(false)
  const [showSubmittedWork, setShowSubmittedWork] = useState(false)
  const [workSubmission, setWorkSubmission] = useState("")

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

  useEffect(() => {
    setMyTasks(tasksPosted)
    setMyAssignedTasks(tasksAssigned)
  }, [tasks, tasksPosted, tasksAssigned])

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskBudget, setNewTaskBudget] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [taskRating, setTaskRating] = useState(1)

  // const [transactions] = useState([
  //   { type: "Task Completed", name: "Community Management", amount: "+0.1 ETH", timestamp: "2 days ago" },
  //   { type: "Task Created", name: "Create NFT Collection", amount: "-0.15 ETH", timestamp: "1 week ago" },
  //   { type: "Deposit", name: "Wallet Funding", amount: "+0.5 ETH", timestamp: "2 weeks ago" },
  // ])

  const handleAddTask = async () => {
    if (
      newTaskTitle.trim() &&
      newTaskBudget.trim() &&
      newTaskCategory.trim() &&
      newTaskDescription.trim() &&
      newTaskDeadline.trim()
    ) {
      const rewardEth = newTaskBudget.split(" ")[0];
      const deadlineInDays = parseInt(newTaskDeadline);
      const deadlineInSeconds = deadlineInDays * 86400;
  
      try {
        await createTask({
          title: newTaskTitle,
          description: newTaskDescription,
          category: newTaskCategory,
          rewardInEth: rewardEth,
          deadlineInSeconds,
        });
        
          sendNotification({
            title: "Task Created!",
            body: `Your task "${newTaskTitle}" has been created successfully.`,
          });
  
          setNewTaskTitle("");
          setNewTaskBudget("");
          setNewTaskCategory("");
          setNewTaskDescription("");
          setNewTaskDeadline("");

          // refreshProfile();
          // refreshAllTasks();
      } catch (err) {
        console.error("Error creating task:", err);
        toast.error("An error occurred while submitting the task.");
      }
    } else {
      toast.error("Please fill in all fields before submitting.");
    }
  };

  const handleSubmitWork = (taskAddress: any) => {
    console.log("Submitting work for task:", taskAddress)
    if (workSubmission.trim()) {
      submitWork(taskAddress, workSubmission);
      if (isSuccessSubmit) {
        setShowSubmitWork(false)
        setWorkSubmission("")
      }
    }
  }

  const handleApproveWork = (taskAddress: any) => {
    try {
      approveWork(taskAddress, taskRating);
      if (isSuccessApprove) {
        setShowSubmittedWork(false)
        setWorkSubmission("")
      }
    } catch (err) {
      console.error("Error approving work:", err);
      toast.error("An error occurred while approving the work.");
    }
  }

  useEffect(() => {
    if (address) {
      setConnected(true)
    }
  }, [address]);

  setInterval(() => {
    if(address && factoryAddress) {
      refreshPostedTasks()
      refreshAssignedTasks()
      refreshProfile()
    }
  }, 5000);

  const filteredTasks = selectedCategory === "all" ? tasks : tasks.filter((task) => task.category === selectedCategory)
  // console.log(tasks);
  // console.log(profile);
  // console.log(myTasks);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="w-full max-w-md p-6">
          <>
        {(isFarcasterFrame || isEmbedded) && !isConnected ? (
              <div className="relative w-fit shrink-0 mini-app-theme-dark z-10"><div><div className="flex"><button type="button" onClick={() => connect({ connector: connectors[0] })} className="cursor-pointer ock-bg-primary active:bg-[var(--ock-bg-primary-active)] hover:bg-[var(--ock-bg-primary-hover)] ock-border-radius ock-font-family font-semibold ock-text-inverse inline-flex min-w-[153px] items-center justify-center px-4 py-3"><span className="ock-text-inverse">Connect Wallet</span></button></div></div></div>
            ) : (
          <Wallet className="z-10 mb-6 flex items-center">
            <ConnectWallet className="flex items-center">
              <span className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md mb-8">
                Connect Wallet
              </span>
            </ConnectWallet>
          </Wallet>
            )}
          </>

          <div className="border border-zinc-800 rounded-lg mb-6">
            <div className="border-b border-zinc-800 p-4">
              <h1 className="text-xl font-medium">MicroGigs</h1>
            </div>
            <div className="p-4">
              <p className="text-sm text-zinc-400 mb-4">
                A decentralized marketplace for small tasks.
              </p>
              {/* <span className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore Features
              </span> */}
            </div>
          </div>

          <div className="border border-zinc-800 rounded-lg mb-6">
            <div className="border-b border-zinc-800 p-4">
              <h2 className="text-lg font-medium">Features</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-zinc-400 mb-4">
                Experience the power of seamless blockchain transactions with secure smart contract escrow.
              </p>
              <ul className="list-disc list-inside mb-4">
                <li className="text-sm text-zinc-400">Create and fund tasks with ease.</li>
                <li className="text-sm text-zinc-400">Apply for tasks and get paid securely.</li>
                <li className="text-sm text-zinc-400">Rate and review your experience.</li>
              </ul>
              <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                Connect your wallet to get started
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
            <>
            {(isFarcasterFrame || isEmbedded) && isConnected ? (
              <div className="relative w-fit shrink-0 mini-app-theme-dark z-10"><div><div className="flex gap-4"><button type="button" className="cursor-pointer ock-bg-secondary active:bg-[var(--ock-bg-secondary-active)] hover:bg-[var(--ock-bg-secondary-hover)] ock-border-radius ock-text-foreground px-4 py-3"><div className="flex items-center justify-center gap-2"><div className="flex items-center gap-1"><span className="ock-font-family font-semibold ock-text-foreground text-inherit">{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ""}</span></div></div></button></div></div></div>
            ) : (
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
            )}
            </>
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
                className={`text-sm font-medium ${activeTab === "tasks-applied" ? "text-blue-500" : "text-zinc-400"}`}
                onClick={() => setActiveTab("tasks-applied")}
              >
                Tasks Applied
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
                  <>
                  {taskStatus(task.status) === "OPEN" && (
                  <div
                    key={task.taskAddress}
                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="cursor-pointer flex-1" onClick={() => setSelectedTask((task as any))}>
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-zinc-400">{Number(task.reward.toString()) / 10e18} ETH</div>
                        <div className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                          {task.category}
                        </div>
                      </div>
                    </div>
                    {/* <button
                      onClick={() => handleApply(task.taskAddress)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${taskStatus(task.status) == "COMPLETED" ? "bg-green-900 text-green-500" : "bg-blue-900 text-blue-500"
                        }`}
                    >
                      {task.applied ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button> */}
                  </div>
                  )}
                  </>
                ))}
              </div>
            </div>
          )}

          {activeTab === "my-tasks" && (
            <div className="p-4">
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div key={task.taskAddress} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedTask((task as any))}
                    >
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-zinc-400">{Number(task.reward.toString()) / 10e18} ETH</div>
                          <div className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                            {task.category}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${taskStatus(task.status) === "COMPLETED"
                            ? "bg-green-900 text-green-500"
                            : taskStatus(task.status) === "ASSIGNED"
                              ? "bg-amber-900 text-amber-500"
                              : "bg-blue-900 text-blue-500"
                          }`}
                      >
                        {taskStatus(task.status) === "COMPLETED"
                          ? "Completed"
                          : taskStatus(task.status) === "ASSIGNED"
                            ? "In Progress"
                            : "Open"}
                      </div>
                    </div>

                    {(taskStatus(task.status) === "SUBMITTED") && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="w-full max-w-[180px] bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`"bg-amber-500 h-full rounded-full"`}
                            style={{ width: `100%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => {
                            setShowSubmittedWork(true)
                            setSelectedTask((task as any))
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        >
                          See Submission
                        </button>
                      </div>
                    )}

                    {taskStatus(task.status) === "SUBMITTED" && task.poster == address && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => setShowSubmittedWork(true)}
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

          {activeTab === "tasks-applied" && (
            <div className="p-4">
              <div className="space-y-3">
                {myAssignedTasks.map((task) => (
                  <div key={task.taskAddress} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedTask((task as any))}
                    >
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-zinc-400">{Number(task.reward.toString()) / 10e18} ETH</div>
                          <div className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                            {task.category}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${(taskStatus(task.status) === "COMPLETED" || taskStatus(task.status) === "SUBMITTED")
                            ? "bg-green-900 text-green-500"
                            : taskStatus(task.status) === "ASSIGNED"
                              ? "bg-amber-900 text-amber-500"
                              : "bg-blue-900 text-blue-500"
                          }`}
                      >
                        {taskStatus(task.status) === "COMPLETED"
                          ? "Completed"
                          : taskStatus(task.status) === "ASSIGNED"
                            ? "In Progress"
                            : taskStatus(task.status) === "SUBMITTED"
                              ? "Submitted"
                            : "Open"}
                      </div>
                    </div>

                    {(taskStatus(task.status) === "ASSIGNED" || taskStatus(task.status) === "IN_PROGRESS" ) && task.completer == address && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="w-full max-w-[180px] bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`"bg-amber-500 h-full rounded-full"`}
                            style={{ width: `100%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTask((task as any))
                            setShowSubmitWork(true)
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                        >
                          Submit Work
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
                  disabled={isPendingCreate || isConfirmingCreate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  {isPendingCreate || isConfirmingCreate ? "Creating..." : "Create & Fund Gig"}
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
                <div className="font-medium">
                  {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Not Connected"}
                </div>
                <div className="text-xs text-zinc-400">Member since {profile?.memberSince}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span className="text-sm">{profile?.averageRating}</span>
                  <span className="text-xs text-zinc-400">({profile?.ratingsCount} reviews)</span>
                </div>
              </div>

              {/* Profile loading state */}
              {profileLoading && (
                <div className="text-center py-4 text-zinc-400">
                  <div className="text-sm">Loading profile data...</div>
                </div>
              )}

              {/* Profile error state */}
              {profileError && (
                <div className="text-center py-4 text-red-500">
                  <div className="text-sm">Failed to load profile data</div>
                </div>
              )}

              {/* Profile stats */}
              {!profileLoading && !profileError && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-900 p-3 rounded-md text-center">
                      <div className="text-xs text-zinc-400 mb-1">Tasks Completed</div>
                      <div className="font-medium">{profile?.tasksCompleted}</div>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded-md text-center">
                      <div className="text-xs text-zinc-400 mb-1">Tasks Posted</div>
                      <div className="font-medium">{profile?.tasksPosted}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-900 p-3 rounded-md text-center">
                      <div className="text-xs text-zinc-400 mb-1">Total Earned</div>
                      <div className="font-medium text-green-500">{profile?.totalEarned}</div>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded-md text-center">
                      <div className="text-xs text-zinc-400 mb-1">Total Spent</div>
                      <div className="font-medium text-red-500">{profile?.totalSpent}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-xs text-zinc-500 mt-4">Built on Base with MiniKit</div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <>
        {/* {console.log("Completer:", selectedTask.completer, "Current Address:", address)} */}
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
                  <div className="text-sm font-medium text-amber-500">{Number(selectedTask.reward.toString()) / 10e18} ETH</div>
                  <div className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                    {selectedTask.category}
                  </div>
                  <div className="text-xs text-zinc-400">{convertDate(selectedTask.deadline)}</div>
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

              {taskStatus(Number(selectedTask.status)) === "ASSIGNED" && (
                <div>
                  {/* <div className="text-xs text-zinc-400 mb-1">Progress</div> */}
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `100%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-zinc-400 mt-1"></div>
                </div>
              )}

              {taskStatus(Number(selectedTask.status)) === "COMPLETED" && (
                <div className="bg-green-900 text-green-500 p-3 rounded-md text-center text-sm">
                  This task has been completed
                </div>
              )}

              {/* {taskStatus(selectedTask.status) === "pending-approval" && (
                <div className="bg-purple-900 text-purple-500 p-3 rounded-md text-center text-sm">
                  Waiting for approval
                </div>
              )} */}

              <div className="flex justify-end pt-2">
                {taskStatus(Number(selectedTask.status)) === "OPEN" && selectedTask.poster !== address && (
                  <button
                    onClick={() => {
                      applyTask((selectedTask.taskAddress as any));
                    }}
                    disabled={isPendingTask || isConfirmingTask}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    {isPendingTask || isConfirmingTask ? "Applying..." : "Apply for this Gig"}
                  </button>
                )}

                {(taskStatus(Number(selectedTask.status)) === "ASSIGNED" || taskStatus(Number(selectedTask.status)) === "IN_PROGRESS" ) && selectedTask.completer == address && (
                  <button
                    onClick={() => {
                      setShowSubmitWork(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Submit Work
                  </button>
                )}

                {/* {taskStatus(selectedTask.status) === "pending-approval" && (
                  <button
                    onClick={() => {
                      handleApproveWork(selectedTask.id)
                      setSelectedTask(null)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  >
                    Approve & Pay
                  </button>
                )} */}
              </div>
            </div>
          </div>
        </div>

        </>
      )}

      {/* Submitted Work Modal */}
      {showSubmittedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="border-b border-zinc-800 p-4 flex justify-between items-center">
              <h3 className="font-medium">Submitted Work</h3>
              <button onClick={() => setShowSubmittedWork(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Work Submission</label>
                <textarea
                  value={selectedTask?.submissionDetails}
                  readOnly
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rating (1-5)</label>
                <input 
                  type="number"
                  value={taskRating}
                  max="5"
                  min="1"
                  onChange={(e) => setTaskRating(Number(e.target.value))}
                  placeholder="Rate the task between 1-5"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSubmittedWork(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                >
                  Close
                </button>
                {taskStatus(Number(selectedTask?.status)) === "SUBMITTED" && selectedTask?.poster == address && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleApproveWork(selectedTask?.taskAddress)}
                      disabled={isPendingApprove || isConfirmingApprove}
                      className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                    >
                      {isPendingApprove || isConfirmingApprove ? "Approving..." : "Approve & Pay"}
                    </button>
                  </div>
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
                    handleSubmitWork(selectedTask?.taskAddress)
                  }}
                  disabled={isPendingSubmit || isConfirmingSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isPendingSubmit || isConfirmingSubmit ? "Submitting..." : "Submit Work"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
