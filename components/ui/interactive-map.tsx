"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Map, { Marker, Popup, Source, Layer, ViewStateChangeInfo } from 'react-map-gl'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Phone, 
  Mail, 
  ExternalLink, 
  MapPin, 
  Star,
  TrendingUp,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Users,
  Calendar
} from 'lucide-react'
import Image from 'next/image'

interface Lead {
  businessName: string
  contactPerson: string
  email: string | null
  phone: string | null
  website: string | null
  address: string
  rating: number
  reviewsCount: number
  category: string
  leadScore: number
  leadType: string
  contactReason: string
  priceLevel?: string
  openingHours?: any[]
  neighborhood?: string
  imageUrl?: string
  location?: { lat: number; lng: number }
  googleMapsUrl?: string
}

interface InteractiveMapProps {
  leads: Lead[]
  businessName: string
  centerLocation?: { lat: number; lng: number }
}

// Mapbox token - add this to your environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function InteractiveMap({ leads, businessName, centerLocation }: InteractiveMapProps) {
  const [viewState, setViewState] = useState({
    longitude: centerLocation?.lng || -80.1918, // Default to Miami
    latitude: centerLocation?.lat || 25.7617,
    zoom: 11,
    bearing: 0,
    pitch: 0
  })
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const mapRef = useRef<any>(null)

  // Get stage color based on lead score
  const getStageColor = (score: number) => {
    if (score >= 80) return { color: '#10B981', stage: 'hot', label: 'Hot Lead' } // Green
    if (score >= 60) return { color: '#F59E0B', stage: 'warm', label: 'Warm Lead' } // Orange  
    if (score >= 40) return { color: '#EAB308', stage: 'engaged', label: 'Engaged' } // Yellow
    return { color: '#3B82F6', stage: 'new', label: 'New Opportunity' } // Blue
  }

  // Get urgency glow (simulate urgency based on lead score)
  const getUrgencyGlow = (score: number) => {
    return score >= 75 // High score = urgent
  }

  // Generate connection lines between leads
  const generateConnectionLines = () => {
    const connections: any[] = []
    
    leads.forEach((lead, index) => {
      // Connect to next lead (simulate relationships)
      const nextLead = leads[index + 1];
      if (index < leads.length - 1 && lead.location && nextLead?.location) {
        connections.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [lead.location.lng, lead.location.lat],
              [nextLead.location.lng, nextLead.location.lat]
            ]
          },
          properties: {
            sourceId: index,
            targetId: index + 1,
            relationship: 'shared_industry'
          }
        })
      }
    })

    return {
      type: "FeatureCollection" as const,
      features: connections
    }
  }

  const connectionData = generateConnectionLines()

  // Layer styles for connection lines
  const lineLayer = {
    id: 'connections',
    type: 'line' as const,
    paint: {
      'line-color': ['case',
        ['==', ['get', 'relationship'], 'active'], '#10B981',
        ['==', ['get', 'relationship'], 'planned'], '#3B82F6',
        '#6B7280'
      ],
      'line-width': 2,
      'line-opacity': 0.6,
      'line-dasharray': [2, 2]
    }
  }

  const handleNodeClick = (lead: Lead) => {
    setSelectedLead(lead)
    setShowSidePanel(true)
    
    // Center map on selected lead
    if (lead.location) {
      setViewState(prev => ({
        ...prev,
        longitude: lead.location!.lng,
        latitude: lead.location!.lat,
        zoom: 14,
        transitionDuration: 1000
      }))
    }
  }

  // Filter leads that have location data
  const leadsWithLocation = leads.filter(lead => lead.location)

  return (
    <div className="relative w-full h-[800px] rounded-3xl overflow-hidden border border-gray-700 bg-gray-900">
      {/* Map Container */}
      <Map
        ref={mapRef}
        {...viewState}
        onMoveEnd={(evt: ViewStateChangeInfo) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Dark theme
        projection={{ name: 'mercator' }}
      >
        {/* Connection Lines */}
        <Source id="connections" type="geojson" data={connectionData}>
          <Layer {...lineLayer} />
        </Source>

        {/* Business Nodes */}
        {leadsWithLocation.map((lead, index) => {
          const stageInfo = getStageColor(lead.leadScore)
          const hasUrgency = getUrgencyGlow(lead.leadScore)
          
          return (
            <Marker
              key={index}
              longitude={lead.location!.lng}
              latitude={lead.location!.lat}
            >
              <div onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(lead)
              }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative cursor-pointer"
                onMouseEnter={() => setHoveredLead(lead)}
                onMouseLeave={() => setHoveredLead(null)}
              >
                {/* Urgency Glow */}
                {hasUrgency && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 opacity-60"
                    style={{ borderColor: stageInfo.color }}
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 0.2, 0.6]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Progress Ring */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={stageInfo.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(lead.leadScore / 100) * 175.929} 175.929`}
                      initial={{ strokeDasharray: '0 175.929' }}
                      animate={{ strokeDasharray: `${(lead.leadScore / 100) * 175.929} 175.929` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </svg>

                  {/* Business Node */}
                  <div 
                    className="absolute inset-2 rounded-full bg-gray-800 border-2 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                    style={{ borderColor: stageInfo.color }}
                  >
                    {lead.imageUrl ? (
                      <Image
                        src={lead.imageUrl}
                        alt={lead.businessName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white font-bold text-sm">
                        {lead.businessName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Lead Score Badge */}
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: stageInfo.color }}
                  >
                    {lead.leadScore}
                  </div>
                </div>
              </motion.div>
              </div>
            </Marker>
          )
        })}

        {/* Hover Card */}
        <AnimatePresence>
          {hoveredLead && hoveredLead.location && (
            <Popup
              longitude={hoveredLead.location.lng}
              latitude={hoveredLead.location.lat}
              closeButton={false}
              closeOnClick={false}
              className="z-50"
              anchor="bottom"
            >
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="w-80 bg-gray-900/95 border-gray-700 backdrop-blur-sm shadow-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      {hoveredLead.imageUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={hoveredLead.imageUrl}
                            alt={hoveredLead.businessName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {hoveredLead.businessName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${getStageColor(hoveredLead.leadScore).color}20`,
                              color: getStageColor(hoveredLead.leadScore).color,
                              borderColor: getStageColor(hoveredLead.leadScore).color
                            }}
                          >
                            {getStageColor(hoveredLead.leadScore).label}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-yellow-500 text-sm font-semibold">
                              {hoveredLead.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Opportunity Strength</span>
                        <span 
                          className="font-bold text-lg"
                          style={{ color: getStageColor(hoveredLead.leadScore).color }}
                        >
                          {hoveredLead.leadScore}%
                        </span>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium text-sm">Recommended Action</span>
                        </div>
                        <p className="text-blue-400 text-sm font-semibold">
                          {hoveredLead.leadScore >= 75 ? "Call Today" : 
                           hoveredLead.leadScore >= 50 ? "Schedule Meeting" : 
                           "Send Introduction Email"}
                        </p>
                      </div>

                      <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium text-sm">Why Connected</span>
                        </div>
                        <p className="text-purple-400 text-sm">
                          {hoveredLead.contactReason}
                        </p>
                      </div>

                      {getUrgencyGlow(hoveredLead.leadScore) && (
                        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 font-medium text-sm">
                              High Priority - Act within 2 days
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleNodeClick(hoveredLead)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        size="sm"
                      >
                        View Full Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/90 border-gray-700 text-white hover:bg-gray-800"
          onClick={() => {
            setViewState(prev => ({ ...prev, zoom: prev.zoom + 1 }))
          }}
        >
          +
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/90 border-gray-700 text-white hover:bg-gray-800"
          onClick={() => {
            setViewState(prev => ({ ...prev, zoom: prev.zoom - 1 }))
          }}
        >
          -
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
        <h4 className="text-white font-semibold mb-3 text-sm">Opportunity Strength</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-300 text-xs">New (0-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-300 text-xs">Engaged (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-300 text-xs">Warm (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300 text-xs">Hot (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
        <h4 className="text-white font-semibold mb-3">{businessName} Network</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{leadsWithLocation.length}</div>
            <div className="text-gray-400 text-xs">Partners</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">
              {leadsWithLocation.filter(l => getUrgencyGlow(l.leadScore)).length}
            </div>
            <div className="text-gray-400 text-xs">Urgent</div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {showSidePanel && selectedLead && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowSidePanel(false)}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Deal Journey</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidePanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                {/* Business Info */}
                <Card className="bg-gray-800/50 border-gray-700 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedLead.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={selectedLead.imageUrl}
                            alt={selectedLead.businessName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-bold text-lg">{selectedLead.businessName}</h4>
                        <p className="text-gray-400 text-sm">{selectedLead.category}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Opportunity Strength</span>
                        <span 
                          className="font-bold"
                          style={{ color: getStageColor(selectedLead.leadScore).color }}
                        >
                          {selectedLead.leadScore}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Stage</span>
                        <Badge 
                          style={{ 
                            backgroundColor: `${getStageColor(selectedLead.leadScore).color}20`,
                            color: getStageColor(selectedLead.leadScore).color,
                            borderColor: getStageColor(selectedLead.leadScore).color
                          }}
                        >
                          {getStageColor(selectedLead.leadScore).label}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trigger Event */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Trigger Event
                  </h4>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-300 text-sm">{selectedLead.contactReason}</p>
                  </div>
                </div>

                {/* Planned Steps */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Planned Steps
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-600" />
                      <span className="text-gray-300 text-sm">Send introductory email</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-600" />
                      <span className="text-gray-300 text-sm">Schedule discovery call</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-600" />
                      <span className="text-gray-300 text-sm">Partner introduction</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedLead.phone && (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <a href={`tel:${selectedLead.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  )}
                  {selectedLead.email && (
                    <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                      <a href={`mailto:${selectedLead.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                  )}
                  {selectedLead.website && (
                    <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white">
                      <a href={selectedLead.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}