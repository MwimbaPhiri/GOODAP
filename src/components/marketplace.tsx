'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Ticket, ShoppingBag, Search, Calendar, MapPin, User, DollarSign, TrendingUp } from 'lucide-react'

interface TicketItem {
  id: string
  originalPrice: number
  currentPrice: number
  currency: string
  isNFT: boolean
  event: {
    id: string
    title: string
    date: string
    location: string
  }
  owner: {
    id: string
    name: string
    avatar?: string
  }
}

interface MerchandiseItem {
  id: string
  name: string
  description: string
  price: number
  currency: string
  imageUrl?: string
  inventory: number
  event?: {
    id: string
    title: string
    date: string
  }
  seller: {
    id: string
    name: string
    avatar?: string
  }
}

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketplaceData()
  }, [activeTab, sortBy])

  const fetchMarketplaceData = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'tickets' ? 'tickets' : 'merchandise'
      const response = await fetch(`/api/marketplace?type=${type}&limit=20`)
      const data = await response.json()
      
      if (type === 'tickets') {
        setTickets(data.tickets || [])
      } else {
        setMerchandise(data.merchandise || [])
      }
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (type: string, itemId: string) => {
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          itemId,
          buyerId: 'user-1', // Mock user ID
          paymentMethod: 'crypto' // Mock payment method
        })
      })

      if (response.ok) {
        alert('Purchase successful!')
        fetchMarketplaceData() // Refresh data
      } else {
        alert('Purchase failed')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed')
    }
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.event.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMerchandise = merchandise.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'price-low') return a.currentPrice - b.currentPrice
    if (sortBy === 'price-high') return b.currentPrice - a.currentPrice
    return 0 // Default: recent
  })

  const sortedMerchandise = [...filteredMerchandise].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0 // Default: recent
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600">Buy, sell, and trade event tickets and merchandise</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search tickets or merchandise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets" className="flex items-center space-x-2">
            <Ticket className="w-4 h-4" />
            <span>Event Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="merchandise" className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Merchandise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          {loading ? (
            <div className="text-center py-12">Loading tickets...</div>
          ) : sortedTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets available</h3>
              <p className="text-gray-600">Check back later for new ticket listings</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(ticket.event.date).toLocaleDateString()}
                        </CardDescription>
                        <CardDescription className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {ticket.event.location}
                        </CardDescription>
                      </div>
                      {ticket.isNFT && (
                        <Badge variant="secondary">NFT</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Current Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            {ticket.currency === 'USD' ? '$' : ''}{ticket.currentPrice}
                            {ticket.currency === 'ETH' ? ' ETH' : ''}
                          </p>
                        </div>
                        {ticket.originalPrice !== ticket.currentPrice && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Original</p>
                            <p className="text-sm line-through">
                              {ticket.currency === 'USD' ? '$' : ''}{ticket.originalPrice}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Sold by {ticket.owner.name}</span>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase('ticket', ticket.id)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Buy Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="merchandise">
          {loading ? (
            <div className="text-center py-12">Loading merchandise...</div>
          ) : sortedMerchandise.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No merchandise available</h3>
              <p className="text-gray-600">Check back later for new merchandise listings</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMerchandise.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                    {item.inventory <= 5 && (
                      <Badge className="absolute top-4 right-4 bg-red-500">
                        Only {item.inventory} left
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                    {item.event && (
                      <div className="text-sm text-gray-600">
                        <p>Event: {item.event.title}</p>
                        <p>{new Date(item.event.date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            {item.currency === 'USD' ? '$' : ''}{item.price}
                            {item.currency === 'ETH' ? ' ETH' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Stock</p>
                          <p className="text-lg font-semibold">{item.inventory}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Sold by {item.seller.name}</span>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase('merchandise', item.id)}
                        disabled={item.inventory === 0}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {item.inventory === 0 ? 'Out of Stock' : 'Buy Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}