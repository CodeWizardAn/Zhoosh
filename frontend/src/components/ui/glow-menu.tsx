"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { Search, Mic } from "lucide-react"

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export interface MenuItem {
  id: string
  icon: React.ReactNode
  label: string
  gradient: string
  iconColor: string
  onClick?: () => void
  isActive?: boolean
  customRender?: React.ReactNode
}

interface GlowMenuProps {
  logo: React.ReactNode
  items: MenuItem[]
  searchComponent: React.ReactNode
  userComponent: React.ReactNode
  isDarkTheme?: boolean
}

export function GlowMenu({ logo, items, searchComponent, userComponent, isDarkTheme = true }: GlowMenuProps) {
  return (
    <motion.nav
      className="p-2 rounded-full bg-gradient-to-b from-[#0a0a0a]/80 to-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-visible flex items-center justify-between gap-4 sm:gap-8 mx-auto w-full max-w-7xl"
      initial="initial"
      whileHover="hover"
      animate="initial"
    >
      <motion.div
        className={`absolute -inset-2 bg-gradient-radial from-transparent ${
          isDarkTheme
            ? "via-blue-400/10 via-30% via-purple-400/10 via-60% via-red-400/10 via-90%"
            : "via-blue-400/10 via-30% via-purple-400/10 via-60% via-red-400/10 via-90%"
        } to-transparent rounded-full z-0 pointer-events-none`}
        variants={navGlowVariants}
      />
      
      {/* LEFT: Logo */}
      <div className="relative z-10 pl-2 shrink-0">
        {logo}
      </div>

      {/* CENTER: Navigation Items */}
      <ul className="hidden md:flex items-center gap-1 relative z-10 flex-1 justify-center">
        {items.map((item) => (
          <motion.li key={item.id} className="relative">
            {item.customRender ? (
              item.customRender
            ) : (
              <motion.div
                className="block rounded-full overflow-visible group relative"
                style={{ perspective: "600px" }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none rounded-full"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                    opacity: 0,
                  }}
                />
                <button
                  onClick={item.onClick}
                  className={`flex items-center gap-2 px-4 py-1.5 relative z-10 transition-colors rounded-full cursor-pointer border ${
                    item.isActive 
                      ? 'bg-white/[0.08] text-white border-white/10 shadow-sm' 
                      : 'bg-white/[0.03] text-gray-400 border-transparent hover:bg-white/[0.08] hover:text-white hover:border-white/10'
                  }`}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                >
                  <motion.span variants={itemVariants} transition={sharedTransition} className="absolute inset-0 flex items-center justify-center gap-2">
                    <span className={`transition-colors duration-300 ${item.isActive ? item.iconColor : 'group-hover:' + item.iconColor} ${item.isActive ? 'text-white' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.span>

                  <motion.span variants={backVariants} transition={sharedTransition} className="absolute inset-0 flex items-center justify-center gap-2" style={{ rotateX: 90, transformOrigin: "center top" }}>
                    <span className={`transition-colors duration-300 ${item.isActive ? item.iconColor : 'group-hover:' + item.iconColor} ${item.isActive ? 'text-white' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </motion.span>
                  
                  {/* Invisible placeholder for sizing */}
                  <span className="opacity-0 flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </span>
                </button>
              </motion.div>
            )}
          </motion.li>
        ))}
      </ul>

      {/* RIGHT: Search & User Account */}
      <div className="relative z-10 flex items-center gap-3 shrink-0 pr-1">
        {searchComponent}
        {userComponent}
      </div>
    </motion.nav>
  )
}
