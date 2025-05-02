"use client"

import type React from "react"

import { type ReactNode, useCallback, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  type TransactionError,
  type TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction"
import { useNotification } from "@coinbase/onchainkit/minikit"

type ButtonProps = {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  icon?: ReactNode
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none"

  const variantClasses = {
    primary: "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary: "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline: "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost: "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  }

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  )
}

type CardProps = {
  title?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ title, children, className = "", onClick }: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right" | "x" | "filter" | "award" | "send" | "user" | "wallet"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    x: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Close</title>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    filter: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Filter</title>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    award: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Award</title>
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    send: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Send</title>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    user: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>User</title>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    wallet: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Wallet</title>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
    ),
  }

  return <span className={`inline-block ${sizeClasses[size]} ${className}`}>{icons[name]}</span>
}

type Task = {
  id: number
  title: string
  budget: string
  status: string
  applied?: boolean
  category: string
  description: string
  deadline: string
  poster: string
  posterRating: number
  progress?: number
  submission?: string
}

type MicroGigsHomeProps = {
  setActiveTab: (tab: string) => void
}

export function MicroGigsHome({ setActiveTab }: MicroGigsHomeProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="MicroGigs">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          A decentralized marketplace for small tasks built with blockchain technology.
        </p>
        <Button onClick={() => setActiveTab("browse")} icon={<Icon name="arrow-right" size="sm" />}>
          Explore Marketplace
        </Button>
      </Card>

      <Card title="Key Features">
        <ul className="space-y-3 mb-4">
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">
              Post small tasks and hire others to complete them
            </span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">Secure payments with smart contract escrow</span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">Decentralized reputation system</span>
          </li>
          <li className="flex items-start">
            <Icon name="check" className="text-[var(--app-accent)] mt-1 mr-2" />
            <span className="text-[var(--app-foreground-muted)]">No intermediaries, low fees</span>
          </li>
        </ul>
      </Card>

      <TransactionCard />
    </div>
  )
}

export function BrowseTasks({
  setActiveTab,
  setSelectedTask,
}: {
  setActiveTab: (tab: string) => void
  setSelectedTask: (task: Task) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories] = useState(["all", "design", "development", "content", "marketing"])

  const [tasks] = useState<Task[]>([
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

  const filteredTasks = selectedCategory === "all" ? tasks : tasks.filter((task) => task.category === selectedCategory)

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Browse Gigs">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("home")}>
            Back to Home
          </Button>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-md px-2 py-1 pr-8 text-xs text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <Icon name="filter" size="sm" className="absolute right-2 top-1.5 text-[var(--app-foreground-muted)]" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-[var(--app-card-border)] pb-3 last:border-0 last:pb-0"
            >
              <div className="cursor-pointer flex-1" onClick={() => setSelectedTask(task)}>
                <div className="font-medium text-sm text-[var(--app-foreground)]">{task.title}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-[var(--app-accent)]">{task.budget}</div>
                  <div className="text-xs px-1.5 py-0.5 bg-[var(--app-gray)] rounded-full text-[var(--app-foreground-muted)]">
                    {task.category}
                  </div>
                </div>
              </div>
              <Button
                variant={task.applied ? "primary" : "outline"}
                size="sm"
                icon={<Icon name={task.applied ? "check" : "plus"} size="sm" />}
              >
                {task.applied ? "Applied" : "Apply"}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function MyTasks({
  setActiveTab,
  setSelectedTask,
  setShowSubmitWork,
}: {
  setActiveTab: (tab: string) => void
  setSelectedTask: (task: Task) => void
  setShowSubmitWork: (show: boolean) => void
}) {
  const [myTasks] = useState<Task[]>([
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

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="My Tasks">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("home")}>
            Back to Home
          </Button>
        </div>

        <div className="space-y-4">
          {myTasks.map((task) => (
            <div key={task.id} className="border-b border-[var(--app-card-border)] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedTask(task)}>
                <div>
                  <div className="font-medium text-sm text-[var(--app-foreground)]">{task.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-[var(--app-accent)]">{task.budget}</div>
                    <div className="text-xs px-1.5 py-0.5 bg-[var(--app-gray)] rounded-full text-[var(--app-foreground-muted)]">
                      {task.category}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.status === "completed"
                      ? "bg-[var(--app-success-light)] text-[var(--app-success)]"
                      : task.status === "in-progress"
                        ? "bg-[var(--app-warning-light)] text-[var(--app-warning)]"
                        : task.status === "pending-approval"
                          ? "bg-[var(--app-info-light)] text-[var(--app-info)]"
                          : "bg-[var(--app-accent-light)] text-[var(--app-accent)]"
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
                <div className="mt-3">
                  <div className="w-full bg-[var(--app-gray)] h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[var(--app-warning)] h-full rounded-full"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-[var(--app-foreground-muted)]">{task.progress}% complete</div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setShowSubmitWork(true)
                        setSelectedTask(task)
                      }}
                      icon={<Icon name="send" size="sm" />}
                    >
                      Submit Work
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function CreateTask({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskBudget, setNewTaskBudget] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskDeadline, setNewTaskDeadline] = useState("")
  const [categories] = useState(["design", "development", "content", "marketing"])

  const handleAddTask = () => {
    if (
      newTaskTitle.trim() &&
      newTaskBudget.trim() &&
      newTaskCategory.trim() &&
      newTaskDescription.trim() &&
      newTaskDeadline.trim()
    ) {
      // In a real app, we would add the task to the blockchain here

      // Reset form
      setNewTaskTitle("")
      setNewTaskBudget("")
      setNewTaskCategory("")
      setNewTaskDescription("")
      setNewTaskDeadline("")

      // Switch to my tasks tab
      setActiveTab("my-tasks")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Create New Gig">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("home")}>
            Back to Home
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Task Title</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Describe your task..."
              className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Budget (ETH)</label>
              <input
                type="text"
                value={newTaskBudget}
                onChange={(e) => setNewTaskBudget(e.target.value)}
                placeholder="0.00 ETH"
                className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Category</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
              >
                <option value="">Select</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Description</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Provide details about the task..."
              className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
              rows={3}
            ></textarea>
          </div>

          <div>
            <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Deadline</label>
            <input
              type="text"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              placeholder="e.g., 5 days"
              className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
            />
          </div>

          <Button onClick={handleAddTask} className="w-full" icon={<Icon name="plus" size="sm" />}>
            Create & Fund Gig
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function Profile({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [userStats] = useState({
    tasksCompleted: 12,
    tasksPosted: 8,
    totalEarned: "1.45 ETH",
    totalSpent: "1.2 ETH",
    rating: 4.9,
    reviews: 15,
    memberSince: "March 2025",
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <Card title="Profile">
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("home")}>
            Back to Home
          </Button>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-[var(--app-accent-light)] rounded-full flex items-center justify-center mb-3">
            <Icon name="user" size="lg" className="text-[var(--app-accent)]" />
          </div>

          <div className="text-center">
            <div />
          </div>

          <div className="text-center">
            <div className="font-medium text-[var(--app-foreground)]">0x1a2b...3c4d</div>
            <div className="text-xs text-[var(--app-foreground-muted)]">Member since {userStats.memberSince}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Icon name="award" size="sm" className="text-[var(--app-warning)]" />
              <span className="text-sm">{userStats.rating}</span>
              <span className="text-xs text-[var(--app-foreground-muted)]">({userStats.reviews} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[var(--app-gray)] p-3 rounded-md text-center">
            <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Tasks Completed</div>
            <div className="font-medium text-[var(--app-foreground)]">{userStats.tasksCompleted}</div>
          </div>
          <div className="bg-[var(--app-gray)] p-3 rounded-md text-center">
            <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Tasks Posted</div>
            <div className="font-medium text-[var(--app-foreground)]">{userStats.tasksPosted}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--app-gray)] p-3 rounded-md text-center">
            <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Total Earned</div>
            <div className="font-medium text-[var(--app-success)]">{userStats.totalEarned}</div>
          </div>
          <div className="bg-[var(--app-gray)] p-3 rounded-md text-center">
            <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Total Spent</div>
            <div className="font-medium text-[var(--app-error)]">{userStats.totalSpent}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function TransactionCard() {
  const { address } = useAccount()
  const sendNotification = useNotification()

  // Example transaction call - sending 0 ETH to self
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

  const handleSuccess = useCallback(
    async (response: TransactionResponse) => {
      const transactionHash = response.transactionReceipts[0].transactionHash

      console.log(`Transaction successful: ${transactionHash}`)

      await sendNotification({
        title: "Transaction Successful!",
        body: `Your transaction was completed: ${transactionHash.substring(0, 10)}...`,
      })
    },
    [sendNotification],
  )

  return (
    <Card title="Make Your First Transaction">
      <div className="space-y-4">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Experience the power of seamless blockchain transactions with secure smart contract escrow.
        </p>

        <div className="flex flex-col items-center">
          {address ? (
            <Transaction
              calls={calls}
              onSuccess={handleSuccess}
              onError={(error: TransactionError) => console.error("Transaction failed:", error)}
            >
              <TransactionButton className="text-white text-md" />
              <TransactionStatus>
                <TransactionStatusAction />
                <TransactionStatusLabel />
              </TransactionStatus>
              <TransactionToast className="mb-4">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </TransactionToast>
            </Transaction>
          ) : (
            <p className="text-[var(--app-warning)] text-sm text-center mt-2">
              Connect your wallet to send a transaction
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
