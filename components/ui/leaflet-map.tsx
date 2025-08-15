"use client"

import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Building2, 
  Phone, 
  Mail, 
  ExternalLink, 
  MapPin, 
  Star,
  Clock,
  Target,
  Zap,
  ArrowRight,
  Users,
  X
} from 'lucide-react'
import Image from 'next/image'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createPortal } from 'react-dom'

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

// Custom marker component
const CustomMarker = ({ lead, index, onMarkerClick, onMarkerHover }: {
  lead: Lead
  index: number
  onMarkerClick: (lead: Lead) => void
  onMarkerHover: (lead: Lead | null) => void
}) => {
  const getStageColor = (score: number) => {
    if (score >= 80) return { color: '#10B981', stage: 'hot', label: 'Hot Lead' }
    if (score >= 60) return { color: '#F59E0B', stage: 'warm', label: 'Warm Lead' }
    if (score >= 40) return { color: '#EAB308', stage: 'engaged', label: 'Engaged' }
    return { color: '#3B82F6', stage: 'new', label: 'New Opportunity' }
  }

  const getUrgencyGlow = (score: number) => score >= 75

  const stageInfo = getStageColor(lead.leadScore)
  const hasUrgency = getUrgencyGlow(lead.leadScore)

  // Create custom icon
  const createCustomIcon = () => {
    return L.divIcon({
      html: `
        <div class="relative cursor-pointer" style="z-index: 1000;">
          ${hasUrgency ? `
            <div class="absolute inset-0 rounded-full border-2 opacity-60 animate-pulse" 
                 style="border-color: ${stageInfo.color}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;">
            </div>
          ` : ''}
          
          <div class="relative w-16 h-16">
            <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#374151" stroke-width="4"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke="${stageInfo.color}" 
                      stroke-width="4" stroke-linecap="round" 
                      stroke-dasharray="${(lead.leadScore / 100) * 175.929} 175.929"/>
            </svg>
            
            <div class="absolute inset-2 rounded-full bg-gray-800 border-2 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                 style="border-color: ${stageInfo.color}">
              ${lead.imageUrl ? 
                `<img src="${lead.imageUrl}" alt="${lead.businessName}" class="w-full h-full object-cover"/>` :
                `<div class="text-white font-bold text-sm">${lead.businessName.slice(0, 2).toUpperCase()}</div>`
              }
            </div>
            
            <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                 style="background-color: ${stageInfo.color}">
              ${lead.leadScore}
            </div>
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [64, 64],
      iconAnchor: [32, 32],
      popupAnchor: [0, -32]
    })
  }

  if (!lead.location) return null

  return (
    <Marker
      position={[lead.location.lat, lead.location.lng]}
      icon={createCustomIcon()}
      eventHandlers={{
        click: (e) => {
          console.log('Marker clicked:', lead.businessName)
          e.originalEvent.stopPropagation()
          onMarkerClick(lead)
        },
        mouseover: () => onMarkerHover(lead),
        mouseout: () => onMarkerHover(null)
      }}
    >
      <Popup>
        <div className="p-2">
          <h4 className="font-bold text-lg">{lead.businessName}</h4>
          <p className="text-sm text-gray-600">{lead.category}</p>
          <div className="mt-2">
            <span className="text-sm">Score: </span>
            <span className="font-bold" style={{ color: stageInfo.color }}>
              {lead.leadScore}%
            </span>
          </div>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => onMarkerClick(lead)}
          >
            View Details
          </Button>
        </div>
      </Popup>
    </Marker>
  )
}

// Side Panel Component (separate for better organization)
const SidePanel = ({ selectedLead, showSidePanel, onClose }: {
  selectedLead: Lead | null
  showSidePanel: boolean
  onClose: () => void
}) => {
  const getStageColor = (score: number) => {
    if (score >= 80) return { color: '#10B981', stage: 'hot', label: 'Hot Lead' }
    if (score >= 60) return { color: '#F59E0B', stage: 'warm', label: 'Warm Lead' }
    if (score >= 40) return { color: '#EAB308', stage: 'engaged', label: 'Engaged' }
    return { color: '#3B82F6', stage: 'new', label: 'New Opportunity' }
  }

  if (!showSidePanel || !selectedLead) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0" style={{ zIndex: 10000 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Side Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 overflow-y-auto shadow-2xl"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-900 z-10 pb-4 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white">Deal Journey</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Business Info */}
            <Card className="bg-gray-800/50 border-gray-700 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {selectedLead.imageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-600">
                      <Image
                        src={selectedLead.imageUrl}
                        alt={selectedLead.businessName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xl mb-2">{selectedLead.businessName}</h4>
                    <p className="text-gray-400 text-sm mb-2">{selectedLead.category}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-yellow-500 font-semibold">{selectedLead.rating}</span>
                      <span className="text-gray-400 text-sm">({selectedLead.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Opportunity Strength</span>
                    <span 
                      className="font-bold text-xl"
                      style={{ color: getStageColor(selectedLead.leadScore).color }}
                    >
                      {selectedLead.leadScore}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Stage</span>
                    <Badge 
                      className="text-sm px-3 py-1"
                      style={{ 
                        backgroundColor: `${getStageColor(selectedLead.leadScore).color}20`,
                        color: getStageColor(selectedLead.leadScore).color,
                        borderColor: getStageColor(selectedLead.leadScore).color
                      }}
                    >
                      {getStageColor(selectedLead.leadScore).label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Contact Person</span>
                    <span className="text-white font-medium">{selectedLead.contactPerson}</span>
                  </div>

                  {selectedLead.priceLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price Level</span>
                      <span className="text-green-400 font-medium">{selectedLead.priceLevel}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Location
              </h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300">{selectedLead.address}</p>
                {selectedLead.neighborhood && (
                  <p className="text-blue-400 text-sm mt-1">📍 {selectedLead.neighborhood}</p>
                )}
              </div>
            </div>

            {/* Trigger Event */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Why This Lead is Important
              </h4>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-300 leading-relaxed">{selectedLead.contactReason}</p>
              </div>
            </div>

            {/* Planned Steps */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Recommended Next Steps
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <input type="checkbox" className="rounded border-gray-600 w-4 h-4" />
                  <span className="text-gray-300">Send personalized introduction email</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <input type="checkbox" className="rounded border-gray-600 w-4 h-4" />
                  <span className="text-gray-300">Schedule discovery call</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <input type="checkbox" className="rounded border-gray-600 w-4 h-4" />
                  <span className="text-gray-300">Propose partnership opportunity</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 text-center">
                  <div className="text-green-400 font-bold text-lg">{selectedLead.leadScore}%</div>
                  <div className="text-gray-400 text-xs">Lead Score</div>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 text-center">
                  <div className="text-yellow-400 font-bold text-lg">{selectedLead.rating}</div>
                  <div className="text-gray-400 text-xs">Rating</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sticky bottom-0 bg-gray-900 pt-4 border-t border-gray-700">
              {selectedLead.phone && (
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  <a href={`tel:${selectedLead.phone}`}>
                    <Phone className="w-5 h-5 mr-2" />
                    Call {selectedLead.phone}
                  </a>
                </Button>
              )}
              {selectedLead.email && (
                <Button asChild variant="outline" className="w-full border-blue-600 text-blue-300 hover:text-white hover:bg-blue-600/20 py-3">
                  <a href={`mailto:${selectedLead.email}?subject=Partnership Opportunity&body=Hi ${selectedLead.contactPerson}, I'd like to discuss a potential partnership opportunity.`}>
                    <Mail className="w-5 h-5 mr-2" />
                    Email {selectedLead.contactPerson}
                  </a>
                </Button>
              )}
              {selectedLead.website && (
                <Button asChild variant="outline" className="w-full border-gray-600 text-gray-300 hover:text-white py-3">
                  <a href={selectedLead.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              {selectedLead.googleMapsUrl && (
                <Button asChild variant="outline" className="w-full border-purple-600 text-purple-300 hover:text-white py-3">
                  <a href={selectedLead.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-5 h-5 mr-2" />
                    View on Google Maps
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default function LeafletMap({ leads, businessName, centerLocation }: InteractiveMapProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const mapRef = useRef<any>(null)

  const leadsWithLocation = leads.filter(lead => lead.location)
  
  // Default center (Miami if no center provided)
  const defaultCenter: [number, number] = [
    centerLocation?.lat || 25.7617,
    centerLocation?.lng || -80.1918
  ]

  // Generate connection lines
  const connectionLines = leadsWithLocation.slice(0, -1).map((lead, index) => {
    const nextLead = leadsWithLocation[index + 1]
    if (lead.location && nextLead.location) {
      return [
        [lead.location.lat, lead.location.lng] as [number, number],
        [nextLead.location.lat, nextLead.location.lng] as [number, number]
      ]
    }
    return null
  }).filter(Boolean) as [number, number][][]

  const handleMarkerClick = (lead: Lead) => {
    console.log('Opening side panel for:', lead.businessName)
    setSelectedLead(lead)
    setShowSidePanel(true)
  }

  const handleMarkerHover = (lead: Lead | null) => {
    if (!showSidePanel) { // Only show hover if side panel is not open
      setHoveredLead(lead)
    }
  }

  const handleCloseSidePanel = () => {
    console.log('Closing side panel')
    setShowSidePanel(false)
    setSelectedLead(null)
    setHoveredLead(null)
  }

  // Get stage color helper
  const getStageColor = (score: number) => {
    if (score >= 80) return { color: '#10B981', stage: 'hot', label: 'Hot Lead' }
    if (score >= 60) return { color: '#F59E0B', stage: 'warm', label: 'Warm Lead' }
    if (score >= 40) return { color: '#EAB308', stage: 'engaged', label: 'Engaged' }
    return { color: '#3B82F6', stage: 'new', label: 'New Opportunity' }
  }

  const getUrgencyGlow = (score: number) => score >= 75

  return (
    <>
      {/* Add custom CSS */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
          z-index: 1000 !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95);
          color: white;
          border-radius: 12px;
          border: 1px solid #374151;
          z-index: 1002 !important;
        }
        .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid #374151;
        }
        .leaflet-control-zoom a {
          background: rgba(17, 24, 39, 0.9);
          color: white;
          border: 1px solid #374151;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(31, 41, 55, 0.9);
        }
        .leaflet-container {
          background: #111827;
          z-index: 1 !important;
        }
        .leaflet-popup {
          z-index: 1002 !important;
        }
        .leaflet-marker-pane {
          z-index: 1001 !important;
        }
      `}</style>

      <div className="relative w-full h-[800px] rounded-3xl overflow-hidden border border-gray-700 bg-gray-900">
        {/* Map Container */}
        <MapContainer
          center={defaultCenter}
          zoom={11}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          ref={mapRef}
          className="leaflet-container"
        >
          {/* Dark tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Connection lines */}
          {connectionLines.map((line, index) => (
            <Polyline
              key={index}
              positions={line}
              color="#6B7280"
              weight={2}
              opacity={0.6}
              dashArray="5, 5"
            />
          ))}

          {/* Business markers */}
          {leadsWithLocation.map((lead, index) => (
            <CustomMarker
              key={index}
              lead={lead}
              index={index}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={handleMarkerHover}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 backdrop-blur-sm" style={{ zIndex: 1000 }}>
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
        <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 backdrop-blur-sm" style={{ zIndex: 1000 }}>
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

        {/* Hover Card - Only show when side panel is closed */}
        <AnimatePresence>
          {hoveredLead && !showSidePanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 right-4"
              style={{ zIndex: 1003 }}
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

                    <Button
                      onClick={() => handleMarkerClick(hoveredLead)}
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
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel - Rendered using Portal */}
      <SidePanel 
        selectedLead={selectedLead}
        showSidePanel={showSidePanel}
        onClose={handleCloseSidePanel}
      />
    </>
  )
}