import React from 'react';
import { LayoutGrid, Cloud, Settings, Info, Gamepad2, User, Sparkles, TrendingUp, Smartphone, Layers, Database, Shield, Hammer } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'library', icon: LayoutGrid, label: 'Library' },
    { id: 'scanner', icon: Sparkles, label: 'Scanner Inbox' },
    { id: 'activity', icon: TrendingUp, label: 'Activity' },
    { id: 'vaults', icon: Shield, label: 'Vault manager' },
    { id: 'playlists', icon: Layers, label: 'Playlist hub' },
    { id: 'forge', icon: Hammer, label: 'Core forge' },
    { id: 'storage', icon: Database, label: 'Storage tiering' },
    { id: 'sync', icon: Cloud, label: 'Sync engine' },
    { id: 'profile', icon: User, label: 'Profile & Devices' },
    { id: 'handheld', icon: Smartphone, label: 'Remote bridge' },
    { id: 'spatial', icon: Layers, label: 'Spatial VR' },
    { id: 'controller', icon: Gamepad2, label: 'Controller' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'info', icon: Info, label: 'System info' }
  ];

  return (
    <div className="w-16 md:w-64 h-full glass-panel flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-nexus-accent rounded-lg flex items-center justify-center">
          <Gamepad2 className="text-white w-6 h-6" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">NEXUS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${
              activeTab === item.id ? 'text-white' : 'text-nexus-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-nexus-accent/20 border-l-4 border-nexus-accent rounded-xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-nexus-accent' : ''}`} />
            <span className="hidden md:block relative z-10 font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-nexus-accent" />
          <div className="hidden md:block">
            <p className="text-xs font-bold">User_01</p>
            <p className="text-[10px] text-nexus-muted">Nexus Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};
