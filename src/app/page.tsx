'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, MapPin, Users, TrendingUp, Search, Plus, Wallet, Sparkles, Globe, Ticket } from 'lucide-react'
import Link from 'next/link'
import CreateEventForm from '@/components/create-event-form'
import WalletConnect from '@/components/wallet-connect'

// Memoize the trending events data to prevent re-creation
const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Tech Innovation Summit 2024",
    type: "corporate",
    date: "2024-02-15",
    location: "Virtual",
    attendees: 1250,
    price: "0.05 ETH",
    image: "/api/placeholder/400/250",
    tags: ["Technology", "Innovation", "Networking"]
  },
  {
    id: 2,
    title: "Startup Pitch Night",
    type: "social",
    date: "2024-02-20",
    location: "San Francisco",
    attendees: 300,
    price: "$25",
    image: "/api/placeholder/400/250",
    tags: ["Startup", "Pitching", "Investment"]
  },
  {
    id: 3,
    title: "Web3 Developer Workshop",
    type: "corporate",
    date: "2024-02-25",
    location: "Virtual",
    attendees: 500,
    price: "0.02 ETH",
    image: "/api/placeholder/400/250",
    tags: ["Web3", "Development", "Blockchain"]
  }
] as const

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showWallet, setShowWallet] = useState(false)

  // Memoize the connectWallet function to prevent re-creation
  const connectWallet = useCallback(() => {
    setShowWallet(true)
  }, [])

  // Memoize the wallet connection handlers
  const handleWalletConnect = useCallback(() => {
    setIsWalletConnected(true)
    setShowWallet(false)
  }, [])

  const handleWalletDisconnect = useCallback(() => {
    setIsWalletConnected(false)
    setShowWallet(false)
  }, [])

  // Memoize the show create form handler
  const handleShowCreateForm = useCallback(() => {
    setShowCreateForm(true)
  }, [])

  // Filter events based on search query (memoized)
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_EVENTS
    
    const query = searchQuery.toLowerCase()
    return INITIAL_EVENTS.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query)) ||
      event.location.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Show create form
  if (showCreateForm) {
    return <CreateEventForm />
  }

  // Show wallet connection
  if (showWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <WalletConnect 
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GOODAP
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#events" className="text-gray-600 hover:text-purple-600 transition">Events</Link>
              <Link href="#marketplace" className="text-gray-600 hover:text-purple-600 transition">Marketplace</Link>
              <Link href="#create" className="text-gray-600 hover:text-purple-600 transition">Create</Link>
              <Link href="#templates" className="text-gray-600 hover:text-purple-600 transition">Templates</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={connectWallet}
                className="flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isWalletConnected ? '0x1234...5678' : 'Connect Wallet'}</span>
              </Button>
              <Button onClick={handleShowCreateForm}>Create Event</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">
            🚀 AI-Powered Event Management
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create Amazing Events with GOODAP
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The ultimate platform for social and corporate events. Trade tickets, sell merchandise, 
            and leverage AI-powered templates to create unforgettable experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={handleShowCreateForm}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your Event
            </Button>
            <Button size="lg" variant="outline">
              <Sparkles className="w-5 h-5 mr-2" />
              Explore AI Templates
            </Button>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search events, templates, or merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Hybrid Events</CardTitle>
              <CardDescription>
                Host both virtual and in-person events with seamless integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Ticket Trading</CardTitle>
              <CardDescription>
                Buy, sell, and trade event tickets with Web3 security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>AI Templates</CardTitle>
              <CardDescription>
                Get intelligent event suggestions and templates powered by AI
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Trending Events */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold mb-2">Trending Events</h3>
            <p className="text-gray-600">Discover what's hot in the community</p>
          </div>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            View All Trends
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                <div className="absolute top-4 left-4">
                  <Badge className={event.type === 'corporate' ? 'bg-blue-500' : 'bg-green-500'}>
                    {event.type}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary">{event.price}</Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {event.attendees} attending
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1">View Event</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Create Your Next Event?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of event creators using GOODAP to host amazing experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">GOODAP</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 GOODAP. Powered by AI and Web3 technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}