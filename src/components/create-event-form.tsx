'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, MapPin, Clock, Users, Sparkles, Globe, DollarSign, Tag } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  duration: number
  suggestedPrice: number
  tags: string[]
  category: string
  type: string
}

export default function CreateEventForm() {
  const [activeTab, setActiveTab] = useState('manual')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    date: '',
    duration: '',
    location: '',
    isVirtual: false,
    virtualLink: '',
    maxAttendees: '',
    price: '',
    currency: 'USD',
    tags: [] as string[],
    organizerId: 'user-1' // Mock user ID
  })

  const [aiPrompt, setAiPrompt] = useState({
    eventType: '',
    category: '',
    description: '',
    audience: ''
  })

  const categories = [
    'Technology', 'Business', 'Education', 'Entertainment', 
    'Health', 'Sports', 'Arts', 'Music', 'Food', 'Travel'
  ]

  const eventTypes = [
    { value: 'SOCIAL', label: 'Social' },
    { value: 'CORPORATE', label: 'Corporate' },
    { value: 'HYBRID', label: 'Hybrid' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'CONFERENCE', label: 'Conference' },
    { value: 'NETWORKING', label: 'Networking' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' }
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/ai/templates?popular=true')
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const generateAITemplates = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPrompt)
      })
      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error('Failed to generate templates:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({
      ...formData,
      title: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      duration: template.duration.toString(),
      price: template.suggestedPrice.toString(),
      tags: template.tags
    })
    setActiveTab('manual')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert('Event created successfully!')
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: '',
          category: '',
          date: '',
          duration: '',
          location: '',
          isVirtual: false,
          virtualLink: '',
          maxAttendees: '',
          price: '',
          currency: 'USD',
          tags: [],
          organizerId: 'user-1'
        })
        setSelectedTemplate(null)
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Failed to create event')
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Event</h1>
        <p className="text-gray-600">Start from scratch or use our AI-powered templates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Manual Creation</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                {selectedTemplate ? `Customizing template: ${selectedTemplate.name}` : 'Fill in the details for your event'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time *</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="120"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location or 'Virtual'"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement
                      if (input?.value) {
                        addTag(input.value)
                        input.value = ''
                      }
                    }}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Clear
                  </Button>
                  <Button type="submit">Create Event</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate AI Templates</CardTitle>
                <CardDescription>Describe your event idea and let AI create templates for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select value={aiPrompt.eventType} onValueChange={(value) => setAiPrompt({ ...aiPrompt, eventType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.label.toLowerCase()}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={aiPrompt.category} onValueChange={(value) => setAiPrompt({ ...aiPrompt, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={aiPrompt.description}
                    onChange={(e) => setAiPrompt({ ...aiPrompt, description: e.target.value })}
                    placeholder="Describe your event concept..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    value={aiPrompt.audience}
                    onChange={(e) => setAiPrompt({ ...aiPrompt, audience: e.target.value })}
                    placeholder="e.g., Tech professionals, Students, Families"
                  />
                </div>
                
                <Button onClick={generateAITemplates} disabled={isGenerating} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Templates'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.type === 'CORPORATE' ? 'default' : 'secondary'}>
                        {template.type}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {template.duration} min
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${template.suggestedPrice}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => handleUseTemplate(template)}
                        className="w-full"
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      >
                        {selectedTemplate?.id === template.id ? 'Selected' : 'Use This Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}