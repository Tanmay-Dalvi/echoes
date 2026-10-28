import React, { useState } from 'react';
import { X, Calendar, User, MapPin, Tag, Sparkles, Edit3, Trash2, Quote, CheckCircle, ShieldAlert } from 'lucide-react';
import { Memory, RemembranceCard } from '../types';
import { aiRemembranceCard, aiSummarize, updateMemory } from '../api';

interface MemoryDetailModalProps {
  memory: Memory | null;
  onClose: () => void;
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
  onMemoryUpdated: (updated: Memory) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  onClose,
  onEdit,
  onDelete,
  onMemoryUpdated,
}) => {
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!memory) return null;

  const displayDate = memory.date || memory.approximate_period || 'Undated recollection';

  const handleGenerateRemembranceCard = async (useFallback: boolean = false) => {
    setIsGeneratingCard(true);
    setGenerationError(null);
    setSuccessNote(null);
    try {
      const card = await aiRemembranceCard({
        memory_id: memory.id,
        use_demo_fallback: useFallback,
      });
      // Save card to memory
      const updated = await updateMemory(memory.id, { ai_remembrance_card: card });
      onMemoryUpdated(updated);
      setSuccessNote('Remembrance card generated and preserved to archive.');
    } catch (err: any) {
      setGenerationError(err.message || 'Generation failed');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleGenerateSummary = async (useFallback: boolean = false) => {
    setIsSummarizing(true);
    setGenerationError(null);
    setSuccessNote(null);
    try {
      const sumResult = await aiSummarize({
        memory_id: memory.id,
        use_demo_fallback: useFallback,
      });
      const updated = await updateMemory(memory.id, { ai_summary: sumResult.summary });
      onMemoryUpdated(updated);
      setSuccessNote('AI summary generated and preserved to archive.');
    } catch (err: any) {
      setGenerationError(err.message || 'Summary failed');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261C]/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FBF9F4] border border-[#DFD7C7] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5C554C] hover:text-[#1A382A] hover:bg-[#EDE5D5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#EDE5D5] text-[#1A382A] font-semibold border border-[#DFD7C7]">
            {memory.category}
          </span>
          <span className="flex items-center gap-1.5 text-[#5C554C] font-serif">
            <Calendar className="w-4 h-4 text-[#C5933A]" />
            <span>{displayDate}</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A382A] mb-4 leading-tight">
          {memory.title}
        </h2>

        {/* Success/Error Alerts */}
        {successNote && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successNote}</span>
          </div>
        )}

        {generationError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{generationError}</span>
            </div>
            <button
              onClick={() => handleGenerateRemembranceCard(true)}
              className="text-[11px] underline font-medium text-amber-900 self-start"
            >
              Try with Offline Deterministic Preview
            </button>
          </div>
        )}

        {/* Memory Story Content */}
        <div className="bg-[#F6F1E7] p-5 sm:p-6 rounded-xl border border-[#DFD7C7] mb-6 shadow-inner">
          <p className="text-base text-[#282520] leading-relaxed whitespace-pre-wrap font-serif">
            {memory.story}
          </p>
        </div>

        {/* Remembrance Card Callout if present */}
        {memory.ai_remembrance_card && (
          <div className="mb-6 p-5 rounded-xl bg-linear-to-br from-[#FBF9F4] to-[#F9EED4]/60 border-2 border-[#D8A64B]/60 shadow-sm relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C651E] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#C5933A]" />
                <span>AI Remembrance Card &bull; {memory.ai_remembrance_card.model}</span>
              </div>
              <span className="text-[11px] text-[#7A7368]">
                {new Date(memory.ai_remembrance_card.generated_at).toLocaleDateString()}
              </span>
            </div>

            <h4 className="font-serif text-lg font-semibold text-[#1A382A] mb-1.5">
              {memory.ai_remembrance_card.title}
            </h4>

            <p className="text-sm text-[#3E3A34] italic mb-3 leading-relaxed">
              "{memory.ai_remembrance_card.essence}"
            </p>

            {memory.ai_remembrance_card.key_elements?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {memory.ai_remembrance_card.key_elements.map((elem, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]"
                  >
                    {elem}
                  </span>
                ))}
              </div>
            )}

            {memory.ai_remembrance_card.quote_or_moment && (
              <div className="mt-3 pt-3 border-t border-[#D8A64B]/30 flex items-start gap-2 text-xs text-[#5C554C]">
                <Quote className="w-3.5 h-3.5 text-[#C5933A] shrink-0 mt-0.5" />
                <span>{memory.ai_remembrance_card.quote_or_moment}</span>
              </div>
            )}

            <div className="mt-3 text-[10px] text-[#7A7368] italic">
              AI-assisted keepsake grounded strictly in your story. Never claims to channel spirits or speak as the deceased.
            </div>
          </div>
        )}

        {/* AI Summary if present */}
        {memory.ai_summary && (
          <div className="mb-6 p-4 rounded-xl bg-[#F4EFE6] border border-[#DFD7C7] text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#1A382A] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>Grounded Summary (AI-assisted)</span>
            </div>
            <p className="text-[#3E3A34] leading-relaxed">{memory.ai_summary}</p>
          </div>
        )}

        {/* People & Places Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          <div>
            <h5 className="font-semibold text-[#5C554C] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>People Remembered</span>
            </h5>
            {memory.people.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {memory.people.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#7A7368] italic">No specific individuals listed</p>
            )}
          </div>

          <div>
            <h5 className="font-semibold text-[#5C554C] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>Places & Settings</span>
            </h5>
            {memory.places.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {memory.places.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#7A7368] italic">No locations specified</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="mb-6">
            <h5 className="font-semibold text-[#5C554C] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>Themes & Tags</span>
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#5C554C] border border-[#DFD7C7] text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Toolbar: AI actions and Edit/Delete */}
        <div className="pt-5 border-t border-[#DFD7C7] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateRemembranceCard(false)}
              disabled={isGeneratingCard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EDE5D5] text-[#1A382A] font-medium hover:bg-[#E3D9C4] transition-colors border border-[#DFD7C7]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>{isGeneratingCard ? 'Crafting Card...' : memory.ai_remembrance_card ? 'Regenerate Card' : 'Craft Remembrance Card'}</span>
            </button>

            {!memory.ai_summary && (
              <button
                onClick={() => handleGenerateSummary(false)}
                disabled={isSummarizing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F4EFE6] text-[#5C554C] font-medium hover:bg-[#EDE5D5] transition-colors border border-[#DFD7C7]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5C554C]" />
                <span>{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onEdit(memory)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F4EFE6] text-[#1A382A] font-medium hover:bg-[#EDE5D5] transition-colors border border-[#DFD7C7]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDelete(memory)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

