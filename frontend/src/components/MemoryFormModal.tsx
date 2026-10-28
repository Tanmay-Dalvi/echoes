import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Calendar, Tag, User, MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import { Memory, MemoryCreate } from '../types';
import { aiExtractEntities } from '../api';

interface MemoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemoryCreate) => Promise<void>;
  initialData?: Memory | null;
  isSubmitting: boolean;
}

const CATEGORIES = ['Personal', 'Family', 'Oral History', 'Milestone', 'Tradition', 'Tribute'];

export const MemoryFormModal: React.FC<MemoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [date, setDate] = useState('');
  const [approximatePeriod, setApproximatePeriod] = useState('');
  const [category, setCategory] = useState('Personal');

  const [people, setPeople] = useState<string[]>([]);
  const [currentPerson, setCurrentPerson] = useState('');

  const [places, setPlaces] = useState<string[]>([]);
  const [currentPlace, setCurrentPlace] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setStory(initialData.story);
      setDate(initialData.date || '');
      setApproximatePeriod(initialData.approximate_period || '');
      setCategory(initialData.category || 'Personal');
      setPeople(initialData.people || []);
      setPlaces(initialData.places || []);
      setTags(initialData.tags || []);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setStory('');
    setDate('');
    setApproximatePeriod('');
    setCategory('Personal');
    setPeople([]);
    setPlaces([]);
    setTags([]);
    setCurrentPerson('');
    setCurrentPlace('');
    setCurrentTag('');
    setExtractError(null);
    setFormError(null);
  };

  if (!isOpen) return null;

  const handleAddPerson = () => {
    const trimmed = currentPerson.trim();
    if (trimmed && !people.includes(trimmed)) {
      setPeople([...people, trimmed]);
      setCurrentPerson('');
    }
  };

  const handleAddPlace = () => {
    const trimmed = currentPlace.trim();
    if (trimmed && !places.includes(trimmed)) {
      setPlaces([...places, trimmed]);
      setCurrentPlace('');
    }
  };

  const handleAddTag = () => {
    const trimmed = currentTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCurrentTag('');
    }
  };

  const handleExtractEntities = async (useFallback: boolean = false) => {
    if (!story.trim()) {
      setExtractError('Please enter a memory story first to extract entities.');
      return;
    }
    setIsExtracting(true);
    setExtractError(null);
    try {
      const extracted = await aiExtractEntities({
        title,
        story,
        use_demo_fallback: useFallback,
      });

      // Merge candidate people
      const newPeople = Array.from(new Set([...people, ...extracted.people]));
      setPeople(newPeople);

      // Merge candidate places
      const newPlaces = Array.from(new Set([...places, ...extracted.places]));
      setPlaces(newPlaces);

      // Merge candidate themes as tags
      const newTags = Array.from(new Set([...tags, ...extracted.themes.map((t) => t.toLowerCase())]));
      setTags(newTags);

      if (extracted.dates_or_periods.length > 0 && !approximatePeriod) {
        setApproximatePeriod(extracted.dates_or_periods[0]);
      }
    } catch (err: any) {
      setExtractError(err.message || 'Entity extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please provide a title for this memory.');
      return;
    }
    if (!story.trim()) {
      setFormError('Please write down the memory story.');
      return;
    }

    setFormError(null);
    await onSubmit({
      title: title.trim(),
      story: story.trim(),
      date: date.trim() || null,
      approximate_period: approximatePeriod.trim() || null,
      category,
      people,
      places,
      tags,
      ai_remembrance_card: initialData?.ai_remembrance_card || null,
      ai_tribute: initialData?.ai_tribute || null,
      ai_summary: initialData?.ai_summary || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261C]/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FBF9F4] border border-[#DFD7C7] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DFD7C7]">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A382A]">
              {initialData ? 'Edit Preserved Memory' : 'Preserve a Memory'}
            </h2>
            <p className="text-xs text-[#5C554C]">
              Stored locally on your device. Never uploaded to external servers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#5C554C] hover:text-[#1A382A] hover:bg-[#EDE5D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {extractError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{extractError}</span>
            </div>
            <button
              type="button"
              onClick={() => handleExtractEntities(true)}
              className="text-[11px] underline font-medium text-amber-900 self-start"
            >
              Try with Offline Fallback
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
              Title of Memory *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Abuela's Sunday Kitchen in East Los Angeles"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] placeholder-[#8A8275] focus:outline-hidden focus:border-[#1A382A] text-sm"
            />
          </div>

          {/* Date & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C5933A]" />
                <span>Exact Date (if known)</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] focus:outline-hidden focus:border-[#1A382A] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
                Approximate Era or Season
              </label>
              <input
                type="text"
                value={approximatePeriod}
                onChange={(e) => setApproximatePeriod(e.target.value)}
                placeholder="e.g. Summer 1975, Childhood, Late 1960s"
                className="w-full px-3.5 py-2 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] placeholder-[#8A8275] focus:outline-hidden focus:border-[#1A382A] text-xs"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    category === cat
                      ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A] shadow-xs'
                      : 'bg-[#F6F1E7] text-[#5C554C] border-[#DFD7C7] hover:border-[#1A382A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Story Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider">
                Story / Memory Narrative *
              </label>
              <button
                type="button"
                onClick={() => handleExtractEntities(false)}
                disabled={isExtracting || !story.trim()}
                className="flex items-center gap-1.5 text-xs text-[#8C651E] hover:text-[#694B14] font-medium disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5933A]" />
                <span>{isExtracting ? 'Extracting with AI...' : 'Auto-Extract People & Places (Local AI)'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell the story as you remember it—the voices, the light, the scents, the words spoken, and the moments that matter..."
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] placeholder-[#8A8275] focus:outline-hidden focus:border-[#1A382A] text-sm leading-relaxed"
            />
          </div>

          {/* People Remembered (Chips) */}
          <div>
            <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>People Mentioned</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentPerson}
                onChange={(e) => setCurrentPerson(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPerson();
                  }
                }}
                placeholder="Add person and press Enter"
                className="grow px-3 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] text-xs focus:outline-hidden focus:border-[#1A382A]"
              />
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-1.5 bg-[#EDE5D5] text-[#1A382A] rounded-lg text-xs font-medium hover:bg-[#DFD7C7]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {people.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#EDE5D5] text-[#1A382A] text-xs border border-[#DFD7C7]"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => setPeople(people.filter((_, i) => i !== idx))}
                    className="hover:text-red-700 font-bold ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Places (Chips) */}
          <div>
            <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>Places & Settings</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentPlace}
                onChange={(e) => setCurrentPlace(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPlace();
                  }
                }}
                placeholder="Add place and press Enter"
                className="grow px-3 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] text-xs focus:outline-hidden focus:border-[#1A382A]"
              />
              <button
                type="button"
                onClick={handleAddPlace}
                className="px-3 py-1.5 bg-[#EDE5D5] text-[#1A382A] rounded-lg text-xs font-medium hover:bg-[#DFD7C7]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {places.map((place, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#EDE5D5] text-[#1A382A] text-xs border border-[#DFD7C7]"
                >
                  {place}
                  <button
                    type="button"
                    onClick={() => setPlaces(places.filter((_, i) => i !== idx))}
                    className="hover:text-red-700 font-bold ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags (Chips) */}
          <div>
            <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#C5933A]" />
              <span>Tags & Themes</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="grow px-3 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-[#282520] text-xs focus:outline-hidden focus:border-[#1A382A]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-[#EDE5D5] text-[#1A382A] rounded-lg text-xs font-medium hover:bg-[#DFD7C7]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#5C554C] text-xs border border-[#DFD7C7]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                    className="hover:text-red-700 font-bold ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#DFD7C7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#F4EFE6] text-[#5C554C] text-sm font-medium hover:bg-[#EDE5D5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#1A382A] text-[#FBF9F4] text-sm font-medium hover:bg-[#234A38] transition-colors shadow-xs"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Preserve Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

