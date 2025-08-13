"use client"
import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import BriefDisplay from "@/components/brief-display"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"

interface BriefPageProps {
  params: Promise<{ id: string }>
}

export default function BriefPage({ params }: BriefPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(true)
  const [briefId, setBriefId] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  // Get the ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setBriefId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Fetch brief when briefId is available
  useEffect(() => {
    if (briefId && briefId !== 'null' && briefId !== 'undefined') {
      fetchBrief(briefId)
    } else if (briefId === 'null' || briefId === 'undefined') {
      console.error("Brief ID is null or undefined")
      setError("Invalid brief ID")
      setBriefLoading(false)
    }
  }, [briefId])

  const fetchBrief = async (id: string) => {
    try {
      setBriefLoading(true)
      setError("")
      console.log(`Fetching brief with ID: ${id}`)
      
      // Use frontend API route instead of direct backend call
      const response = await fetch(`/api/briefs/${id}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`Brief fetch response status: ${response.status}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Brief not found")
        } else if (response.status === 408) {
          setError("Request timeout - please try again")
        } else {
          setError(`Failed to fetch brief: ${response.status} ${response.statusText}`)
        }
        setBrief(null)
        return
      }

      const data = await response.json()
      console.log('Brief data received:', {
        success: data.success,
        hasContent: !!data.brief?.content,
        briefId: data.brief?.id
      })
      
      if (data.success && data.brief) {
        setBrief(data.brief)
        setError("")
      } else {
        setError("Brief data is invalid")
        setBrief(null)
      }
    } catch (error) {
      console.error("Error fetching brief:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      setBrief(null)
    } finally {
      setBriefLoading(false)
    }
  }

  const handleRetry = () => {
    if (briefId) {
      fetchBrief(briefId)
    }
  }

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Show loading while brief is loading
  if (briefLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your strategy brief...</p>
          <p className="text-gray-500 text-sm mt-2">Brief ID: {briefId}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || (!brief && briefId !== 'null')) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {error.includes("not found") ? "Brief Not Found" : "Error Loading Brief"}
          </h1>
          <p className="text-gray-400 mb-6">
            {error || "The requested brief could not be loaded."}
          </p>
          <p className="text-gray-500 text-sm mb-6">Brief ID: {briefId}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="border-gray-700 text-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show the brief if everything is loaded successfully
  if (brief) {
    return <BriefDisplay brief={brief} />
  }

  // Fallback
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-400 mb-4">Something went wrong</h1>
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
