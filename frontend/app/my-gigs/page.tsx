"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Wallet, Zap, CheckCircle, AlertCircle } from "lucide-react"

export default function MyGigs() {
  const [connected, setConnected] = useState(false)

  if (!connected) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50">
        <main className="flex-1 container px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-600">
                Connect your wallet to view your gigs, track earnings, and manage your tasks
              </p>
              <Button onClick={() => setConnected(true)} className="w-full bg-emerald-500 hover:bg-emerald-600">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </main>

        {/* Navigation */}
        <nav className="sticky bottom-0 z-10 bg-white border-t border-zinc-200">
          <div className="container flex items-center justify-around h-14">
            <Link href="/" className="flex flex-col items-center text-zinc-500 hover:text-emerald-500">
              <Zap className="w-5 h-5" />
              <span className="text-xs">Browse</span>
            </Link>
            <Link href="/create" className="flex flex-col items-center text-zinc-500 hover:text-emerald-500">
              <Zap className="w-5 h-5" />
              <span className="text-xs">Create</span>
            </Link>
            <Link href="/my-gigs" className="flex flex-col items-center text-emerald-500">
              <Wallet className="w-5 h-5" />
              <span className="text-xs">My Gigs</span>
            </Link>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-medium">My Gigs</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <Wallet className="w-3.5 h-3.5 mr-1" />
              0.35 ETH
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <Tabs defaultValue="posted" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posted">Tasks I Posted</TabsTrigger>
            <TabsTrigger value="working">Tasks I'm Working On</TabsTrigger>
          </TabsList>

          <TabsContent value="posted" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Your Posted Tasks</h2>
              <Button size="sm" asChild>
                <Link href="/create">+ New Task</Link>
              </Button>
            </div>

            {[
              {
                id: 1,
                title: "Design Logo for DeFi Project",
                budget: "0.05 ETH",
                deadline: "2 days left",
                status: "Open",
                applicants: 3,
              },
              {
                id: 2,
                title: "Smart Contract Audit",
                budget: "0.2 ETH",
                deadline: "5 days left",
                status: "In Progress",
                worker: {
                  address: "0x7e8f...9g0h",
                  rating: 4.9,
                },
              },
              {
                id: 3,
                title: "Create NFT Collection",
                budget: "0.15 ETH",
                deadline: "Completed",
                status: "Completed",
                worker: {
                  address: "0x3m4n...5o6p",
                  rating: 4.6,
                },
              },
            ].map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/gig/${task.id}`} className="font-medium hover:text-emerald-600">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          <span>{task.budget}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        task.status === "Open"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : task.status === "In Progress"
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>

                  {task.status === "Open" ? (
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-zinc-600">{task.applicants} applicants</span>
                      </div>
                      <Button size="sm">Review Applicants</Button>
                    </div>
                  ) : task.status === "In Progress" ? (
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-amber-100 text-amber-800">
                          <AvatarFallback>{task.worker?.address.substring(2, 4).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-zinc-600">Working: {task.worker?.address}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Check Progress
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-zinc-600">Completed by: {task.worker?.address}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        View Submission
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="working" className="space-y-4">
            <h2 className="text-lg font-medium">Tasks You're Working On</h2>

            {[
              {
                id: 4,
                title: "Write Web3 Tutorial",
                budget: "0.08 ETH",
                deadline: "3 days left",
                status: "In Progress",
                poster: {
                  address: "0x9i0j...1k2l",
                  rating: 4.7,
                },
              },
              {
                id: 5,
                title: "Community Management",
                budget: "0.1 ETH",
                deadline: "14 days left",
                status: "Pending Approval",
                poster: {
                  address: "0x7q8r...9s0t",
                  rating: 4.5,
                },
              },
            ].map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/gig/${task.id}`} className="font-medium hover:text-emerald-600">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" />
                          <span>{task.budget}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        task.status === "In Progress"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 bg-zinc-100 text-zinc-800">
                        <AvatarFallback>{task.poster.address.substring(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-zinc-600">Posted by: {task.poster.address}</span>
                    </div>

                    {task.status === "In Progress" ? (
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        Submit Work
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        Awaiting review
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Navigation */}
      <nav className="sticky bottom-0 z-10 bg-white border-t border-zinc-200">
        <div className="container flex items-center justify-around h-14">
          <Link href="/" className="flex flex-col items-center text-zinc-500 hover:text-emerald-500">
            <Zap className="w-5 h-5" />
            <span className="text-xs">Browse</span>
          </Link>
          <Link href="/create" className="flex flex-col items-center text-zinc-500 hover:text-emerald-500">
            <Zap className="w-5 h-5" />
            <span className="text-xs">Create</span>
          </Link>
          <Link href="/my-gigs" className="flex flex-col items-center text-emerald-500">
            <Wallet className="w-5 h-5" />
            <span className="text-xs">My Gigs</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
