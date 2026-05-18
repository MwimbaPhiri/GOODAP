import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-1' // Mock user ID
    const type = searchParams.get('type') // 'events' or 'templates'

    if (type === 'events') {
      // Get user's activity history
      const userActivities = await db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      // Get user's attended events
      const attendedEvents = await db.eventAttendee.findMany({
        where: { userId },
        include: {
          event: {
            select: {
              category: true,
              type: true,
              tags: true
            }
          }
        }
      })

      // Analyze user preferences
      const preferences = analyzeUserPreferences(userActivities, attendedEvents)

      // Get AI-powered recommendations
      const recommendations = await getAIEventRecommendations(preferences)

      return NextResponse.json({ recommendations })
    }

    if (type === 'templates') {
      // Get user's created events to understand preferences
      const createdEvents = await db.event.findMany({
        where: { organizerId: userId },
        select: {
          category: true,
          type: true,
          tags: true
        }
      })

      const preferences = analyzeCreatorPreferences(createdEvents)
      const recommendations = await getAITemplateRecommendations(preferences)

      return NextResponse.json({ recommendations })
    }

    return NextResponse.json(
      { error: 'Invalid recommendation type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function analyzeUserPreferences(activities: any[], attendedEvents: any[]) {
  const categories = new Map()
  const types = new Map()
  const tags = new Map()

  // Analyze attended events
  attendedEvents.forEach(({ event }) => {
    categories.set(event.category, (categories.get(event.category) || 0) + 2)
    types.set(event.type, (types.get(event.type) || 0) + 2)
    
    if (event.tags) {
      try {
        const eventTags = JSON.parse(event.tags)
        eventTags.forEach((tag: string) => {
          tags.set(tag, (tags.get(tag) || 0) + 1)
        })
      } catch (e) {
        // Skip invalid JSON
      }
    }
  })

  // Analyze activities
  activities.forEach((activity) => {
    if (activity.metadata) {
      try {
        const metadata = JSON.parse(activity.metadata)
        if (metadata.category) {
          categories.set(metadata.category, (categories.get(metadata.category) || 0) + 1)
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  })

  return {
    favoriteCategories: Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category),
    favoriteTypes: Array.from(types.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type),
    favoriteTags: Array.from(tags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)
  }
}

function analyzeCreatorPreferences(createdEvents: any[]) {
  const categories = new Map()
  const types = new Map()

  createdEvents.forEach((event) => {
    categories.set(event.category, (categories.get(event.category) || 0) + 1)
    types.set(event.type, (types.get(event.type) || 0) + 1)
  })

  return {
    preferredCategories: Array.from(categories.keys()),
    preferredTypes: Array.from(types.keys())
  }
}

async function getAIEventRecommendations(preferences: any) {
  try {
    const zai = await ZAI.create()

    const prompt = `Based on user preferences:
    Favorite Categories: ${preferences.favoriteCategories.join(', ')}
    Favorite Event Types: ${preferences.favoriteTypes.join(', ')}
    Favorite Tags: ${preferences.favoriteTags.join(', ')}
    
    Recommend 5 upcoming events that would match these interests.
    For each event, provide:
    - A compelling title
    - Description highlighting why it matches their interests
    - Category
    - Type
    - Suggested price range
    - 3 relevant tags
    
    Format as JSON array with objects containing: title, description, category, type, priceRange, tags, matchScore`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an event recommendation expert. Create personalized event suggestions based on user preferences. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const recommendations = JSON.parse(completion.choices[0].message.content)
    return recommendations
  } catch (error) {
    console.error('AI recommendation error:', error)
    
    // Fallback recommendations
    return [
      {
        title: "Tech Innovation Summit",
        description: "Perfect for tech enthusiasts looking to explore cutting-edge innovations",
        category: "Technology",
        type: "CONFERENCE",
        priceRange: "$50-100",
        tags: ["innovation", "technology", "networking"],
        matchScore: 95
      },
      {
        title: "Startup Networking Night",
        description: "Connect with fellow entrepreneurs and investors in a casual setting",
        category: "Business",
        type: "NETWORKING",
        priceRange: "$25-50",
        tags: ["startup", "networking", "business"],
        matchScore: 88
      }
    ]
  }
}

async function getAITemplateRecommendations(preferences: any) {
  try {
    const zai = await ZAI.create()

    const prompt = `Based on creator preferences:
    Preferred Categories: ${preferences.preferredCategories.join(', ')}
    Preferred Event Types: ${preferences.preferredTypes.join(', ')}
    
    Recommend 5 event templates that would help create successful events.
    For each template, provide:
    - Template name
    - Description
    - Category
    - Type
    - Suggested duration
    - Key features
    
    Format as JSON array with objects containing: name, description, category, type, duration, features`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an event planning expert. Create practical event templates for organizers. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1200
    })

    const recommendations = JSON.parse(completion.choices[0].message.content)
    return recommendations
  } catch (error) {
    console.error('AI template recommendation error:', error)
    
    // Fallback template recommendations
    return [
      {
        name: "Product Launch Template",
        description: "Complete template for successful product launch events",
        category: "Business",
        type: "CORPORATE",
        duration: 180,
        features: ["Press coverage", "Demo stations", "Networking", "Media kit"]
      },
      {
        name: "Workshop Series Template",
        description: "Multi-session workshop template for skill development",
        category: "Education",
        type: "WORKSHOP",
        duration: 240,
        features: ["Hands-on exercises", "Materials", "Certificate", "Follow-up"]
      }
    ]
  }
}