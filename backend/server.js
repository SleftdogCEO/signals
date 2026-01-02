require('dotenv').config()

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:')
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('APIFY_API_KEY:', process.env.APIFY_API_KEY ? '✅ Found' : '❌ Missing')
console.log('SERPER_API_KEY:', process.env.SERPER_API_KEY ? '✅ Found' : '❌ Missing')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Found' : '❌ Missing')
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing')
console.log('PORT:', process.env.PORT || 3001)
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

const express = require("express")
const cors = require("cors")
const { createClient } = require('@supabase/supabase-js')
const { nanoid } = require('nanoid')

// Import services correctly
const { generateBrief } = require("./services/briefService")
const { scrapeBusinessData } = require("./services/scraperService")
const { getNewsData } = require("./services/newsService")
const { getMeetupEvents } = require("./services/meetupService")

// Simple brief generator (no AI required)
function generateSimpleBrief({ businessName, industry, location, customGoal, businessData, newsData, meetupData }) {
  const leadsCount = businessData?.leads?.length || 0
  const newsCount = newsData?.articles?.length || 0
  const eventsCount = meetupData?.events?.length || 0

  const topLeads = (businessData?.leads || []).slice(0, 3).map(l => l.businessName).join(', ')
  const topNews = (newsData?.articles || []).slice(0, 2).map(n => n.title).join('; ')

  return `# Strategy Brief for ${businessName}

## Executive Summary
We've analyzed the ${industry} market in ${location} to identify opportunities aligned with your goal: "${customGoal || 'business growth'}".

## Key Findings

### Local Leads & Partners (${leadsCount} found)
${leadsCount > 0 ? `Top opportunities: ${topLeads}` : 'No leads found in this search.'}

### Industry News (${newsCount} articles)
${newsCount > 0 ? `Recent headlines: ${topNews}` : 'No recent news found.'}

### Networking Events (${eventsCount} upcoming)
${eventsCount > 0 ? `${eventsCount} networking opportunities identified in your area.` : 'No upcoming events found.'}

## Next Steps
1. Review the leads below and identify your top 3 outreach targets
2. Check the news articles for conversation starters
3. RSVP to relevant networking events

---
*Generated ${new Date().toLocaleDateString()}*`
}

// Initialize Supabase client with SERVICE ROLE KEY for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key instead of anon key
)

// Alternative: Create two clients
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const app = express()
const PORT = process.env.PORT || 3001

// ENVIRONMENT-AWARE CORS Configuration
const allowedOrigins = {
  development: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002"
  ],
  production: [
    "https://sleft-signals-mvp.vercel.app",
    "https://sleft-signal.onrender.com",
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL
  ].filter(Boolean)
}

const currentOrigins = allowedOrigins[process.env.NODE_ENV] || allowedOrigins.development

app.use(cors({
  origin: currentOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}))

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Environment-aware logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`)
    if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
      console.log('Headers:', req.headers)
      console.log('Body:', JSON.stringify(req.body, null, 2))
    }
  }
  next()
})

// Health check routes
app.get("/", (req, res) => {
  res.json({
    status: "Sleft Signals API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors_origins: currentOrigins,
    features: ["AI Strategy Briefs", "Lead Generation", "Market Analysis", "Industry Intelligence", "Networking Events"],
    availableEndpoints: [
      "GET /",
      "GET /health", 
      "POST /api/generate",
      "GET /api/briefs/:id",
      "GET /api/user-briefs/:userId",
      "DELETE /api/briefs/:id"
    ]
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// MAIN GENERATION ENDPOINT - FIXED USER ID HANDLING
app.post("/api/generate", async (req, res) => {
  try {
    const { businessName, websiteUrl, industry, location, customGoal, networkingKeyword, partnershipGoals, conversationData, userId, targetLeads, targetEvents } = req.body

    console.log("🚀 Starting comprehensive business intelligence generation...")
    console.log(`📊 Request: ${businessName} in ${industry} at ${location}`)
    console.log(`🎯 Target Partners: ${targetLeads || 'Not specified'}`)
    console.log(`📅 Target Events: ${targetEvents || 'Not specified'}`)
    console.log(`👤 User ID received: "${userId}" (type: ${typeof userId})`)

    // VALIDATE USER ID
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn(`⚠️ No valid userId provided. Received: "${userId}"`)
      return res.status(400).json({
        success: false,
        error: "User authentication required. Please log in and try again.",
        details: "Missing or invalid user ID"
      })
    }

    console.log('Backend: Generating brief with conversation data:', {
      businessName,
      hasConversationData: !!conversationData,
      userId
    });

    // Generate all data in parallel - pass targetLeads for specific partner search
    const [businessData, newsData, meetupData] = await Promise.all([
      scrapeBusinessData({ businessName, websiteUrl, industry, location, customGoal, targetLeads }),
      getNewsData(industry, location, businessName, customGoal, networkingKeyword),
      getMeetupEvents({ networkingKeyword, location, industry, businessName, customGoal, targetEvents })
    ])

    // Skip AI brief generation for now - use placeholder
    // TODO: Re-enable when OpenAI API key is valid
    // const briefContent = await generateBrief({
    //   businessName,
    //   websiteUrl,
    //   industry,
    //   location,
    //   customGoal,
    //   networkingKeyword,
    //   businessData,
    //   newsData,
    //   meetupData,
    //   conversationData
    // })

    // Generate a simple summary without AI
    const briefContent = generateSimpleBrief({
      businessName,
      industry,
      location,
      customGoal,
      businessData,
      newsData,
      meetupData
    })

    // Create comprehensive brief object
    const briefData = {
      businessName,
      content: briefContent,
      metadata: {
        industry,
        location,
        websiteUrl,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now()
      },
      businessData,
      newsData,
      meetupData,
      formData: {
        businessName,
        websiteUrl,
        industry,
        location,
        customGoal,
        networkingKeyword,
        userId
      }
    }

    // Save to Supabase with better error handling
    let briefId = null
    try {
      console.log(`💾 Saving brief to database...`)
      console.log(`👤 Confirmed userId for save: "${userId}"`)
      
      // Generate a proper ID
      const generatedId = nanoid(12)
      
      const briefToInsert = {
        id: generatedId,
        user_id: userId,
        business_name: businessName,
        content: briefContent,
        metadata: briefData.metadata,
        business_data: businessData,
        news_data: newsData,
        meetup_data: meetupData,
        form_data: briefData.formData,
        brief_status: 'completed',
        is_deleted: false,
        created_at: new Date().toISOString()
      }

      console.log(`📝 Attempting to insert brief with:`, {
        id: briefToInsert.id,
        user_id: briefToInsert.user_id,
        business_name: briefToInsert.business_name,
        brief_status: briefToInsert.brief_status
      })
      
      // Use service role client for backend operations
      const { data, error } = await supabaseService
        .from('user_briefs')
        .insert([briefToInsert])
        .select('id, user_id')
        .single()

      if (error) {
        console.error('❌ Error saving brief to database:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // If RLS error, try without RLS bypass
        if (error.code === '42501') {
          console.log('🔄 Retrying with auth context...')
          
          // Alternative: Try with auth.uid() context
          const { data: retryData, error: retryError } = await supabaseAnon
            .from('user_briefs')
            .insert([{
              ...briefToInsert,
              // Let Supabase auto-generate the user_id based on auth context if needed
            }])
            .select('id, user_id')
            .single()
            
          if (retryError) {
            console.error('❌ Retry also failed:', retryError)
            return res.status(500).json({
              success: false,
              error: "Database permission error - unable to save brief",
              details: `RLS Policy Error: ${error.message}`,
              troubleshooting: "Please check Supabase RLS policies for user_briefs table"
            })
          } else {
            briefId = retryData.id
            console.log(`✅ Brief saved on retry with ID: ${briefId}`)
          }
        } else {
          return res.status(500).json({
            success: false,
            error: "Failed to save brief to database",
            details: error.message,
            code: error.code
          })
        }
      } else {
        briefId = data.id
        console.log(`✅ Brief saved to database with ID: ${briefId}`)
        console.log(`✅ Brief saved with user_id: "${data.user_id}"`)
      }
    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      return res.status(500).json({
        success: false,
        error: "Database connection error",
        details: dbError.message
      })
    }

    console.log(`✅ Final briefId being returned: ${briefId}`)

    // CRITICAL: Always return briefId
    const response = {
      success: true,
      briefId: briefId,
      brief: {
        id: briefId,
        ...briefData,
        createdAt: new Date().toISOString()
      },
      message: "Comprehensive business intelligence generated successfully"
    }

    console.log(`📤 Sending response with briefId: ${response.briefId}`)
    res.json(response)

  } catch (error) {
    console.error("❌ Generation Error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to generate business intelligence",
      details: error.message
    })
  }
})

// ENHANCED user briefs endpoint with debugging
app.get("/api/user-briefs/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    console.log(`📋 Fetching briefs for user: "${userId}"`)
    console.log(`📄 Page: ${page}, Limit: ${limit}`)

    // VALIDATE USER ID
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID provided"
      })
    }

    // Debug: Check what's in database
    const { data: allBriefs, error: countError } = await supabase
      .from('user_briefs')
      .select('id, user_id, business_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (countError) {
      console.error('❌ Error checking all briefs:', countError)
    } else {
      console.log(`📊 Total briefs in database: ${allBriefs?.length || 0}`)
      console.log(`📊 Briefs with user_id="${userId}": ${allBriefs?.filter(b => b.user_id === userId).length || 0}`)
      console.log(`📊 Briefs with NULL user_id: ${allBriefs?.filter(b => b.user_id === null).length || 0}`)
      
      // Show sample of user IDs
      const userIds = [...new Set(allBriefs?.map(b => b.user_id).filter(Boolean))]
      console.log(`📊 Sample user IDs in database:`, userIds.slice(0, 3))
    }

    const { data: briefs, error, count } = await supabase
      .from('user_briefs')
      .select(`
        id,
        business_name,
        metadata,
        created_at,
        brief_status,
        form_data,
        user_id
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('❌ Error fetching user briefs:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch briefs',
        details: error.message
      })
    }

    console.log(`✅ Found ${briefs?.length || 0} briefs for user "${userId}"`)

    res.json({
      success: true,
      briefs: briefs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      debug: {
        userId: userId,
        totalInDatabase: allBriefs?.length || 0,
        userSpecific: briefs?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ Get user briefs error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user briefs',
      details: error.message
    })
  }
})

// Get specific brief by ID
app.get("/api/briefs/:id", async (req, res) => {
  try {
    const { id } = req.params
    console.log(`📖 Fetching brief with ID: ${id}`)

    if (!id || id === 'null' || id === 'undefined') {
      console.error('❌ Invalid brief ID provided:', id)
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid brief ID' 
      })
    }

    const { data: brief, error } = await supabaseService
      .from('user_briefs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !brief) {
      console.error('❌ Error fetching brief:', error)
      return res.status(404).json({ 
        success: false, 
        error: 'Brief not found' 
      })
    }

    // Transform data to match expected format
    const formattedBrief = {
      id: brief.id,
      businessName: brief.business_name,
      content: brief.content,
      createdAt: brief.created_at,
      metadata: brief.metadata || {},
      businessData: brief.business_data || null,
      newsData: brief.news_data || null,
      meetupData: brief.meetup_data || null,
      formData: brief.form_data || null,
      userId: brief.user_id,
      briefStatus: brief.brief_status
    }

    console.log(`✅ Brief fetched successfully: ${id}`)
    res.json({
      success: true,
      brief: formattedBrief
    })

  } catch (error) {
    console.error('❌ Get brief error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brief'
    })
  }
})

// Delete brief (soft delete)
app.delete("/api/briefs/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    console.log(`🗑️ Deleting brief ${id} for user ${userId}`)

    if (!id || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Brief ID and User ID are required'
      })
    }

    const { error } = await supabaseService
      .from('user_briefs')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Error deleting brief:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete brief' 
      })
    }

    console.log(`✅ Brief ${id} deleted successfully`)
    res.json({
      success: true,
      message: 'Brief deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete brief error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete brief'
    })
  }
})

// Environment-aware error handling
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
    environment: process.env.NODE_ENV || "development"
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sleft Signals API Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 CORS enabled for:`, currentOrigins)
  console.log(`✨ Features: AI Strategy Briefs | Lead Generation | Market Analysis`)
  console.log(`🔗 Available at: http://localhost:${PORT}`)
})

module.exports = app
