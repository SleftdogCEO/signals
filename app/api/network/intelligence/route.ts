import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SERPER_API_KEY = process.env.SERPER_API_KEY

// Curated insights by partner category - actionable tips for physician practices.
// Keys mirror the PARTNER_CATEGORIES ids in app/onboarding/page.tsx.
const CURATED_INSIGHTS: Record<string, {
  title: string
  summary: string
  category: string
  relevance_score: number
}[]> = {
  'primary_care': [
    {
      title: "Increase Patient Retention with Same-Day Appointments",
      summary: "PCP practices offering same-day sick visits see 40% higher retention. Block 2-3 slots daily for urgent needs. This reduces no-shows and builds loyalty across your panel.",
      category: "operations",
      relevance_score: 95
    },
    {
      title: "The Closed-Loop Referral Habit That Compounds",
      summary: "PCPs who confirm receipt of every specialist consult note within 24 hours get 30% more inbound referrals back from those specialists. Make this a front-desk SOP.",
      category: "partnerships",
      relevance_score: 93
    }
  ],
  'internal_medicine_subspecialties': [
    {
      title: "Cut Your PCP Consult Note Turnaround to 48 Hours",
      summary: "Sub-specialists who return consult notes within 48 hours of every visit get 25% more PCP referrals within a year. Lead with a one-paragraph summary, not an EHR data dump.",
      category: "partnerships",
      relevance_score: 96
    },
    {
      title: "Curating Your Referring Physician Network",
      summary: "Most subspecialists are referral-saturated. The ones who grow without burnout deliberately educate referring PCPs on which patient mix they're best for. Send polite feedback notes on misroutes.",
      category: "operations",
      relevance_score: 92
    }
  ],
  'psychiatry_pain': [
    {
      title: "Reduce No-Shows with the 48-Hour Confirmation System",
      summary: "Text reminders at 48hrs and 2hrs before appointments cut no-show rates by 50%. Include a 'running late?' option to reschedule instantly.",
      category: "operations",
      relevance_score: 94
    },
    {
      title: "Primary Care Partnerships for Mental Health Practices",
      summary: "PCPs are desperate for reliable psychiatry referrals. Offer a 'fast track' program: guaranteed first appointment within 21 days for their patients and watch your panel fill.",
      category: "partnerships",
      relevance_score: 93
    }
  ],
  'surgery_msk': [
    {
      title: "Post-Op Communication That Drives Repeat Referrals",
      summary: "Surgical specialists who send a brief outcome update to the referring physician at 2 weeks AND 6 weeks post-op see 35% more repeat referrals from the same source.",
      category: "partnerships",
      relevance_score: 95
    },
    {
      title: "The 'Same-Week Consult' Promise for Urgent MSK",
      summary: "Orthopedic and pain practices that offer guaranteed same-week consults for PCP-flagged urgent cases own their local market. Block 2 slots per week for this.",
      category: "operations",
      relevance_score: 91
    }
  ],
  'womens_childrens': [
    {
      title: "Pediatrics: The Allergy & ENT Pipeline",
      summary: "Pediatric practices with named relationships at one allergy and one ENT office route 90% of chronic eczema, food allergy, and chronic otitis cases predictably. Build both pipelines deliberately.",
      category: "partnerships",
      relevance_score: 94
    },
    {
      title: "OB-GYN: The De Facto PCP for Young Women",
      summary: "OB-GYNs who acknowledge their de facto PCP role for women under 40 build dramatically deeper bidirectional referral loops with endocrinology, urology, and psychiatry.",
      category: "operations",
      relevance_score: 92
    }
  ],
  'ent_eye_skin_allergy': [
    {
      title: "The Referral Thank-You Note That Gets Results",
      summary: "Hand-written thank you notes to referring physicians within 48 hours increase future referrals by 25%. Include a brief update on the patient's care plan.",
      category: "partnerships",
      relevance_score: 94
    },
    {
      title: "Allergy + ENT + Pulm: The Tri-Specialty Loop",
      summary: "The strongest sensory-specialty practices have a single named contact at each of the other two. Patients with overlapping conditions get co-managed instead of bouncing.",
      category: "operations",
      relevance_score: 91
    }
  ]
}

// Get partner-category bucket for a physician specialty.
// Keys must match the SPECIALTIES list in app/onboarding/page.tsx.
function getSpecialtyCategory(specialty: string): string {
  const mapping: Record<string, string> = {
    'Primary Care': 'primary_care',
    'Cardiology': 'internal_medicine_subspecialties',
    'Pulmonology': 'internal_medicine_subspecialties',
    'Endocrinology': 'internal_medicine_subspecialties',
    'Gastroenterology': 'internal_medicine_subspecialties',
    'Rheumatology': 'internal_medicine_subspecialties',
    'Neurology': 'internal_medicine_subspecialties',
    'Psychiatry': 'psychiatry_pain',
    'Pain Management': 'psychiatry_pain',
    'Orthopedic Surgery': 'surgery_msk',
    'Plastic Surgery': 'surgery_msk',
    'Urology': 'surgery_msk',
    'Sports Medicine': 'surgery_msk',
    'Pediatrics': 'womens_childrens',
    'OB-GYN': 'womens_childrens',
    'Dermatology': 'ent_eye_skin_allergy',
    'Ophthalmology': 'ent_eye_skin_allergy',
    'ENT (Otolaryngology)': 'ent_eye_skin_allergy',
    'Allergy & Immunology': 'ent_eye_skin_allergy',
  }
  return mapping[specialty] || 'primary_care'
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
        source_name: 'Sleft Signals',
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
            source_name: 'Sleft Signals',
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
        source_name: 'Sleft Signals',
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
        source_name: sourceName || 'Sleft Signals',
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
