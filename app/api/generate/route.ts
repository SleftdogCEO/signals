import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Generate realistic demo leads based on partner types
function generateDemoLeads(targetLeads: string, location: string, industry: string) {
  const partnerTypes = targetLeads.split(',').map(s => s.trim()).filter(Boolean)

  const leadTemplates: Record<string, any[]> = {
    'Accountants': [
      { name: 'Smith & Associates CPAs', category: 'Accounting', rating: 4.8 },
      { name: 'Premier Tax Solutions', category: 'Accounting', rating: 4.6 },
      { name: 'Coastal Accounting Group', category: 'Accounting', rating: 4.9 },
    ],
    'Business consultants': [
      { name: 'Strategic Growth Advisors', category: 'Business Consulting', rating: 4.7 },
      { name: 'Peak Performance Consulting', category: 'Business Consulting', rating: 4.5 },
      { name: 'Innovate Business Solutions', category: 'Business Consulting', rating: 4.8 },
    ],
    'Banks': [
      { name: 'First Community Bank', category: 'Banking', rating: 4.4 },
      { name: 'Regional Business Banking', category: 'Banking', rating: 4.3 },
      { name: 'Commerce Trust Bank', category: 'Banking', rating: 4.6 },
    ],
    'POS system vendors': [
      { name: 'TechPoint POS Solutions', category: 'POS Systems', rating: 4.7 },
      { name: 'RetailTech Systems', category: 'POS Systems', rating: 4.5 },
    ],
    'Physical therapists': [
      { name: 'Active Recovery PT', category: 'Physical Therapy', rating: 4.9 },
      { name: 'Motion Health Therapy', category: 'Physical Therapy', rating: 4.7 },
      { name: 'Premier Physical Therapy', category: 'Physical Therapy', rating: 4.8 },
    ],
    'Chiropractors': [
      { name: 'Spine & Wellness Center', category: 'Chiropractic', rating: 4.8 },
      { name: 'Total Health Chiropractic', category: 'Chiropractic', rating: 4.6 },
    ],
    'Nutritionists': [
      { name: 'Balanced Life Nutrition', category: 'Nutrition', rating: 4.7 },
      { name: 'Healthy Habits Consulting', category: 'Nutrition', rating: 4.5 },
    ],
    'Realtors': [
      { name: 'Prime Properties Realty', category: 'Real Estate', rating: 4.8 },
      { name: 'Coastal Homes Group', category: 'Real Estate', rating: 4.7 },
      { name: 'Trusted Realty Partners', category: 'Real Estate', rating: 4.9 },
    ],
    'Property managers': [
      { name: 'Elite Property Management', category: 'Property Management', rating: 4.6 },
      { name: 'Reliable PM Services', category: 'Property Management', rating: 4.5 },
    ],
    'Home inspectors': [
      { name: 'Thorough Home Inspections', category: 'Home Inspection', rating: 4.8 },
      { name: 'Pro Inspect Services', category: 'Home Inspection', rating: 4.7 },
    ],
    'Wedding planners': [
      { name: 'Elegant Events Co', category: 'Event Planning', rating: 4.9 },
      { name: 'Dream Day Weddings', category: 'Event Planning', rating: 4.8 },
    ],
    'Lawyers': [
      { name: 'Henderson Law Group', category: 'Legal Services', rating: 4.7 },
      { name: 'Business Law Partners', category: 'Legal Services', rating: 4.6 },
    ],
    'Insurance agents': [
      { name: 'Secure Future Insurance', category: 'Insurance', rating: 4.5 },
      { name: 'Trusted Coverage Agency', category: 'Insurance', rating: 4.6 },
    ],
  }

  const leads: any[] = []
  const usedNames = new Set()

  partnerTypes.forEach((type, index) => {
    // Find matching templates
    let templates = leadTemplates[type] || []

    // If no exact match, try partial match
    if (templates.length === 0) {
      const lowerType = type.toLowerCase()
      for (const [key, value] of Object.entries(leadTemplates)) {
        if (key.toLowerCase().includes(lowerType) || lowerType.includes(key.toLowerCase())) {
          templates = value
          break
        }
      }
    }

    // Generate leads from templates or create generic ones
    if (templates.length > 0) {
      templates.forEach((template, i) => {
        if (!usedNames.has(template.name)) {
          usedNames.add(template.name)
          leads.push({
            name: template.name,
            category: template.category,
            address: `${100 + leads.length * 50} Business District, ${location}`,
            phone: `(555) ${String(100 + leads.length).padStart(3, '0')}-${String(1000 + i * 111).slice(0, 4)}`,
            email: `contact@${template.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            website: `https://${template.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
            rating: template.rating,
            reviewCount: Math.floor(Math.random() * 100) + 20,
            outreachChannel: {
              primary: i % 2 === 0 ? 'email' : 'call',
              reason: i % 2 === 0 ? 'Professional service - email preferred' : 'Direct outreach often more effective',
              available: ['email', 'call', 'linkedin']
            },
            personalizedOpener: `Hi! I noticed ${template.name} serves ${location} businesses. I run a ${industry} company and think there could be great referral opportunities between us.`
          })
        }
      })
    } else {
      // Create generic lead for this type
      leads.push({
        name: `${location} ${type}`,
        category: type,
        address: `${200 + leads.length * 50} Main Street, ${location}`,
        phone: `(555) ${String(200 + leads.length).padStart(3, '0')}-${String(2000 + index * 111).slice(0, 4)}`,
        email: `info@${type.toLowerCase().replace(/[^a-z]/g, '')}${location.split(',')[0].toLowerCase().replace(/[^a-z]/g, '')}.com`,
        website: null,
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        outreachChannel: {
          primary: 'email',
          reason: 'Professional introduction recommended',
          available: ['email', 'call']
        },
        personalizedOpener: `Hi! I'm reaching out because I run a ${industry} business in ${location} and I think we could help each other with referrals.`
      })
    }
  })

  return leads.slice(0, 12) // Max 12 leads
}

function generateDemoEvents(location: string, industry: string) {
  const cityName = location.split(',')[0].trim()
  return [
    {
      title: `${cityName} Business Networking Mixer`,
      date: getUpcomingDate(7),
      location: `${cityName} Convention Center`,
      description: `Monthly networking event for ${cityName} business professionals`,
      url: '#',
      category: 'Networking'
    },
    {
      title: `${industry} Industry Meetup`,
      date: getUpcomingDate(14),
      location: `Downtown ${cityName}`,
      description: `Connect with other ${industry} professionals in your area`,
      url: '#',
      category: 'Industry'
    },
    {
      title: `Small Business Saturday Event`,
      date: getUpcomingDate(21),
      location: `${cityName} Chamber of Commerce`,
      description: 'Support and connect with local small businesses',
      url: '#',
      category: 'Community'
    }
  ]
}

function generateDemoNews(location: string, industry: string) {
  const cityName = location.split(',')[0].trim()
  return [
    {
      title: `${cityName} Small Business Growth Hits Record High`,
      source: `${cityName} Business Journal`,
      date: new Date().toISOString(),
      summary: `Local businesses report strong Q4 growth, with the ${industry} sector leading the way.`,
      url: '#'
    },
    {
      title: `New Partnership Opportunities for ${industry} Companies`,
      source: 'Industry Weekly',
      date: new Date(Date.now() - 86400000).toISOString(),
      summary: `Experts predict increased collaboration between ${industry} businesses and complementary services.`,
      url: '#'
    }
  ]
}

function getUpcomingDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    console.log(`🚀 Brief generation request received...`)

    const formData = await request.json()
    console.log(`📊 Form Data:`, JSON.stringify(formData, null, 2))

    const { businessName, industry, location, targetLeads, targetEvents, userId } = formData

    // Validate required fields
    if (!location || location.length < 3) {
      return NextResponse.json({
        error: "Please provide a valid location",
        requiresMoreInfo: true
      }, { status: 400 })
    }

    // Generate demo data
    const leads = generateDemoLeads(targetLeads || industry || 'Business consultants', location, industry || 'business')
    const events = generateDemoEvents(location, industry || 'business')
    const news = generateDemoNews(location, industry || 'business')

    // Create brief in Supabase
    const briefData = {
      user_id: userId || 'anonymous',
      business_name: businessName || `My ${industry || 'Business'}`,
      industry: industry || 'General',
      location: location,
      leads: leads,
      events: events,
      news: news,
      status: 'completed',
      created_at: new Date().toISOString()
    }

    const { data: brief, error: insertError } = await supabase
      .from('briefs')
      .insert(briefData)
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      // If table doesn't exist or other error, return demo brief ID
      const demoBriefId = `demo-${Date.now()}`

      // Store in localStorage-compatible format
      return NextResponse.json({
        success: true,
        briefId: demoBriefId,
        brief: briefData,
        isDemo: true
      })
    }

    console.log(`✅ Brief created with ID: ${brief.id}`)

    return NextResponse.json({
      success: true,
      briefId: brief.id,
      brief: brief
    })

  } catch (error: any) {
    console.error("❌ Generate API Error:", error)

    return NextResponse.json({
      error: `Generation failed: ${error.message}`,
      requiresMoreInfo: false
    }, { status: 500 })
  }
}
