const axios = require('axios')

// Rate limiting variables
let lastRequestTime = 0
const RATE_LIMIT_MS = 1000 // 1 second between requests (Serper allows higher rates)
let dailyNewsUsage = 0
const DAILY_NEWS_LIMIT = 100 // Serper has much higher limits

async function getNewsData(industry, location, businessName = "", customGoal = "", networkingKeyword = "") {
  try {
    console.log(`📰 Fetching TOP 5 hyper-personalized articles...`)
    console.log(`🏢 Business: ${businessName}`)
    console.log(`🏭 Industry: ${industry}`)
    console.log(`📍 Location: ${location}`)
    console.log(`🎯 Custom Goal: ${customGoal || 'Not specified'}`)
    console.log(`🤝 Networking: ${networkingKeyword || 'Not specified'}`)

    // Use enhanced query generation
    const searchQueries = generateEnhancedPersonalizedQueries(industry, location, businessName, customGoal, networkingKeyword)
    console.log(`🔍 Generated ${searchQueries.length} priority-ranked queries`)

    const newsResults = []
    const targetArticleCount = 15 // Fetch more to filter down to best 5

    // Execute queries in priority order
    for (const queryData of searchQueries) {
      if (newsResults.length >= targetArticleCount) break
      
      try {
        const requestData = {
          q: queryData.query,
          gl: "us",
          hl: "en", 
          num: queryData.maxItems || 10,
          tbs: getDateFilter(queryData.dateFrom),
          autocorrect: true
        }

        const config = {
          method: 'post',
          url: 'https://google.serper.dev/news',
          headers: { 
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(requestData),
          timeout: 30000
        }

        const response = await axios.request(config)
        const serperData = response.data

        if (serperData.news && serperData.news.length > 0) {
          const processedArticles = serperData.news
            .filter(article => article.title && article.title.length > 10)
            .map(article => {
              const processed = processSerperArticle(article, industry, location, businessName, customGoal, queryData.type)
              // Use enhanced scoring
              processed.relevanceScore = calculateEnhancedPersonalizationScore(
                processed, industry, businessName, customGoal, networkingKeyword, location
              )
              processed.searchContext = queryData.type
              processed.priority = queryData.priority
              processed.personalizedFor = businessName || `${industry} business`
              return processed
            })
            .filter(article => article.relevanceScore >= 30) // Higher threshold for quality

          newsResults.push(...processedArticles)
          console.log(`✅ Query "${queryData.type}": ${processedArticles.length} quality articles (relevance ≥30)`)
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting
      } catch (queryError) {
        console.warn(`⚠️ Query failed: ${queryData.type}`, queryError.message)
      }
    }

    // SMART SELECTION FOR TOP 5 ARTICLES
    const topArticles = selectTop5Articles(newsResults, industry, businessName, customGoal)
    const categorizedNews = groupPersonalizedNews(topArticles, industry)

    console.log(`🎯 Selected TOP 5 articles with avg relevance: ${
      Math.round(topArticles.reduce((sum, a) => sum + a.relevanceScore, 0) / topArticles.length)
    }`)

    return {
      articles: topArticles,
      categorized: categorizedNews,
      totalFound: newsResults.length,
      lastUpdated: new Date().toISOString(),
      sources: [...new Set(topArticles.map(a => a.source))],
      selectionCriteria: {
        totalCandidates: newsResults.length,
        selectedCount: topArticles.length,
        averageRelevance: Math.round(topArticles.reduce((sum, a) => sum + a.relevanceScore, 0) / topArticles.length),
        topCategories: Object.keys(categorizedNews).slice(0, 3)
      },
      personalizationSummary: {
        businessName: businessName || `${industry} Business`,
        industry,
        location,
        hasCustomGoal: !!customGoal,
        hasNetworkingFocus: !!networkingKeyword,
        optimizedFor: "TOP_5_MOST_RELEVANT"
      },
      apiProvider: "Google Serper API - Enhanced Selection"
    }

  } catch (error) {
    console.error("❌ Enhanced News Intelligence Error:", error)
    return generatePersonalizedMockNews(industry, location, businessName, customGoal)
  }
}

// NEW: Process Serper API article response
function processSerperArticle(article, industry, location, businessName, customGoal, searchType) {
  const title = article.title || ""
  const description = article.snippet || ""
  const published = article.date || new Date().toISOString()
  
  // Serper provides direct article URLs
  const articleUrl = article.link || "#"
  
  return {
    title: title,
    description: description,
    url: articleUrl, // Direct article URL from Serper
    source: article.source || extractSourceFromUrl(articleUrl),
    sourceUrl: article.source ? `https://${article.source}` : extractDomainFromUrl(articleUrl),
    published: published,
    image: article.imageUrl || null,
    relevanceScore: calculateHyperPersonalizedRelevance(article, industry, location, businessName, customGoal),
    category: categorizePersonalizedNews(title, description, industry, searchType),
    sentiment: analyzeSentiment(title + " " + description),
    keyInsights: extractPersonalizedInsights(article, industry, businessName, customGoal),
    personalizedTags: generatePersonalizedTags(article, industry, location, businessName),
    searchType: searchType,
    isRssLink: false, // Serper provides direct URLs
    rssLink: null,
    guid: null,
    position: article.position || 0, // Serper provides ranking position
    serperData: {
      position: article.position,
      source: article.source,
      date: article.date
    }
  }
}

// NEW: Convert date range to Serper date filter
function getDateFilter(dateFrom) {
  if (!dateFrom) return undefined
  
  const now = new Date()
  const fromDate = new Date(dateFrom)
  const daysDiff = Math.floor((now - fromDate) / (1000 * 60 * 60 * 24))
  
  // Serper date filters
  if (daysDiff <= 1) return "qdr:d" // Past day
  if (daysDiff <= 7) return "qdr:w" // Past week
  if (daysDiff <= 30) return "qdr:m" // Past month
  if (daysDiff <= 365) return "qdr:y" // Past year
  
  return undefined // Any time
}

function generateHyperPersonalizedQueries(industry, location, businessName = "", customGoal = "") {
  const currentYear = new Date().getFullYear()
  const queries = []
  
  // Extract location components for better targeting
  const locationParts = location.split(',').map(part => part.trim())
  const city = locationParts[0] || location
  const state = locationParts[1] || ""
  
  // 1. Local Industry Trends (Highest Priority)
  queries.push({
    type: "local_industry_trends",
    query: `"${industry}" ${city} trends ${currentYear}`,
    maxItems: 8,
    dateFrom: getDateDaysAgo(30),
    weight: 1.0
  })

  // 2. Industry Growth & Opportunities
  queries.push({
    type: "industry_growth_opportunities", 
    query: `${industry} business growth opportunities ${currentYear}`,
    maxItems: 6,
    dateFrom: getDateDaysAgo(60),
    weight: 0.9
  })

  // 3. Business-Specific News (if business name provided)
  if (businessName && businessName.length > 3) {
    queries.push({
      type: "business_specific",
      query: `"${businessName}" OR "${industry}" ${city} news`,
      maxItems: 5,
      dateFrom: getDateDaysAgo(90),
      weight: 1.0
    })
  }

  // 4. Custom Goal-Aligned News (if provided)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    if (goalKeywords.length > 0) {
      queries.push({
        type: "goal_aligned_news",
        query: `${goalKeywords.slice(0, 3).join(' OR ')} ${industry}`,
        maxItems: 5,
        dateFrom: getDateDaysAgo(45),
        weight: 1.0
      })
    }
  }

  // 5. Market Intelligence & Innovation
  queries.push({
    type: "market_intelligence",
    query: `${industry} market trends innovation ${currentYear}`,
    maxItems: 6,
    dateFrom: getDateDaysAgo(45),
    weight: 0.8
  })

  // 6. Location-Specific Business News
  if (city && city.length > 2) {
    queries.push({
      type: "location_business_news",
      query: `business news ${city} ${state} ${industry}`,
      maxItems: 4,
      dateFrom: getDateDaysAgo(30),
      weight: 0.7
    })
  }

  return queries.slice(0, 4) // Limit to top 4 queries for efficiency
}

function calculateHyperPersonalizedRelevance(article, industry, location, businessName, customGoal) {
  let score = 0
  const title = (article.title || "").toLowerCase()
  const description = (article.snippet || "").toLowerCase()
  const fullText = title + " " + description
  const industryLower = industry.toLowerCase()

  // Business name mentions (highest priority)
  if (businessName && businessName.length > 2) {
    const businessLower = businessName.toLowerCase()
    if (title.includes(businessLower)) score += 40
    if (description.includes(businessLower)) score += 30
  }

  // Direct industry mentions (high priority)
  if (title.includes(industryLower)) score += 35
  if (description.includes(industryLower)) score += 25

  // Location relevance
  if (location && location.length > 2) {
    const locationTerms = location.toLowerCase().split(/[,\s]+/)
    locationTerms.forEach(term => {
      if (term.length > 2) {
        if (title.includes(term)) score += 20
        if (description.includes(term)) score += 15
      }
    })
  }

  // Industry-specific keywords
  const industryKeywords = getEnhancedIndustryKeywords(industry)
  industryKeywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase()
    if (title.includes(keywordLower)) score += 12
    if (description.includes(keywordLower)) score += 8
  })

  // Custom goal alignment
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    goalKeywords.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) score += 15
    })
  }

  // Business value keywords
  const highValueKeywords = ["growth", "revenue", "profit", "expansion", "innovation", "partnership", "acquisition", "funding", "investment"]
  highValueKeywords.forEach(keyword => {
    if (fullText.includes(keyword)) score += 8
  })

  // Serper position bonus (higher positions are more relevant)
  if (article.position) {
    const positionBonus = Math.max(0, 10 - article.position)
    score += positionBonus
  }

  // Source credibility bonus
  if (article.source) {
    const credibleSources = ["reuters", "bloomberg", "wsj", "forbes", "techcrunch", "cnn", "bbc"]
    if (credibleSources.some(source => article.source.toLowerCase().includes(source))) {
      score += 10
    }
  }

  // Recency bonus
  score += getRecencyBonus(article.date)

  return Math.min(score, 100) // Cap at 100
}

function extractSourceFromUrl(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return domain.split('.')[0] // Get main domain name
  } catch {
    return "News Source"
  }
}

function extractPersonalizedInsights(article, industry, businessName, customGoal) {
  const insights = []
  const fullText = ((article.title || "") + " " + (article.snippet || "")).toLowerCase()

  // Extract business-specific insights
  if (businessName && businessName.length > 2) {
    if (fullText.includes(businessName.toLowerCase())) {
      insights.push(`Direct relevance to ${businessName}`)
    }
  }

  // Extract numerical insights
  const percentageMatches = fullText.match(/(\d+(?:\.\d+)?)%/g)
  if (percentageMatches) {
    percentageMatches.slice(0, 2).forEach(match => {
      if (fullText.includes("growth") || fullText.includes("increase")) {
        insights.push(`${match} growth indicator`)
      } else {
        insights.push(`${match} market metric`)
      }
    })
  }

  // Extract monetary values
  const moneyMatches = fullText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(million|billion|trillion|k)?/gi)
  if (moneyMatches) {
    moneyMatches.slice(0, 1).forEach(match => {
      insights.push(`${match} market value`)
    })
  }

  // Goal-specific insights
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    const matchingGoals = goalKeywords.filter(keyword => 
      fullText.includes(keyword.toLowerCase())
    )
    if (matchingGoals.length > 0) {
      insights.push("Goal-aligned opportunity")
    }
  }

  // Industry trends
  if (fullText.includes("trend") || fullText.includes("forecast")) {
    insights.push("Industry trend analysis")
  }

  // Add Serper-specific insights
  if (article.position && article.position <= 3) {
    insights.push("Top news ranking")
  }

  return insights.slice(0, 4)
}

function generatePersonalizedTags(article, industry, location, businessName) {
  const tags = []
  const fullText = `${article.title} ${article.snippet}`.toLowerCase()
  
  // Add industry tag
  tags.push(industry)
  
  // Add location tags
  if (location && location.length > 2) {
    const locationTerms = location.toLowerCase().split(/[,\s]+/)
    locationTerms.forEach(term => {
      if (term.length > 2 && fullText.includes(term)) {
        tags.push(term.charAt(0).toUpperCase() + term.slice(1))
      }
    })
  }
  
  // Add business-specific tag
  if (businessName && businessName.length > 2 && fullText.includes(businessName.toLowerCase())) {
    tags.push("Business Relevant")
  }
  
  // Content-based tags
  if (fullText.includes("growth") || fullText.includes("expansion")) tags.push("Growth")
  if (fullText.includes("innovation") || fullText.includes("technology")) tags.push("Innovation")
  if (fullText.includes("market") || fullText.includes("trend")) tags.push("Market Intelligence")
  if (fullText.includes("funding") || fullText.includes("investment")) tags.push("Investment")
  
  // Add credibility tag for known sources
  if (article.source) {
    const credibleSources = ["reuters", "bloomberg", "wsj", "forbes"]
    if (credibleSources.some(source => article.source.toLowerCase().includes(source))) {
      tags.push("Premium Source")
    }
  }

  return [...new Set(tags)].slice(0, 6)
}

// Keep all existing helper functions (getDateDaysAgo, extractGoalKeywords, etc.)
function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function extractGoalKeywords(customGoal) {
  const goalText = customGoal.toLowerCase()
  const keywords = []
  
  // Extract meaningful keywords from custom goal
  const meaningfulWords = goalText
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'they', 'have', 'more', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'into', 'only', 'could', 'other', 'after', 'first', 'well', 'also'].includes(word))
  
  keywords.push(...meaningfulWords.slice(0, 5))
  
  // Business growth patterns
  if (goalText.includes("expand") || goalText.includes("growth") || goalText.includes("scale")) {
    keywords.push("expansion", "growth", "scaling")
  }
  
  if (goalText.includes("partner") || goalText.includes("collaborate")) {
    keywords.push("partnership", "collaboration")
  }
  
  if (goalText.includes("customer") || goalText.includes("client")) {
    keywords.push("customer acquisition", "client development")
  }
  
  if (goalText.includes("digital") || goalText.includes("technology")) {
    keywords.push("digital transformation", "technology")
  }
  
  return [...new Set(keywords)].slice(0, 8)
}

function getEnhancedIndustryKeywords(industry) {
  const enhancedKeywordMap = {
    "financial services": ["banking", "finance", "investment", "lending", "credit", "deposits", "wealth management", "fintech"],
    "restaurant": ["restaurant", "food", "dining", "culinary", "hospitality", "chef", "menu", "catering", "delivery"],
    "retail": ["retail", "shopping", "store", "ecommerce", "consumer", "sales", "merchandise"],
    "healthcare": ["healthcare", "medical", "health", "patient", "clinic", "doctor", "treatment", "therapy"],
    "technology": ["technology", "tech", "software", "digital", "innovation", "startup", "AI", "automation"],
    "real estate": ["real estate", "property", "housing", "mortgage", "investment", "development"],
    "manufacturing": ["manufacturing", "production", "factory", "industrial", "supply chain", "automation"]
  }

  const industryLower = industry.toLowerCase()
  for (const [key, keywords] of Object.entries(enhancedKeywordMap)) {
    if (industryLower.includes(key)) {
      return keywords
    }
  }

  return ["business", "industry", "market", "commercial", "service", "enterprise"]
}

function calculatePersonalizationScore(article, industry, businessName, customGoal) {
  let score = 0
  const fullText = `${article.title} ${article.description}`.toLowerCase()
  
  // Business name relevance (25 points)
  if (businessName && businessName.length > 2) {
    if (fullText.includes(businessName.toLowerCase())) score += 25
  }
  
  // Industry relevance (25 points)
  if (fullText.includes(industry.toLowerCase())) score += 25
  
  // Custom goal relevance (25 points)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    let goalMatches = 0
    goalKeywords.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) goalMatches += 5
    })
    score += Math.min(goalMatches, 25)
  }
  
  // Search context bonus (25 points)
  if (article.searchContext === 'business_specific') score += 25
  else if (article.searchContext === 'local_industry_trends') score += 20
  else if (article.searchContext === 'goal_aligned_news') score += 20
  else score += 10
  
  return Math.min(score, 100)
}

function categorizePersonalizedNews(title, description, industry, searchType) {
  const titleLower = title.toLowerCase()
  const descLower = description.toLowerCase()
  const fullText = titleLower + " " + descLower
  
  // Search type-based categorization
  if (searchType === 'local_industry_trends') return "Local Market Trends"
  if (searchType === 'business_specific') return "Business Spotlight"
  if (searchType === 'goal_aligned_news') return "Strategic Opportunities"
  if (searchType === 'location_business_news') return "Regional Business News"
  
  // Content-based categorization
  const categories = {
    "Growth Opportunities": ["growth", "expansion", "opportunity", "boom", "emerging"],
    "Market Analysis": ["market", "analysis", "report", "study", "research", "forecast"],
    "Technology & Innovation": ["technology", "innovation", "AI", "digital", "automation"],
    "Investment & Funding": ["investment", "funding", "capital", "IPO", "acquisition"],
    "Industry Leadership": ["CEO", "founder", "leadership", "executive", "strategy"],
    "Customer Insights": ["consumer", "customer", "behavior", "demand"],
    "Partnership News": ["partnership", "collaboration", "alliance", "merger"]
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      return category
    }
  }

  return "Industry Intelligence"
}

function groupPersonalizedNews(articles, industry) {
  const grouped = articles.reduce((acc, article) => {
    const category = article.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(article)
    return acc
  }, {})

  // Sort categories by relevance
  const priorityOrder = [
    "Business Spotlight",
    "Local Market Trends", 
    "Strategic Opportunities",
    "Growth Opportunities",
    "Market Analysis",
    "Technology & Innovation",
    "Regional Business News"
  ]
  
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a)
    const bIndex = priorityOrder.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  const result = {}
  sortedCategories.forEach(category => {
    result[category] = grouped[category]
  })

  return result
}

function generatePersonalizedMockNews(industry, location, businessName = "", customGoal = "") {
  const currentYear = new Date().getFullYear()
  const businessDisplay = businessName || `${industry} businesses`
  
  const mockArticles = [
    {
      title: `${industry} Industry Shows Strong Growth in ${location} Market`,
      description: `Market analysis reveals significant opportunities for ${businessDisplay} in the ${location} area. Industry experts forecast continued expansion through ${currentYear + 1}.`,
      url: `https://businessnews.com/${industry.toLowerCase().replace(/\s+/g, '-')}-growth-${location.toLowerCase().replace(/\s+/g, '-')}`,
      source: "Business News Daily",
      sourceUrl: "https://businessnews.com",
      published: new Date(Date.now() - 86400000).toISOString(),
      image: null,
      relevanceScore: 92,
      category: "Local Market Trends",
      sentiment: "positive",
      keyInsights: ["Growth forecast", "Market expansion", "Industry opportunity"],
      personalizedTags: [industry, location, "Growth"],
      searchType: "local_industry_trends",
      personalizedFor: businessDisplay,
      isRssLink: false,
      rssLink: null,
      guid: null,
      serperData: { position: 1, source: "businessnews.com" }
    },
    {
      title: `Innovation Drives ${industry} Transformation in ${currentYear}`,
      description: `Technology adoption accelerates in the ${industry} sector, creating new opportunities for businesses to gain competitive advantages.`,
      url: "https://industrynews.com/innovation-transformation",
      source: "Industry Today",
      sourceUrl: "https://industrynews.com",
      published: new Date(Date.now() - 172800000).toISOString(),
      image: null,
      relevanceScore: 85,
      category: "Technology & Innovation",
      sentiment: "positive",
      keyInsights: ["Digital transformation", "Competitive advantage", "Tech adoption"],
      personalizedTags: [industry, "Innovation", "Technology"],
      searchType: "market_intelligence",
      personalizedFor: businessDisplay,
      isRssLink: false,
      rssLink: null,
      guid: null,
      serperData: { position: 2, source: "industrynews.com" }
    }
  ]

  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    mockArticles.unshift({
      title: `${industry} Leaders Excel Through Strategic ${goalKeywords[0] || 'Innovation'}`,
      description: `Success stories from ${businessDisplay} implementing strategies aligned with "${customGoal.substring(0, 50)}...". Results show measurable improvements.`,
      url: "https://strategybusiness.com/success-stories",
      source: "Strategy & Business",
      sourceUrl: "https://strategybusiness.com",
      published: new Date(Date.now() - 43200000).toISOString(),
      image: null,
      relevanceScore: 95,
      category: "Business Spotlight",
      sentiment: "positive",
      keyInsights: ["Strategic success", "Goal achievement", "Best practices"],
      personalizedTags: [industry, "Strategy", "Success"],
      searchType: "goal_aligned_news",
      personalizedFor: businessDisplay,
      isRssLink: false,
      rssLink: null,
      guid: null,
      serperData: { position: 1, source: "strategybusiness.com" }
    })
  }

  const categorized = groupPersonalizedNews(mockArticles, industry)

  return {
    articles: mockArticles,
    categorized: categorized,
    totalFound: mockArticles.length,
    lastUpdated: new Date().toISOString(),
    sources: mockArticles.map(a => a.source),
    sentimentAnalysis: { positive: mockArticles.length, neutral: 0, negative: 0 },
    personalizationSummary: {
      businessName: businessDisplay,
      industry,
      location,
      hasCustomGoal: !!customGoal,
      topCategories: Object.keys(categorized).slice(0, 3)
    },
    urlMetrics: {
      directUrls: mockArticles.length,
      rssUrls: 0,
      totalUrls: mockArticles.length
    },
    apiProvider: "Mock Data (Serper API unavailable)"
  }
}

// Keep existing helper functions
function getRecencyBonus(publishedDate) {
  if (!publishedDate) return 0
  
  const days = (Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 1) return 15
  if (days <= 7) return 10
  if (days <= 30) return 5
  return 0
}

function analyzeSentiment(text) {
  const textLower = text.toLowerCase()
  
  const sentimentWords = {
    positive: ["growth", "success", "opportunity", "increase", "profit", "expansion", "innovation", "breakthrough"],
    negative: ["decline", "loss", "challenge", "decrease", "crisis", "problem", "risk", "concern"]
  }

  const positiveCount = sentimentWords.positive.filter(word => textLower.includes(word)).length
  const negativeCount = sentimentWords.negative.filter(word => textLower.includes(word)).length

  if (positiveCount > negativeCount && positiveCount > 0) return "positive"
  if (negativeCount > positiveCount && negativeCount > 0) return "negative"
  return "neutral"
}

function analyzeSentimentDistribution(articles) {
  return articles.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
    return acc
  }, { positive: 0, neutral: 0, negative: 0 })
}

function extractDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}

// Reset daily usage counter
function resetDailyNewsUsage() {
  dailyNewsUsage = 0
  console.log("🔄 Daily news API usage counter reset")
}

module.exports = { 
  getNewsData,
  resetDailyNewsUsage 
}

// NEW: Generate enhanced personalized queries with networking focus
function generateEnhancedPersonalizedQueries(industry, location, businessName = "", customGoal = "", networkingKeyword = "") {
  const currentYear = new Date().getFullYear()
  const queries = []
  
  // Extract location components for better targeting
  const locationParts = location.split(',').map(part => part.trim())
  const city = locationParts[0] || location
  const state = locationParts[1] || ""
  
  // 1. HIGHEST PRIORITY: Business-specific + location + industry (if business name provided)
  if (businessName && businessName.length > 3) {
    queries.push({
      type: "business_hyper_specific",
      query: `"${businessName}" ${industry} ${city} news trends ${currentYear}`,
      maxItems: 15,
      dateFrom: getDateDaysAgo(60),
      weight: 1.0,
      priority: 1
    })
  }

  // 2. Custom Goal + Industry Alignment (if custom goal provided)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    queries.push({
      type: "goal_industry_alignment", 
      query: `${goalKeywords.slice(0, 2).join(' ')} ${industry} ${city} opportunities`,
      maxItems: 12,
      dateFrom: getDateDaysAgo(45),
      weight: 0.95,
      priority: 2
    })
  }

  // 3. Local Industry Intelligence
  queries.push({
    type: "local_industry_intelligence",
    query: `${industry} ${city} ${state} market analysis growth ${currentYear}`,
    maxItems: 12,
    dateFrom: getDateDaysAgo(30),
    weight: 0.9,
    priority: 3
  })

  // 4. Networking + Industry Focus (if networking keyword provided)
  if (networkingKeyword && networkingKeyword.length > 2) {
    queries.push({
      type: "networking_industry_focus",
      query: `${networkingKeyword} ${industry} ${city} networking events business`,
      maxItems: 8,
      dateFrom: getDateDaysAgo(30),
      weight: 0.85,
      priority: 4
    })
  }

  // 5. Industry Innovation & Trends
  queries.push({
    type: "industry_innovation_trends",
    query: `${industry} innovation trends technology ${currentYear} opportunities`,
    maxItems: 10,
    dateFrom: getDateDaysAgo(45),
    weight: 0.8,
    priority: 5
  })

  // Sort by priority and weight
  return queries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return b.weight - a.weight
  }).slice(0, 5) // Limit to top 5 most relevant queries
}

// NEW: Select top 5 articles with enhanced logic
function selectTop5Articles(allArticles, industry, businessName, customGoal) {
  if (allArticles.length <= 5) return allArticles

  // Remove duplicates based on title similarity
  const uniqueArticles = removeDuplicateArticles(allArticles)
  
  // Sort by multiple criteria for best selection
  const sortedArticles = uniqueArticles.sort((a, b) => {
    // Primary: Relevance score
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    
    // Secondary: Priority from query type
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    
    // Tertiary: Recency
    const aDate = new Date(a.published || a.date || Date.now())
    const bDate = new Date(b.published || b.date || Date.now())
    return bDate.getTime() - aDate.getTime()
  })

  // Ensure diversity in selection
  const selectedArticles = []
  const usedCategories = new Set()
  const usedSources = new Set()

  for (const article of sortedArticles) {
    if (selectedArticles.length >= 5) break
    
    // Always include top 2 by relevance score
    if (selectedArticles.length < 2) {
      selectedArticles.push(article)
      usedCategories.add(article.category)
      usedSources.add(article.source)
      continue
    }
    
    // For remaining slots, prefer diversity
    const categoryDiversity = !usedCategories.has(article.category)
    const sourceDiversity = !usedSources.has(article.source)
    
    // Include if high relevance OR brings diversity
    if (article.relevanceScore >= 60 || categoryDiversity || sourceDiversity) {
      selectedArticles.push(article)
      usedCategories.add(article.category)
      usedSources.add(article.source)
    }
  }

  // Fill remaining slots if needed
  while (selectedArticles.length < 5 && selectedArticles.length < sortedArticles.length) {
    const remaining = sortedArticles.filter(article => 
      !selectedArticles.some(selected => selected.url === article.url)
    )
    if (remaining.length > 0) {
      selectedArticles.push(remaining[0])
    } else {
      break
    }
  }

  return selectedArticles
}

function removeDuplicateArticles(articles) {
  const seen = new Set()
  return articles.filter(article => {
    const key = `${article.title.toLowerCase().substring(0, 50)}-${article.source}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// NEW: Enhanced personalization scoring function
function calculateEnhancedPersonalizationScore(article, industry, businessName, customGoal, networkingKeyword, location) {
  let score = 0
  const title = (article.title || "").toLowerCase()
  const description = (article.description || article.snippet || "").toLowerCase()
  const fullText = title + " " + description
  
  // PRIORITY 1: Direct business name mention (40 points)
  if (businessName && businessName.length > 2) {
    const businessLower = businessName.toLowerCase()
    if (title.includes(businessLower)) score += 40
    if (description.includes(businessLower)) score += 30
  }
  
  // PRIORITY 2: Industry relevance (30 points)
  const industryLower = industry.toLowerCase()
  if (title.includes(industryLower)) score += 30
  if (description.includes(industryLower)) score += 20
  
  // Enhanced industry keyword matching
  const industryKeywords = getEnhancedIndustryKeywords(industry)
  industryKeywords.forEach(keyword => {
    if (fullText.includes(keyword.toLowerCase())) score += 5
  })
  
  // PRIORITY 3: Location relevance (25 points)
  if (location && location.length > 2) {
    const locationTerms = location.toLowerCase().split(/[,\s]+/)
    locationTerms.forEach(term => {
      if (term.length > 2) {
        if (title.includes(term)) score += 15
        if (description.includes(term)) score += 10
      }
    })
  }
  
  // PRIORITY 4: Custom goal alignment (25 points)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractGoalKeywords(customGoal)
    let goalMatches = 0
    goalKeywords.forEach(keyword => {
      if (fullText.includes(keyword.toLowerCase())) {
        goalMatches += 8
      }
    })
    score += Math.min(goalMatches, 25)
  }
  
  // PRIORITY 5: Networking keyword relevance (20 points)
  if (networkingKeyword && networkingKeyword.length > 2) {
    const networkingTerms = networkingKeyword.toLowerCase().split(/[,\s]+/)
    networkingTerms.forEach(term => {
      if (term.length > 2 && fullText.includes(term)) score += 7
    })
  }
  
  // PRIORITY 6: Search context bonus (20 points)
  if (article.searchContext === 'business_hyper_specific') score += 20
  else if (article.searchContext === 'goal_industry_alignment') score += 18
  else if (article.searchContext === 'local_industry_intelligence') score += 15
  else if (article.searchContext === 'networking_industry_focus') score += 12
  else score += 8
  
  // PRIORITY 7: Recency bonus (15 points max)
  score += getRecencyBonus(article.published || article.date)
  
  // PRIORITY 8: Source credibility (10 points)
  if (article.source) {
    const premiumSources = ["reuters", "bloomberg", "wsj", "forbes", "techcrunch", "harvard business review", "mckinsey"]
    if (premiumSources.some(source => article.source.toLowerCase().includes(source))) {
      score += 10
    }
  }
  
  // PRIORITY 9: Google ranking position bonus (10 points max)
  if (article.position) {
    score += Math.max(0, 10 - article.position)
  }
  
  return Math.min(score, 100)
}
