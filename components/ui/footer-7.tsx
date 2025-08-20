"use client"

import type React from "react"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface Footer7Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  sections?: Array<{
    title: string
    links: Array<{ name: string; href: string }>
  }>
  description?: string
  socialLinks?: Array<{
    icon: React.ReactElement
    href: string
    label: string
  }>
  copyright?: string
  legalLinks?: Array<{
    name: string
    href: string
  }>
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Strategy Briefs", href: "#" },
      { name: "AI Analysis", href: "#" },
      { name: "Business Intelligence", href: "#" },
      { name: "Pricing", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "#" },
      { name: "API Docs", href: "#" },
      { name: "Case Studies", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
]

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
]

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
]

export const Footer7 = ({
  sections = defaultSections,
  description = "AI-powered business strategy briefs that reveal your competitive edge, growth opportunities, and valuable connections.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2024 Sleft Signals. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="py-16 sm:py-20 lg:py-32 bg-black border-t border-yellow-500/20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo - Updated to match navbar styling */}
            <Link href="/" className="inline-flex">
              <motion.div
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg grid place-items-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
                  Sleft Signals
                </span>
              </motion.div>
            </Link>

            {/* Description - More responsive */}
            <p className="text-sm sm:text-base text-gray-400 max-w-[90%] sm:max-w-[70%]">
              {description}
            </p>

            {/* Social Links - Better spacing on mobile */}
            <ul className="flex items-center gap-4 sm:gap-6 text-gray-400">
              {socialLinks.map((social, idx) => (
                <motion.li 
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  className="font-medium hover:text-yellow-500 transition-colors"
                >
                  <a 
                    href={social.href} 
                    aria-label={social.label}
                    className="block p-2"
                  >
                    {social.icon}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Navigation Grid - Improved responsive layout */}
          <div className="grid w-full grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-20 mt-8 lg:mt-0">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="flex flex-col">
                <h3 className="text-sm sm:text-base font-bold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <motion.li 
                      key={linkIdx}
                      whileHover={{ x: 2 }}
                      className="font-medium"
                    >
                      <Link 
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-yellow-500 transition-colors inline-block"
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Better mobile layout */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-yellow-500/20">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-400">
              {copyright}
            </p>
            <ul className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {legalLinks.map((link, idx) => (
                <motion.li 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link 
                    href={link.href}
                    className="text-xs sm:text-sm text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
