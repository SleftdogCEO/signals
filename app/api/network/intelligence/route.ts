import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SERPER_API_KEY = process.env.SERPER_API_KEY

// Curated insights by specialty category - actionable tips, not just news
const CURATED_INSIGHTS: Record<string, {
  title: string
  summary: string
  category: string
  relevance_score: number
}[]> = {
  'primary_care': [
    {
      title: "Increase Patient Retention with Same-Day Appointments",
      summary: "Practices offering same-day sick visits see 40% higher retention. Consider blocking 2-3 slots daily for urgent needs. This reduces no-shows and builds loyalty.",
      category: "operations",
      relevance_score: 95
    },
    {
      title: "The 5-Minute Pre-Visit Survey That Cuts Appointment Time",
      summary: "Sending a brief digital intake form 24 hours before visits reduces average appointment time by 8 minutes while improving documentation quality.",
      category: "technology",
      relevance_score: 92
    }
  ],
  'physical_rehab': [
    {
      title: "Build Orthopedic Referral Relationships That Stick",
      summary: "Top PT practices send monthly outcome reports to referring physicians. Include patient progress photos (with consent) and specific functional improvements.",
      category: "partnerships",
      relevance_score: 96
    },
    {
      title: "Cash Pay PT Programs: What's Actually Working",
      summary: "Practices adding wellness/maintenance programs see 35% revenue increase. Position as 'performance optimization' not just injury recovery.",
      category: "marketing",
      relevance_score: 91
    }
  ],
  'mental_health': [
    {
      title: "Reduce No-Shows with the 48-Hour Confirmation System",
      summary: "Text reminders at 48hrs and 2hrs before appointments cut no-show rates by 50%. Include a 'running late?' option to reschedule instantly.",
      category: "operations",
      relevance_score: 94
    },
    {
      title: "Primary Care Partnerships for Mental Health Practices",
      summary: "PCPs are desperate for reliable mental health referrals. Offer a 'fast track' program: guaranteed first appointment within 7 days for their patients.",
      category: "partnerships",
      relevance_score: 93
    }
  ],
  'dental_vision': [
    {
      title: "Membership Plans: The Alternative to Insurance Dependency",
      summary: "Dental practices with in-house membership plans average 30% higher case acceptance. Typical structure: $30-40/month covers cleanings + 20% off all services.",
      category: "finance",
      relevance_score: 95
    },
    {
      title: "Google Reviews Strategy That Actually Works",
      summary: "Ask for reviews at the moment of peak satisfaction - right after complimenting their smile in the mirror. Text the link before they leave the parking lot.",
      category: "marketing",
      relevance_score: 90
    }
  ],
  'wellness_aesthetic': [
    {
      title: "Before/After Content That Converts",
      summary: "Med spas with consistent before/after posting see 3x more inquiries. Use consistent lighting, angles, and timing. Always get signed photo releases upfront.",
      category: "marketing",
      relevance_score: 96
    },
    {
      title: "Building Your VIP Membership Program",
      summary: "Top med spas generate 40% of revenue from membership programs. Include monthly treatments + product discounts + priority booking.",
      category: "finance",
      relevance_score: 93
    }
  ],
  'specialists': [
    {
      title: "The Referral Thank-You Note That Gets Results",
      summary: "Hand-written thank you notes to referring physicians within 48 hours increase future referrals by 25%. Include a brief update on the patient's care plan.",
      category: "partnerships",
      relevance_score: 94
    },
    {
      title: "Reduce Referral Leakage in Your Specialty",
      summary: "Make it easy: provide referring offices with digital referral forms, direct scheduler phone lines, and same-week appointment availability.",
      category: "operations",
      relevance_score: 91
    }
  ]
}

// Get category from specialty
function getSpecialtyCategory(specialty: string): string {
  const mapping: Record<string, string> = {
    'Primary Care': 'primary_care',
    'Family Medicine': 'primary_care',
    'Internal Medicine': 'primary_care',
    'Pediatrics': 'primary_care',
    'Physical Therapy': 'physical_rehab',
    'Chiropractic': 'physical_rehab',
    'Orthopedics': 'physical_rehab',
    'Pain Management': 'physical_rehab',
    'Psychiatry': 'mental_health',
    'Psychology': 'mental_health',
    'Counseling': 'mental_health',
    'Dentistry': 'dental_vision',
    'Optometry': 'dental_vision',
    'Orthodontics': 'dental_vision',
    'Med Spa': 'wellness_aesthetic',
    'Plastic Surgery': 'wellness_aesthetic',
    'Functional Medicine': 'wellness_aesthetic',
    'Dermatology': 'specialists',
    'Cardiology': 'specialists',
    'OB/GYN': 'specialists',
    'Urgent Care': 'primary_care'
  }
  return mapping[specialty] || 'specialists'
}

// General insights that apply to all practices
const GENERAL_INSIGHTS = [
  {
    title: "AI Scheduling: The Tools That Are Actually Worth It",
    summary: "After testing 12 AI scheduling tools, here's what we found: the best ones integrate with your EHR and handle reschedules automatically. Top picks: Klara, Luma Health, and Phreesia.",
    category: "technology",
    relevance_score: 88
  },
  {
    title: "The Google Business Profile Checklist for Healthcare",
    summary: "Healthcare practices with complete GBP profiles get 70% more appointment requests. Key: add services, Q&A, weekly posts, and respond to ALL reviews within 24 hours.",
    category: "marketing",
    relevance_score: 87
  },
  {
    title: "Staff Retention: What Small Practices Are Doing Differently",
    summary: "Practices with lowest turnover share 3 traits: flexible scheduling, professional development budgets ($500-1000/year), and regular 1-on-1s with leadership.",
    category: "operations",
    relevance_score: 85
  },
  {
    title: "Payment Processing: Stop Overpaying",
    summary: "Most practices overpay by 0.5-1% on card processing. Get quotes from Stax, Square, and Payment Depot. Leverage them against each other.",
    category: "finance",
    relevance_score: 86
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get provider info for personalized intelligence
    let location = 'your area'
    let specialty = 'Healthcare'
    let userInterests: string[] = []

    if (userId) {
      const { data: provider } = await supabase
        .from('providers')
        .select('location, specialty, patients_i_want')
        .eq('user_id', userId)
        .single()

      if (provider) {
        location = provider.location || 'your area'
        specialty = provider.specialty || 'Healthcare'
        userInterests = provider.patients_i_want || []
      }
    }

    const intelligence: {
      id: string
      title: string
      summary: string
      category: string
      source_url: string | null
      source_name: string
      relevance_score: number
      created_at: string
    }[] = []

    // Add curated insights for user's specialty
    const specialtyCategory = getSpecialtyCategory(specialty)
    const curatedForSpecialty = CURATED_INSIGHTS[specialtyCategory] || []

    curatedForSpecialty.forEach((insight, index) => {
      intelligence.push({
        id: `curated-${specialtyCategory}-${index}`,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        source_url: null,
        source_name: 'Sleft Health',
        relevance_score: insight.relevance_score,
        created_at: new Date().toISOString()
      })
    })

    // Add insights for partner categories they're interested in
    userInterests.forEach(interest => {
      const interestInsights = CURATED_INSIGHTS[interest] || []
      interestInsights.slice(0, 1).forEach((insight, index) => {
        // Avoid duplicates
        if (!intelligence.some(i => i.title === insight.title)) {
          intelligence.push({
            id: `curated-${interest}-${index}`,
            title: insight.title,
            summary: `For your ${interest.replace('_', ' ')} partners: ${insight.summary}`,
            category: insight.category,
            source_url: null,
            source_name: 'Sleft Health',
            relevance_score: insight.relevance_score - 5, // Slightly lower since it's for partners
            created_at: new Date().toISOString()
          })
        }
      })
    })

    // Add general insights
    GENERAL_INSIGHTS.forEach((insight, index) => {
      intelligence.push({
        id: `general-${index}`,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        source_url: null,
        source_name: 'Sleft Health',
        relevance_score: insight.relevance_score,
        created_at: new Date().toISOString()
      })
    })

    // Fetch a couple fresh news items from Serper if API key exists
    if (SERPER_API_KEY) {
      try {
        const response = await fetch('https://google.serper.dev/news', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `${specialty} practice growth tips ${new Date().getFullYear()}`,
            num: 3
          })
        })

        if (response.ok) {
          const data = await response.json()
          data.news?.slice(0, 2).forEach((item: { title: string; link: string; snippet: string }, index: number) => {
            const domain = new URL(item.link).hostname.replace('www.', '')
            intelligence.push({
              id: `news-${index}`,
              title: item.title,
              summary: item.snippet,
              category: 'industry',
              source_url: item.link,
              source_name: domain,
              relevance_score: 75,
              created_at: new Date().toISOString()
            })
          })
        }
      } catch (error) {
        console.error('Serper API error:', error)
      }
    }

    // Sort by relevance and return
    intelligence.sort((a, b) => b.relevance_score - a.relevance_score)

    return NextResponse.json({
      intelligence: intelligence.slice(0, 12),
      location,
      specialty
    })
  } catch (error) {
    console.error('Intelligence GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// AI-curated insights endpoint (for Grant's consulting content)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, summary, category, location, specialty, sourceUrl, sourceName } = body

    const { data, error } = await supabase
      .from('market_intelligence')
      .insert({
        title,
        summary,
        category: category || 'insight',
        location: location || null,
        specialty: specialty || null,
        source_url: sourceUrl || null,
        source_name: sourceName || 'Sleft Health',
        relevance_score: 90,
        ai_generated: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating intelligence:', error)
      return NextResponse.json({ error: 'Failed to create intelligence' }, { status: 500 })
    }

    return NextResponse.json({ intelligence: data })
  } catch (error) {
    console.error('Intelligence POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
