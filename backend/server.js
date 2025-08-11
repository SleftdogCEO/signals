require('dotenv').config()

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:')
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('APIFY_API_KEY:', process.env.APIFY_API_KEY ? '✅ Found' : '❌ Missing')
console.log('SERPER_API_KEY:', process.env.SERPER_API_KEY ? '✅ Found' : '❌ Missing') // ADD THIS
console.log('PORT:', process.env.PORT || 3001)
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

const express = require("express")
const cors = require("cors")
const { generateBrief } = require("./services/briefService")
const { scrapeBusinessData } = require("./services/scraperService")
const { getNewsData } = require("./services/newsService")
const { getMeetupEvents } = require("./services/meetupService")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, "https://sleft-signals-mvp.vercel.app"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"], // ADD 127.0.0.1
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' })) // Increase limit for large payloads

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`)
  console.log('Headers:', req.headers)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2))
  }
  next()
})

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Sleft Signals API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: ["AI Strategy Briefs", "Lead Generation", "Market Analysis", "Industry Intelligence", "Networking Events"],
    availableEndpoints: [
      "GET /",
      "GET /health", 
      "POST /api/generate",
      "GET /api/briefs/:id",
      "POST /api/leads",
      "POST /api/networking-events",
      "GET /api/intelligence/:industry",
    ]
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// MAIN GENERATION ENDPOINT - ADD DETAILED LOGGING
app.post("/api/generate", async (req, res) => {
  console.log("🚀 /api/generate endpoint hit!")
  console.log("Request body:", req.body)
  
  try {
    const { businessName, websiteUrl, industry, location, customGoal, networkingKeyword } = req.body

    // Validate required fields
    if (!businessName || !websiteUrl || !industry || !location) {
      console.log("❌ Missing required fields:", { businessName: !!businessName, websiteUrl: !!websiteUrl, industry: !!industry, location: !!location })
      return res.status(400).json({
        error: "Missing required fields",
        required: ["businessName", "websiteUrl", "industry", "location"],
        received: { businessName: !!businessName, websiteUrl: !!websiteUrl, industry: !!industry, location: !!location }
      })
    }

    console.log(`🚀 Generating comprehensive brief for: ${businessName}`)
    console.log(`🎯 Networking keyword: ${networkingKeyword || 'Not specified'}`)

    // PARALLEL EXECUTION WITH BETTER ERROR HANDLING
    console.log("📊 Phase 1: Parallel Data Collection")
    
    const businessDataPromise = scrapeBusinessData({
      businessName,
      websiteUrl,
      industry,
      location,
      customGoal,
      competitorAnalysis: true,
    }).catch(error => {
      console.warn("⚠️ ScraperService error:", error.message)
      return { competitors: [], leads: [], marketAnalysis: {} }
    })
    
    const newsDataPromise = getNewsData(industry, location, businessName, customGoal, networkingKeyword).catch(error => {
      console.warn("⚠️ NewsService error:", error.message)
      return { articles: [], categorized: {} }
    })
    
    const meetupDataPromise = getMeetupEvents({
      networkingKeyword,
      location,
      industry,
      businessName,
      customGoal
    }).catch(error => {
      console.warn("⚠️ MeetupService error:", error.message)
      return { events: [] }
    })

    const [businessData, newsData, meetupData] = await Promise.all([
      businessDataPromise,
      newsDataPromise, 
      meetupDataPromise
    ])

    console.log("📊 Data Collection Results:")
    console.log(`  • Competitors: ${businessData.competitors?.length || 0}`)
    console.log(`  • Leads Generated: ${businessData.leads?.length || 0}`)
    console.log(`  • News Articles: ${newsData.articles?.length || 0}`)
    console.log(`  • Networking Events: ${meetupData.events?.length || 0}`)

    // Generate AI brief even with limited data
    console.log("🧠 Phase 4: AI Strategy Brief Generation")
    const brief = await generateBrief({
      businessName,
      websiteUrl,
      industry,
      location,
      customGoal,
      networkingKeyword,
      businessData,
      newsData,
      meetupData
    })

    // Generate unique ID and store enhanced data
    const briefId = require("nanoid").nanoid(10)

    // Store brief data
    global.briefsStorage = global.briefsStorage || new Map()
    global.briefsStorage.set(briefId, {
      id: briefId,
      businessName,
      content: brief,
      businessData,
      newsData,
      meetupData,
      createdAt: new Date().toISOString(),
      metadata: {
        industry,
        location,
        websiteUrl,
        customGoal,
        networkingKeyword,
        version: "2.2"
      }
    })

    console.log(`✅ Comprehensive brief generated successfully for: ${businessName}`)

    res.json({
      success: true,
      briefId,
      message: "Strategic brief generated successfully",
      summary: {
        competitorsAnalyzed: businessData.competitors?.length || 0,
        leadsGenerated: businessData.leads?.length || 0,
        newsArticles: newsData.articles?.length || 0,
        networkingEvents: meetupData.events?.length || 0,
        marketSaturation: businessData.marketAnalysis?.saturation || "Unknown",
      },
    })
  } catch (error) {
    console.error("❌ Error generating comprehensive brief:", error)
    res.status(500).json({
      error: "Failed to generate brief",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// NEW ENDPOINT: Get networking events separately
app.post("/api/networking-events", async (req, res) => {
  try {
    const { networkingKeyword, location, industry, businessName } = req.body

    if (!networkingKeyword && !industry) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["networkingKeyword or industry"],
      })
    }

    console.log(`🤝 Fetching networking events for keyword: ${networkingKeyword || industry}`)

    const meetupData = await getMeetupEvents({
      networkingKeyword,
      location,
      industry,
      businessName,
    })

    res.json({
      success: true,
      events: meetupData.events || [],
      summary: {
        totalEvents: meetupData.events?.length || 0,
        upcomingEvents: meetupData.events?.filter(event => new Date(event.date) > new Date()).length || 0,
        eventTypes: [...new Set(meetupData.events?.map(e => e.type) || [])],
        locations: [...new Set(meetupData.events?.map(e => e.address?.split(',')[0]) || [])],
      },
      metadata: meetupData.metadata || {}
    })
  } catch (error) {
    console.error("❌ Error fetching networking events:", error)
    res.status(500).json({
      error: "Failed to fetch networking events",
      message: error.message,
    })
  }
})

// Update the briefService.js to handle meetup data - ADD THIS NOTE
// You'll also need to update briefService.js to include meetup data in the AI brief generation

// Get brief by ID with enhanced data
app.get("/api/briefs/:id", (req, res) => {
  try {
    const { id } = req.params
    const briefsStorage = global.briefsStorage || new Map()
    const brief = briefsStorage.get(id)

    if (!brief) {
      return res.status(404).json({
        error: "Brief not found",
        message: "The requested brief does not exist or has expired",
      })
    }

    // Add real-time metrics
    const enhancedBrief = {
      ...brief,
      analytics: {
        viewCount: 1, // In production, this would be tracked
        lastViewed: new Date().toISOString(),
        dataFreshness: Math.floor((Date.now() - new Date(brief.createdAt).getTime()) / (1000 * 60 * 60)), // hours
      },
    }

    res.json({
      success: true,
      brief: enhancedBrief,
    })
  } catch (error) {
    console.error("❌ Error fetching brief:", error)
    res.status(500).json({
      error: "Failed to fetch brief",
      message: error.message,
    })
  }
})

// Get high-quality leads endpoint
app.post("/api/leads", async (req, res) => {
  try {
    const { industry, location, businessName, leadType } = req.body

    const businessData = await scrapeBusinessData({
      businessName: businessName || "Business",
      industry,
      location,
      competitorAnalysis: true,
    })

    const filteredLeads =
      leadType && leadType !== "all"
        ? businessData.leads?.filter((lead) => lead.leadType === leadType) || []
        : businessData.leads || []

    res.json({
      success: true,
      leads: filteredLeads,
      summary: {
        totalLeads: filteredLeads.length,
        averageScore: filteredLeads.length
          ? Math.round(filteredLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / filteredLeads.length)
          : 0,
        totalPotentialValue: filteredLeads.reduce((sum, lead) => sum + lead.potentialValue, 0),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching leads:", error)
    res.status(500).json({
      error: "Failed to fetch leads",
      message: error.message,
    })
  }
})

// Get industry intelligence endpoint
app.get("/api/intelligence/:industry", async (req, res) => {
  try {
    const { industry } = req.params
    const { location, category } = req.query

    const newsData = await getNewsData(industry, location)

    const filteredNews =
      category && category !== "all" ? newsData.categorized?.[category] || [] : newsData.articles || []

    res.json({
      success: true,
      intelligence: {
        articles: filteredNews,
        categories: Object.keys(newsData.categorized || {}),
        summary: {
          totalArticles: filteredNews.length,
          averageRelevance: filteredNews.length
            ? Math.round(filteredNews.reduce((sum, article) => sum + article.relevanceScore, 0) / filteredNews.length)
            : 0,
          sentimentDistribution: {
            positive: filteredNews.filter((a) => a.sentiment === "positive").length,
            neutral: filteredNews.filter((a) => a.sentiment === "neutral").length,
            negative: filteredNews.filter((a) => a.sentiment === "negative").length,
          },
        },
      },
    })
  } catch (error) {
    console.error("❌ Error fetching intelligence:", error)
    res.status(500).json({
      error: "Failed to fetch intelligence",
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /health", 
      "POST /api/generate",
      "GET /api/briefs/:id",
      "POST /api/leads",
      "POST /api/networking-events",
      "GET /api/intelligence/:industry",
    ],
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Sleft Signals API Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`✨ Features: AI Strategy Briefs | Lead Generation | Market Analysis | Industry Intelligence | Networking Events`)
  console.log(`🔗 Available at: http://localhost:${PORT}`)
})

module.exports = app
