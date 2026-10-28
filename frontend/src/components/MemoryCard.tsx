import React from 'react';
import { Calendar, User, MapPin, Tag, Sparkles, Trash2, Edit3, Eye, Quote } from 'lucide-react';
import { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  onView: (memory: Memory) => void;
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
  onOpenAIModal?: (memory: Memory) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onView,
  onEdit,
  onDelete,
  onOpenAIModal,
}) => {
  const displayDate = memory.date || memory.approximate_period || 'Undated recollection';

  const categoryColors: Record<string, string> = {
    Family: 'bg-[#EDE5D5] text-[#1A382A] border-[#DFD7C7]',
    Tradition: 'bg-[#F9EED4] text-[#8C651E] border-[#E8DFC8]',
    'Oral History': 'bg-[#E3EBE6] text-[#1A382A] border-[#CFDCD4]',
    Milestone: 'bg-[#EAE4DC] text-[#4A3F35] border-[#D6CCC0]',
    Personal: 'bg-[#F4EFE6] text-[#5C554C] border-[#DFD7C7]',
    Tribute: 'bg-[#F9EED4] text-[#694B14] border-[#D8A64B]/40',
  };

  const pillClass = categoryColors[memory.category] || categoryColors.Personal;

  return (
    <article className="group bg-[#F6F1E7] border border-[#DFD7C7] hover:border-[#C5933A]/60 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative subtle corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-linear-to-bl from-[#EDE5D5] to-transparent pointer-events-none rounded-tr-xl opacity-60" />

      <div>
        {/* Header row: Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full border font-medium ${pillClass}`}>
              {memory.category}
            </span>
            {memory.is_fictional_demo && (
              <span className="px-2 py-0.5 rounded-full bg-[#EDE5D5] text-[#8C651E] border border-[#D8A64B]/40 font-medium text-[11px]">
                🎭 Demo Story
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[#5C554C] font-serif">
            <Calendar className="w-3.5 h-3.5 text-[#C5933A]" />
            <span>{displayDate}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(memory)}
          className="font-serif text-xl font-semibold text-[#1A382A] group-hover:text-[#234A38] cursor-pointer mb-2.5 line-clamp-2 leading-snug transition-colors"
        >
          {memory.title}
        </h3>

        {/* Story excerpt */}
        <p className="text-sm text-[#3E3A34] line-clamp-3 leading-relaxed mb-4">
          {memory.story}
        </p>

        {/* AI Remembrance Card Snippet if generated */}
        {memory.ai_remembrance_card && (
          <div className="mb-4 p-3 rounded-lg bg-[#FBF9F4] border border-[#D8A64B]/40 relative">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C651E] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D8A64B]" />
              <span>Remembrance Card: {memory.ai_remembrance_card.title}</span>
            </div>
            <p className="text-xs text-[#5C554C] italic leading-relaxed">
              "{memory.ai_remembrance_card.essence}"
            </p>
          </div>
        )}

        {/* Metadata Tags: People, Places, Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 text-xs">
          {memory.people.map((person, i) => (
            <span
              key={`person-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE5D5]/80 text-[#2C2825] border border-[#DFD7C7]"
            >
              <User className="w-3 h-3 text-[#5C554C]" />
              {person}
            </span>
          ))}

          {memory.places.map((place, i) => (
            <span
              key={`place-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE5D5]/80 text-[#2C2825] border border-[#DFD7C7]"
            >
              <MapPin className="w-3 h-3 text-[#5C554C]" />
              {place}
            </span>
          ))}

          {memory.tags.slice(0, 3).map((tag, i) => (
            <span
              key={`tag-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#5C554C] border border-[#E3DC CE]"
            >
              <Tag className="w-2.5 h-2.5 text-[#C5933A]" />
              {tag}
            </span>
          ))}
          {memory.tags.length > 3 && (
            <span className="text-[11px] text-[#7A7368] self-center">
              +{memory.tags.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-[#DFD7C7]/70 flex items-center justify-between text-xs">
        <button
          onClick={() => onView(memory)}
          className="flex items-center gap-1.5 text-[#1A382A] font-medium hover:text-[#234A38] hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Read Story</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenAIModal && (
            <button
              onClick={() => onOpenAIModal(memory)}
              title="AI Remembrance & Tribute"
              className="p-1.5 rounded-md text-[#8C651E] hover:bg-[#F9EED4] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#C5933A]" />
            </button>
          )}

          <button
            onClick={() => onEdit(memory)}
            title="Edit Memory"
            className="p-1.5 rounded-md text-[#5C554C] hover:text-[#1A382A] hover:bg-[#EDE5D5] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(memory)}
            title="Delete Memory (With confirmation)"
            className="p-1.5 rounded-md text-[#8A4A4A] hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

