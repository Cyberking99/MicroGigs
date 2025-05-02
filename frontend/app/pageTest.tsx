"use client"

import { useMemo } from "react"

import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit"
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity"
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"
import { useEffect, useState, useCallback } from "react"
import {
  Button,
  Icon,
  MicroGigsHome,
  BrowseTasks,
  MyTasks,
  CreateTask,
  Profile,
} from "./components/MicroGigsComponents"

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  const [frameAdded, setFrameAdded] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  type Task = {
    title: string
    description: string
    budget: string
    category: string
    deadline: string
    poster: string
    posterRating: number
    status: string
    progress: number
  }

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubmitWork, setShowSubmitWork] = useState(false)
  const [workSubmission, setWorkSubmission] = useState("")

  const addFrame = useAddFrame()
  const openUrl = useOpenUrl()

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      )
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      )
    }

    return null
  }, [context, frameAdded, handleAddFrame])

  const handleSubmitWork = () => {
    if (workSubmission.trim() && selectedTask) {
      // In a real app, we would submit the work to the blockchain here
      setShowSubmitWork(false)
      setWorkSubmission("")
      setSelectedTask(null)
      setActiveTab("my-tasks")
    }
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
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
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <MicroGigsHome setActiveTab={setActiveTab} />}
          {activeTab === "browse" && <BrowseTasks setActiveTab={setActiveTab} setSelectedTask={setSelectedTask} />}
          {activeTab === "my-tasks" && (
            <MyTasks
              setActiveTab={setActiveTab}
              setSelectedTask={setSelectedTask}
              setShowSubmitWork={setShowSubmitWork}
            />
          )}
          {activeTab === "create" && <CreateTask setActiveTab={setActiveTab} />}
          {activeTab === "profile" && <Profile setActiveTab={setActiveTab} />}
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg">
            <div className="border-b border-[var(--app-card-border)] p-4 flex justify-between items-center">
              <h3 className="font-medium text-[var(--app-foreground)]">Task Details</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-lg font-medium text-[var(--app-foreground)]">{selectedTask.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-sm font-medium text-[var(--app-accent)]">{selectedTask.budget}</div>
                  <div className="text-xs px-2 py-0.5 bg-[var(--app-gray)] rounded-full text-[var(--app-foreground-muted)]">
                    {selectedTask.category}
                  </div>
                  <div className="text-xs text-[var(--app-foreground-muted)]">{selectedTask.deadline}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Description</div>
                <p className="text-sm text-[var(--app-foreground)]">{selectedTask.description}</p>
              </div>

              <div>
                <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Posted by</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-[var(--app-foreground)]">{selectedTask.poster}</div>
                  <div className="flex items-center gap-1">
                    <Icon name="award" size="sm" className="text-[var(--app-warning)]" />
                    <span className="text-xs">{selectedTask.posterRating}</span>
                  </div>
                </div>
              </div>

              {selectedTask.status === "in-progress" && (
                <div>
                  <div className="text-xs text-[var(--app-foreground-muted)] mb-1">Progress</div>
                  <div className="w-full bg-[var(--app-gray)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--app-warning)] h-full rounded-full"
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-[var(--app-foreground-muted)] mt-1">
                    {selectedTask.progress}%
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (selectedTask.status === "in-progress") {
                      setShowSubmitWork(true)
                      setSelectedTask(null)
                    } else {
                      setSelectedTask(null)
                    }
                  }}
                >
                  {selectedTask.status === "in-progress" ? "Submit Work" : "Close"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Modal */}
      {showSubmitWork && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg">
            <div className="border-b border-[var(--app-card-border)] p-4 flex justify-between items-center">
              <h3 className="font-medium text-[var(--app-foreground)]">Submit Work</h3>
              <button
                onClick={() => setShowSubmitWork(false)}
                className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)]"
              >
                <Icon name="x" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-[var(--app-foreground-muted)] mb-1">Work Submission</label>
                <textarea
                  value={workSubmission}
                  onChange={(e) => setWorkSubmission(e.target.value)}
                  placeholder="Describe your work and provide any relevant links..."
                  className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg px-3 py-2 text-sm text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)]"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowSubmitWork(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitWork} icon={<Icon name="send" size="sm" />}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
