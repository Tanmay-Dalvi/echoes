import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, User, MapPin, ChevronRight, BookOpen, Quote, ShieldAlert } from 'lucide-react';
import { Memory, NarrativeResult } from '../types';
import { aiTimelineNarrative } from '../api';

interface TimelineViewProps {
  memories: Memory[];
  onViewMemory: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memory: Memory) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  memories,
  onViewMemory,
  onEditMemory,
  onDeleteMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrativeResult, setNarrativeResult] = useState<NarrativeResult | null>(null);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  // Filter memories
  const filtered = memories.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  // Separate dated and undated
  const dated = filtered
    .filter((m) => m.date)
    .sort((a, b) => (a.date! > b.date! ? 1 : -1));

  const undated = filtered.filter((m) => !m.date);

  // Extract categories present
  const categories = ['all', ...Array.from(new Set(memories.map((m) => m.category)))];

  const handleSynthesizeNarrative = async (useFallback: boolean = false) => {
    setIsGeneratingNarrative(true);
    setNarrativeError(null);
    try {
      const res = await aiTimelineNarrative({
        memory_ids: filtered.map((m) => m.id),
        use_demo_fallback: useFallback,
      });
      setNarrativeResult(res);
    } catch (err: any) {
      setNarrativeError(err.message || 'Failed to synthesize timeline narrative');
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Controls */}
      <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5933A] mb-1">
              <Clock className="w-4 h-4" />
              <span>Chronological Archive</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A382A]">
              The Stream of Time
            </h2>
            <p className="text-sm text-[#5C554C] mt-1 max-w-xl">
              Following memories across the years. Undated recollections are lovingly preserved in their own space without fabricated timestamps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleSynthesizeNarrative(false)}
              disabled={isGeneratingNarrative || filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38] transition-all shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#D8A64B]" />
              <span>
                {isGeneratingNarrative ? 'Synthesizing Narrative...' : 'Synthesize Oral History (Local AI)'}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#DFD7C7]/70 text-xs">
          <span className="text-[#5C554C] font-medium mr-1">Filter Era / Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A] font-medium'
                  : 'bg-[#FBF9F4] text-[#5C554C] border-[#DFD7C7] hover:border-[#1A382A]'
              }`}
            >
              {cat === 'all' ? 'All Memories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Oral History Narrative Result Callout */}
      {narrativeError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{narrativeError}</span>
          </div>
          <button
            onClick={() => handleSynthesizeNarrative(true)}
            className="text-[11px] underline font-medium text-amber-900 self-start"
          >
            Try with Deterministic Preview
          </button>
        </div>
      )}

      {narrativeResult && (
        <div className="bg-[#FBF9F4] border-2 border-[#D8A64B]/60 rounded-2xl p-6 sm:p-8 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8A64B]/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5933A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C651E]">
                Family Oral History Synthesis &bull; {narrativeResult.model}
              </span>
            </div>
            <button
              onClick={() => setNarrativeResult(null)}
              className="text-xs text-[#7A7368] hover:text-[#1A382A]"
            >
              Dismiss
            </button>
          </div>

          <p className="text-sm sm:text-base text-[#282520] leading-relaxed whitespace-pre-wrap font-serif mb-4">
            {narrativeResult.narrative}
          </p>

          {narrativeResult.themes?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs pt-3 border-t border-[#DFD7C7]/60">
              <span className="text-[#5C554C] font-semibold">Enduring Themes:</span>
              {narrativeResult.themes.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-md bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 text-[10px] text-[#7A7368] italic">
            Grounding guarantee: Synthesized entirely from your locally saved memories without external cloud transmission.
          </div>
        </div>
      )}

      {/* Main Timeline Spine */}
      {dated.length > 0 ? (
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5CCBC]">
          {dated.map((mem) => {
            const year = mem.date ? new Date(mem.date).getFullYear() : 'Historic';
            return (
              <div key={mem.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full bg-[#FBF9F4] border-3 border-[#1A382A] group-hover:border-[#C5933A] flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#C5933A]" />
                </div>

                {/* Card Container */}
                <div className="bg-[#F6F1E7] border border-[#DFD7C7] hover:border-[#C5933A]/60 rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-[#1A382A] text-sm bg-[#EDE5D5] px-2.5 py-0.5 rounded-md border border-[#DFD7C7]">
                        {mem.date}
                      </span>
                      {mem.approximate_period && (
                        <span className="text-[#5C554C] italic">({mem.approximate_period})</span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FBF9F4] text-[#1A382A] border border-[#DFD7C7] font-medium">
                      {mem.category}
                    </span>
                  </div>

                  <h3
                    onClick={() => onViewMemory(mem)}
                    className="font-serif text-xl font-semibold text-[#1A382A] hover:text-[#234A38] cursor-pointer mb-2"
                  >
                    {mem.title}
                  </h3>

                  <p className="text-sm text-[#3E3A34] line-clamp-3 leading-relaxed mb-4">
                    {mem.story}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DFD7C7]/70 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {mem.people.map((p, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE5D5] text-[#2C2825]"
                        >
                          <User className="w-3 h-3 text-[#5C554C]" />
                          {p}
                        </span>
                      ))}
                      {mem.places.map((pl, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE5D5] text-[#2C2825]"
                        >
                          <MapPin className="w-3 h-3 text-[#5C554C]" />
                          {pl}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onViewMemory(mem)}
                      className="flex items-center gap-1 text-[#1A382A] font-semibold hover:underline ml-auto"
                    >
                      <span>Read Story</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl text-[#5C554C]">
          <Clock className="w-8 h-8 text-[#C5933A] mx-auto mb-2 opacity-70" />
          <p className="font-serif text-lg text-[#1A382A]">No dated memories found for this filter.</p>
          <p className="text-xs text-[#7A7368] mt-1">Add dates when creating or editing memories to build your chronological stream.</p>
        </div>
      )}

      {/* Undated / Approximate Era Section */}
      {undated.length > 0 && (
        <div className="pt-8 border-t border-[#DFD7C7]">
          <div className="mb-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A382A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C5933A]" />
              <span>Undated & Seasonal Recollections</span>
            </h3>
            <p className="text-xs text-[#5C554C]">
              Preserved with their approximate eras, never forced into fabricated calendar dates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {undated.map((mem) => (
              <div
                key={mem.id}
                className="bg-[#F6F1E7] border border-[#DFD7C7] hover:border-[#C5933A]/60 rounded-xl p-5 shadow-xs transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-serif italic text-[#8C651E]">
                    {mem.approximate_period || 'Timeless'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]">
                    {mem.category}
                  </span>
                </div>

                <h4
                  onClick={() => onViewMemory(mem)}
                  className="font-serif text-lg font-semibold text-[#1A382A] hover:text-[#234A38] cursor-pointer mb-2"
                >
                  {mem.title}
                </h4>

                <p className="text-xs text-[#3E3A34] line-clamp-3 leading-relaxed mb-3">
                  {mem.story}
                </p>

                <button
                  onClick={() => onViewMemory(mem)}
                  className="text-xs text-[#1A382A] font-semibold hover:underline"
                >
                  Read &bull;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

