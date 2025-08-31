"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Zap, 
  Target, 
  Network, 
  BarChart3,
  Sparkles,
  Shield,
  Headphones,
  Settings,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'custom'>('yearly')

  type Plan = {
    price: number | string
    originalPrice?: number
    period: string
    savings?: string
    popular?: boolean
    features: string[]
  }

  const plans: Record<'monthly' | 'yearly' | 'custom', Plan> = {
    monthly: { 
      price: 49, 
      originalPrice: 69, 
      period: 'month',
      features: ['AI Lead Generation', 'Business Networking', 'Market Intelligence', 'Basic Support']
    },
    yearly: { 
      price: 39, 
      originalPrice: 49, 
      period: 'month', 
      savings: 'Save 20%', 
      popular: true,
      features: ['Everything in Monthly', 'Advanced Analytics', 'Priority Support', 'API Access']
    },
    custom: { 
      price: 'Contact Us', 
      period: 'custom',
      features: ['SSO SAML Integration', 'Dedicated Support', 'Custom Integrations', 'Advanced Security', 'White-label Options']
    }
  }

  const handleUpgrade = (planType: 'monthly' | 'yearly' | 'custom') => {
    if (planType === 'custom') {
      // Open contact form or redirect to sales
      window.open('mailto:sales@sleft.ai?subject=Custom Plan Inquiry', '_blank')
    } else {
      // Integrate with payment system
      console.log(`Upgrading to ${planType} plan`)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white p-4 sm:p-6">
        <DialogHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <motion.div
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </motion.div>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Upgrade to Sleft Pro
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base sm:text-lg px-2 sm:px-0">
            Unlock advanced AI business intelligence and premium networking features
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Object.entries(plans).map(([planType, plan]) => (
            <motion.div
              key={planType}
              className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedPlan === planType
                  ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              onClick={() => setSelectedPlan(planType as 'monthly' | 'yearly' | 'custom')}
              whileHover={{ scale: 1.02 }}
            >
              {plan.popular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-2 capitalize">{planType} Plan</h3>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className="text-gray-400 text-sm sm:text-base">/{plan.period}</span>
                  )}
                  {plan.originalPrice && (
                    <span className="text-xs sm:text-sm text-gray-500 line-through ml-1 sm:ml-2">
                      ${plan.originalPrice}
                    </span>
                  )}
                </div>
                {plan.savings && (
                  <div className="text-green-400 font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
                    {plan.savings}
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-4 sm:mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleUpgrade(planType as 'monthly' | 'yearly' | 'custom')}
                className={`w-full text-xs sm:text-sm ${
                  selectedPlan === planType
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {planType === 'custom' ? (
                  <>
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Contact Sales
                  </>
                ) : selectedPlan === planType ? (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Choose {planType}
                  </>
                ) : (
                  `Select ${planType}`
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Key Features Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Target, title: 'AI Lead Gen', desc: 'Smart lead discovery' },
            { icon: Network, title: 'Networking', desc: '10K+ businesses' },
            { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights' },
            { icon: Shield, title: 'Security', desc: 'Enterprise-grade' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mb-2">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1">{feature.title}</h4>
              <p className="text-gray-400 text-xs sm:text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-xs sm:text-sm text-center">
            14-day free trial • Cancel anytime • 30-day money back
          </p>
          <button className="text-yellow-400 hover:text-yellow-300 text-xs sm:text-sm underline">
            Need help choosing?
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpgradeModal