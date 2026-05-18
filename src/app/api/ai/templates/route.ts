import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { eventType, category, description, audience } = await request.json()

    const zai = await ZAI.create()

    const prompt = `Generate 3 creative event templates for a ${eventType} event in the ${category} category. 
    Event description: ${description}
    Target audience: ${audience}
    
    For each template, provide:
    - A catchy title
    - A detailed description
    - Suggested duration in minutes
    - Recommended price in USD
    - 5 relevant tags
    - Key features or activities
    
    Format as JSON array with objects containing: name, description, duration, suggestedPrice, tags, features`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert event planner who creates innovative and engaging event templates. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const templatesData = JSON.parse(completion.choices[0].message.content)

    // Save templates to database
    const savedTemplates = await Promise.all(
      templatesData.map(async (template: any) => {
        return await db.eventTemplate.create({
          data: {
            name: template.name,
            description: template.description,
            category,
            type: eventType.toUpperCase(),
            suggestedPrice: template.suggestedPrice,
            duration: template.duration,
            tags: JSON.stringify(template.tags),
            aiGenerated: true,
            isPopular: Math.random() > 0.7 // Randomly mark some as popular
          }
        })
      })
    )

    return NextResponse.json({ templates: savedTemplates })
  } catch (error) {
    console.error('AI template generation error:', error)
    
    // Fallback templates
    const fallbackTemplates = [
      {
        name: "Networking Mixer",
        description: "A professional networking event with structured icebreakers and meaningful connections",
        category,
        type: eventType.toUpperCase(),
        suggestedPrice: 25,
        duration: 120,
        tags: JSON.stringify(["networking", "professional", "social", "connections", "business"]),
        aiGenerated: false,
        isPopular: true
      },
      {
        name: "Workshop & Learn",
        description: "Interactive workshop with hands-on learning and skill development",
        category,
        type: eventType.toUpperCase(),
        suggestedPrice: 50,
        duration: 180,
        tags: JSON.stringify(["workshop", "learning", "skills", "interactive", "education"]),
        aiGenerated: false,
        isPopular: false
      }
    ]

    const savedTemplates = await Promise.all(
      fallbackTemplates.map(async (template) => {
        return await db.eventTemplate.create({
          data: template
        })
      })
    )

    return NextResponse.json({ templates: savedTemplates })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const popular = searchParams.get('popular')

    let whereClause: any = {}
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    if (type && type !== 'all') {
      whereClause.type = type.toUpperCase()
    }
    
    if (popular === 'true') {
      whereClause.isPopular = true
    }

    const templates = await db.eventTemplate.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Parse tags for each template
    const templatesWithParsedTags = templates.map(template => ({
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : []
    }))

    return NextResponse.json({ templates: templatesWithParsedTags })
  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}