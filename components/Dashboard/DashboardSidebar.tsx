"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  Users,
  LucideIcon,
  Sparkles,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface DashboardSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Define interfaces for menu items
interface SubMenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  description: string;
  isPremium?: boolean;
  badge?: string;
  subItems?: SubMenuItem[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      description: 'Your command center'
    },
    {
      name: 'Intelligence Hub',
      icon: Sparkles,
      path: '/dashboard/network/hub',
      description: 'Community insights & reviews',
      badge: 'New'
    },
    {
      name: 'Partner Network',
      icon: Users,
      path: '/dashboard/network',
      description: 'Two-way referral matches',
      badge: 'Pro'
    },
    {
      name: 'My Snapshots',
      icon: Target,
      path: '/dashboard/snapshot',
      description: 'Your referral opportunities'
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleSubmenuToggle = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  const isActiveRoute = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'w-[280px] md:w-64' : 'w-0 md:w-16'}
        fixed
        transition-all duration-300
        flex flex-col h-screen
        top-0 left-0 z-[60]
        bg-white border-r border-gray-200
        overflow-hidden
      `}>
        {/* Header with Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={handleLinkClick}>
            <div className="relative">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <Stethoscope className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-gray-900 font-bold text-lg tracking-tight">Sleft Health</span>
                <span className="text-gray-500 text-xs">Referral Intelligence</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 md:block hidden"
          >
            {isOpen ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 md:hidden"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              const hasSubmenu = item.subItems && item.subItems.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;

              return (
                <div key={item.name}>
                  <Collapsible open={isSubmenuOpen} onOpenChange={() => hasSubmenu && handleSubmenuToggle(item.name)}>
                    <div className="relative group">
                      <Link href={item.path} onClick={handleLinkClick}>
                        <motion.div
                          className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 border border-blue-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          whileHover={{ x: 1 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            {isOpen && (
                              <span className="font-medium text-sm">{item.name}</span>
                            )}
                          </div>
                          {isOpen && item.badge && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      </Link>

                      {/* Tooltip for collapsed state */}
                      {!isOpen && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </Collapsible>
                </div>
              );
            })}

          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <motion.button
            onClick={handleSignOut}
            className="w-full group"
            whileHover={{ x: 1 }}
          >
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
              <div className="p-1.5 rounded-md bg-gray-100 group-hover:bg-red-100">
                <LogOut className="w-4 h-4" />
              </div>
              {isOpen && <span className="font-medium text-sm">Sign Out</span>}
            </div>
          </motion.button>

          {/* User Info */}
          {user && isOpen && (
            <motion.div
              className="mt-3 p-3 bg-gray-50 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium text-sm truncate">
                    {user?.user_metadata?.full_name || 'Healthcare Provider'}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;