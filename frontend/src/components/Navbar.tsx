import React from 'react';
import { BookOpen, Sparkles, Clock, ShieldCheck, Database, Plus, RefreshCw, Feather, Globe } from 'lucide-react';
import { HealthStatus, AIStatus } from '../types';

interface NavbarProps {
  currentTab: 'garden' | 'timeline' | 'ai' | 'backup';
  setCurrentTab: (tab: 'garden' | 'timeline' | 'ai' | 'backup') => void;
  onOpenCreateModal: () => void;
  health: HealthStatus | null;
  aiStatus: AIStatus | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
  health,
  aiStatus,
  onRefresh,
  isRefreshing,
}) => {
  const isAIOffline = !aiStatus?.connected || !aiStatus?.model_available;
  const isBrowserLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
  const isBackendLoopback = health?.privacy?.is_loopback ?? isBrowserLocal;
  const isTrulyLocal = isBrowserLocal && isBackendLoopback;

  return (
    <header className="border-b border-[#DFD7C7] bg-[#FBF9F4]/95 backdrop-blur-sm sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Privacy Assurance */}
      <div className="bg-[#1A382A] text-[#EDE5D5] text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
          {isTrulyLocal ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#D8A64B] shrink-0" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-[#D8A64B] shrink-0" />
          )}
          <span className="font-medium tracking-wide">
            {isTrulyLocal ? (
              <>Echoes Private Archive &bull; 100% Local &bull; Loopback Bound (127.0.0.1) &bull; Zero Cloud Telemetry</>
            ) : (
              <>Echoes Archive &bull; Hosted Preview Mode &bull; Zero Cloud Telemetry &bull; Run locally for on-device Ollama</>
            )}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAIOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-[11px] text-[#EDE5D5]/90">
                {isAIOffline ? 'AI Offline (Archive Active)' : 'Ollama (gemma3:1b) Active'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setCurrentTab('garden')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1A382A] text-[#EDE5D5] flex items-center justify-center shadow-xs group-hover:bg-[#234A38] transition-colors">
              <Feather className="w-5 h-5 text-[#D8A64B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#1A382A]">
                  Echoes
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]">
                  Memory Garden
                </span>
              </div>
              <p className="text-xs text-[#5C554C] italic">
                Some stories deserve to stay with us.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1A382A] text-[#FBF9F4] text-sm font-medium hover:bg-[#234A38] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D8A64B]" />
            <span>New</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCurrentTab('garden')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'garden'
                ? 'bg-[#1A382A] text-[#FBF9F4] shadow-xs'
                : 'text-[#5C554C] hover:text-[#1A382A] hover:bg-[#F4EFE6]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D8A64B]" />
            <span>Garden & Archive</span>
          </button>

          <button
            onClick={() => setCurrentTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'timeline'
                ? 'bg-[#1A382A] text-[#FBF9F4] shadow-xs'
                : 'text-[#5C554C] hover:text-[#1A382A] hover:bg-[#F4EFE6]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#D8A64B]" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setCurrentTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'ai'
                ? 'bg-[#1A382A] text-[#FBF9F4] shadow-xs'
                : 'text-[#5C554C] hover:text-[#1A382A] hover:bg-[#F4EFE6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D8A64B]" />
            <span>AI Reflections</span>
          </button>

          <button
            onClick={() => setCurrentTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'backup'
                ? 'bg-[#1A382A] text-[#FBF9F4] shadow-xs'
                : 'text-[#5C554C] hover:text-[#1A382A] hover:bg-[#F4EFE6]'
            }`}
          >
            <Database className="w-4 h-4 text-[#D8A64B]" />
            <span>Backup & Data</span>
          </button>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Refresh memory list"
            disabled={isRefreshing}
            className="p-2 rounded-lg text-[#5C554C] hover:text-[#1A382A] hover:bg-[#F4EFE6] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A382A] text-[#FBF9F4] text-sm font-medium hover:bg-[#234A38] transition-colors shadow-xs hover:shadow"
          >
            <Plus className="w-4 h-4 text-[#D8A64B]" />
            <span>Preserve Memory</span>
          </button>
        </div>
      </div>
    </header>
  );
};
