import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  BookOpen,
  Calendar,
  Users,
  Feather,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { Memory } from '../types';
import { MemoryCard } from './MemoryCard';

interface MemoryGardenViewProps {
  memories: Memory[];
  onViewMemory: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memory: Memory) => void;
  onOpenCreateModal: () => void;
  onOpenAIModal?: (memory: Memory) => void;
  onSeedDemo: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const CATEGORIES = ['All', 'Personal', 'Family', 'Oral History', 'Milestone', 'Tradition', 'Tribute'];

export const MemoryGardenView: React.FC<MemoryGardenViewProps> = ({
  memories,
  onViewMemory,
  onEditMemory,
  onDeleteMemory,
  onOpenCreateModal,
  onOpenAIModal,
  onSeedDemo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
}) => {
  // Compute archive statistics
  const totalMemories = memories.length;
  const totalRemembranceCards = memories.filter((m) => m.ai_remembrance_card).length;
  const uniquePeople = new Set(memories.flatMap((m) => m.people)).size;
  const datedMemoriesCount = memories.filter((m) => m.date).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Garden Hero / Introductory Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F6F1E7] border border-[#DFD7C7] p-6 sm:p-10 shadow-xs">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-linear-to-bl from-[#EDE5D5] to-transparent pointer-events-none opacity-50" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE5D5] text-[#1A382A] text-xs font-semibold mb-3 border border-[#DFD7C7]">
            <Feather className="w-3.5 h-3.5 text-[#C5933A]" />
            <span>A Sanctuary for What Matters</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A382A] tracking-tight leading-tight">
            Some stories deserve to stay with us.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#5C554C] leading-relaxed">
            Echoes is a private, local-first digital archive for your family stories, oral histories, and cherished moments. Powered by an on-device open-weight AI model (<span className="font-mono text-xs font-bold text-[#1A382A]">gemma3:1b</span>) that organizes and reflects without ever transmitting your words to the cloud.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A382A] text-[#EDE5D5] text-sm font-medium hover:bg-[#234A38] transition-all shadow-xs hover:shadow"
            >
              <Plus className="w-4 h-4 text-[#D8A64B]" />
              <span>Preserve a Memory</span>
            </button>

            {totalMemories === 0 && (
              <button
                onClick={onSeedDemo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDE5D5] text-[#1A382A] text-sm font-medium hover:bg-[#DFD7C7] transition-all border border-[#DFD7C7]"
              >
                <Sparkles className="w-4 h-4 text-[#C5933A]" />
                <span>Explore with Fictional Demo Stories</span>
              </button>
            )}
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="relative z-10 mt-8 pt-6 border-t border-[#DFD7C7]/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#FBF9F4]/80 rounded-xl border border-[#DFD7C7]/80">
            <span className="text-[#5C554C] block">Preserved Stories</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A382A]">
              {totalMemories}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F4]/80 rounded-xl border border-[#DFD7C7]/80">
            <span className="text-[#5C554C] block">People Remembered</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A382A]">
              {uniquePeople}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F4]/80 rounded-xl border border-[#DFD7C7]/80">
            <span className="text-[#5C554C] block">Dated Milestones</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A382A]">
              {datedMemoriesCount}
            </span>
          </div>
          <div className="p-3 bg-[#FBF9F4]/80 rounded-xl border border-[#DFD7C7]/80">
            <span className="text-[#5C554C] block">AI Keepsake Cards</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#8C651E]">
              {totalRemembranceCards}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative grow">
            <Search className="w-4 h-4 text-[#8A8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, people, places, or tags (e.g. 'Maine', 'baking', 'Elena')..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#FBF9F4] border border-[#DFD7C7] text-sm text-[#282520] placeholder-[#8A8275] focus:outline-hidden focus:border-[#1A382A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7368] hover:text-[#1A382A]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-[#5C554C] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#FBF9F4] border border-[#DFD7C7] text-xs text-[#282520] focus:outline-hidden focus:border-[#1A382A]"
            >
              <option value="recent">Recently Added</option>
              <option value="chronological">Chronological (Past to Present)</option>
              <option value="title">Alphabetical by Title</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DFD7C7]/60 text-xs">
          <span className="text-[#5C554C] font-medium mr-1">Categories:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A] font-medium shadow-xs'
                  : 'bg-[#FBF9F4] text-[#5C554C] border-[#DFD7C7] hover:border-[#1A382A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid or Empty State */}
      {memories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onView={onViewMemory}
              onEdit={onEditMemory}
              onDelete={onDeleteMemory}
              onOpenAIModal={onOpenAIModal}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#EDE5D5] text-[#1A382A] flex items-center justify-center mx-auto shadow-inner">
            <Feather className="w-7 h-7 text-[#C5933A]" />
          </div>

          <h3 className="font-serif text-2xl font-semibold text-[#1A382A]">
            {searchQuery ? 'No matching memories found' : 'Your Memory Garden is Quiet'}
          </h3>

          <p className="text-sm text-[#5C554C] leading-relaxed">
            {searchQuery
              ? `No memories matched "${searchQuery}". Try clearing search or selecting another category.`
              : 'Preserve the voices, recipes, traditions, and quiet moments that define your family. Every story saved remains solely on this machine.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-lg bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38]"
              >
                Reset Search
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D8A64B]" />
                  <span>Preserve First Memory</span>
                </button>

                <button
                  onClick={onSeedDemo}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EDE5D5] text-[#1A382A] text-xs font-medium hover:bg-[#DFD7C7] border border-[#DFD7C7]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5933A]" />
                  <span>Load Fictional Demo Stories</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

