import React, { useState, useEffect } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PremiumTabs — A high-fidelity, accessible tab component.
 * Combines Radix UI's accessible primitives with Framer Motion animations.
 */

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface PremiumTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  mobilePillMode?: boolean;
}

export const PremiumTabs: React.FC<PremiumTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  mobilePillMode = true,
}) => {
  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      <div className="relative mb-8">
        {/* Desktop & Mobile Tab List */}
        <TabsPrimitive.List
          className={cn(
            "flex items-center gap-1 p-1 border-b border-white/5",
            mobilePillMode ? "overflow-x-auto no-scrollbar scroll-smooth" : "flex-wrap"
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TabsPrimitive.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors outline-none",
                  "hover:text-white/80 focus-visible:ring-2 focus-visible:ring-cyan/50 rounded-md",
                  isActive ? "text-cyan" : "text-muted-foreground"
                )}
                aria-label={`Switch to ${tab.label}`}
              >
                {tab.icon && (
                  <span className={cn("transition-transform duration-300", isActive ? "scale-110" : "opacity-70")}>
                    {tab.icon}
                  </span>
                )}
                <span className="whitespace-nowrap">{tab.label}</span>

                {/* Animated active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-cyan shadow-[0_0_8px_rgba(0,212,224,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsPrimitive.Trigger>
            );
          })}
        </TabsPrimitive.List>
      </div>

      {/* Tab Panels with AnimatePresence for smooth content switching */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.99 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="focus-visible:outline-none"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsPrimitive.Root>
  );
};

export default PremiumTabs;
