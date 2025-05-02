import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Award, Calendar, Clock, MessageSquare, Wallet } from "lucide-react"

export default function GigDetails({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the gig details using the ID
  const gig = {
    id: params.id,
    title: "Design Logo for DeFi Project",
    description:
      "Looking for a talented designer to create a modern, professional logo for our new DeFi platform. The logo should convey trust, innovation, and financial growth. Please include examples of your previous work in your application.",
    budget: "0.05 ETH",
    deadline: "2 days left",
    category: "Design",
    applicants: 3,
    status: "Open",
    createdAt: "2 days ago",
    poster: {
      address: "0x1a2b...3c4d",
      rating: 4.8,
      completedTasks: 12,
    },
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
          <h1 className="text-lg font-medium mx-auto">Gig Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{gig.title}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Posted {gig.createdAt}</span>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      {gig.category}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{gig.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-zinc-700">{gig.description}</p>
                </div>

                <div className="flex flex-wrap gap-4 py-2">
                  <div className="bg-zinc-100 rounded-lg px-4 py-3 min-w-[120px]">
                    <div className="text-xs text-zinc-500 mb-1">Budget</div>
                    <div className="font-medium flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                      {gig.budget}
                    </div>
                  </div>

                  <div className="bg-zinc-100 rounded-lg px-4 py-3 min-w-[120px]">
                    <div className="text-xs text-zinc-500 mb-1">Deadline</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {gig.deadline}
                    </div>
                  </div>

                  <div className="bg-zinc-100 rounded-lg px-4 py-3 min-w-[120px]">
                    <div className="text-xs text-zinc-500 mb-1">Applicants</div>
                    <div className="font-medium flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      {gig.applicants}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Posted by</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-emerald-100 text-emerald-800">
                      <AvatarFallback>{gig.poster.address.substring(2, 4).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{gig.poster.address}</div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{gig.poster.rating} rating</span>
                        </div>
                        <div>{gig.poster.completedTasks} tasks completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600">Apply for this Gig</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Ask a Question
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100"
                  >
                    <div>
                      <div className="font-medium text-sm">Logo Design for NFT Project</div>
                      <div className="text-xs text-zinc-500">0.04 ETH • 3 days left</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
