"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Wallet } from "lucide-react"

export default function CreateGig() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate blockchain transaction
    setTimeout(() => {
      setIsSubmitting(false)
      // Redirect would happen here
    }, 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="container flex items-center h-14 px-4">
          <Link href="/" className="flex items-center gap-1 text-zinc-500">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-medium mx-auto">Create New Gig</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <Card className="max-w-md mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-xl">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Describe your task briefly" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the task requirements"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="translation">Translation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (days)</Label>
                  <div className="relative">
                    <Input id="deadline" type="number" min="1" placeholder="Days" required />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (ETH)</Label>
                <div className="relative">
                  <Input id="budget" type="number" step="0.001" min="0.001" placeholder="0.00" required />
                  <Wallet className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
                <p className="text-xs text-zinc-500">This amount will be locked in escrow until task completion</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create & Fund Gig"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
