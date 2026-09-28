import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Flower2, CalendarHeart, HeartHandshake } from 'lucide-react';

export type TabType = 'HOME' | 'GARDEN' | 'CARE' | 'COMMUNITY';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  overdueTasksCount: number;
  orphanPlantsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  overdueTasksCount,
  orphanPlantsCount,
}) => {
  const tabs = [
    {
      id: 'HOME' as TabType,
      label: 'Início',
      icon: LayoutDashboard,
      badgeCount: overdueTasksCount,
    },
    {
      id: 'GARDEN' as TabType,
      label: 'Jardim',
      icon: Flower2,
    },
    {
      id: 'CARE' as TabType,
      label: 'Agenda',
      icon: CalendarHeart,
    },
    {
      id: 'COMMUNITY' as TabType,
      label: 'Comunidade',
      icon: HeartHandshake,
      badgeCount: orphanPlantsCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md md:max-w-xl mx-auto pointer-events-auto">
        <div className="bg-[#2D3A2D]/95 backdrop-blur-xl border border-[#5A5A40]/70 rounded-3xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl relative transition-colors duration-200 z-10 ${
                  isActive ? 'text-[#D4AF37]' : 'text-[#F5F5F0]/65 hover:text-[#F5F5F0]'
                }`}
              >
                {/* Fluid Sliding Active Pill Background (Ball shrinking/stretching effect) */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#5A5A40]/40 rounded-2xl border border-[#D4AF37]/40 shadow-[0_4px_14px_rgba(0,0,0,0.3)] z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 28,
                      mass: 0.8,
                    }}
                  />
                )}

                {/* Icon Container with Animated Badge & Scale */}
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37] drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]' : 'text-[#F5F5F0]/80'}`} />
                  </motion.div>

                  {tab.badgeCount && tab.badgeCount > 0 ? (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#A68069] text-[#F5F5F0] text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#2D3A2D] shadow-sm">
                      {tab.badgeCount}
                    </span>
                  ) : null}
                </div>

                {/* Tab Name inside tab */}
                <span className={`text-[10px] sm:text-[11px] mt-1 tracking-tight leading-none z-10 ${
                  isActive ? 'text-[#D4AF37] font-bold' : 'text-[#F5F5F0]/70 font-medium'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};


