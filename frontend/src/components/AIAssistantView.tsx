import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Quote,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Copy,
  Save,
  Trash2,
  Cpu,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Memory, AIStatus, RemembranceCard, TributeResult, SummaryResult, NarrativeResult } from '../types';
import { aiRemembranceCard, aiTribute, aiSummarize, aiTimelineNarrative, updateMemory } from '../api';

interface AIAssistantViewProps {
  memories: Memory[];
  aiStatus: AIStatus | null;
  onMemoryUpdated: (updated: Memory) => void;
  onRefreshAIStatus: () => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  memories,
  aiStatus,
  onMemoryUpdated,
  onRefreshAIStatus,
}) => {
  const [activeTool, setActiveTool] = useState<'card' | 'tribute' | 'summary' | 'narrative'>('card');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>(memories[0]?.id || '');
  const [selectedMemoryIdsForTribute, setSelectedMemoryIdsForTribute] = useState<string[]>([]);
  const [tributePerson, setTributePerson] = useState<string>('');
  const [useDemoFallback, setUseDemoFallback] = useState<boolean>(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Results
  const [generatedCard, setGeneratedCard] = useState<RemembranceCard | null>(null);
  const [generatedTribute, setGeneratedTribute] = useState<TributeResult | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<SummaryResult | null>(null);
  const [generatedNarrative, setGeneratedNarrative] = useState<NarrativeResult | null>(null);

  // Editable text before saving
  const [editableTributeText, setEditableTributeText] = useState<string>('');

  const selectedMemory = memories.find((m) => m.id === selectedMemoryId);

  const handleGenerateCard = async () => {
    if (!selectedMemory) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedCard(null);
    try {
      const card = await aiRemembranceCard({
        memory_id: selectedMemory.id,
        title: selectedMemory.title,
        story: selectedMemory.story,
        approximate_period: selectedMemory.approximate_period || selectedMemory.date || undefined,
        use_demo_fallback: useDemoFallback,
      });
      setGeneratedCard(card);
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Check Ollama status or try demo fallback.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCardToMemory = async () => {
    if (!selectedMemory || !generatedCard) return;
    try {
      const updated = await updateMemory(selectedMemory.id, {
        ai_remembrance_card: generatedCard,
      });
      onMemoryUpdated(updated);
      setSuccessMsg(`Remembrance card saved to "${selectedMemory.title}".`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save card to memory.');
    }
  };

  const handleGenerateTribute = async () => {
    const memsToUse = memories.filter((m) => selectedMemoryIdsForTribute.includes(m.id));
    if (memsToUse.length === 0 && selectedMemory) {
      memsToUse.push(selectedMemory);
    }
    if (memsToUse.length === 0) {
      setErrorMsg('Please select at least one memory to compose a tribute.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedTribute(null);
    try {
      const result = await aiTribute({
        titles: memsToUse.map((m) => m.title),
        stories: memsToUse.map((m) => m.story),
        focus_person: tributePerson.trim() || undefined,
        use_demo_fallback: useDemoFallback,
      });
      setGeneratedTribute(result);
      setEditableTributeText(result.tribute);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tribute generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTributeToMemory = async () => {
    if (!selectedMemory || !editableTributeText) return;
    try {
      const updated = await updateMemory(selectedMemory.id, {
        ai_tribute: editableTributeText,
      });
      onMemoryUpdated(updated);
      setSuccessMsg(`Tribute saved to "${selectedMemory.title}".`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save tribute.');
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedMemory) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedSummary(null);
    try {
      const result = await aiSummarize({
        memory_id: selectedMemory.id,
        use_demo_fallback: useDemoFallback,
      });
      setGeneratedSummary(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Summary generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummaryToMemory = async () => {
    if (!selectedMemory || !generatedSummary) return;
    try {
      const updated = await updateMemory(selectedMemory.id, {
        ai_summary: generatedSummary.summary,
      });
      onMemoryUpdated(updated);
      setSuccessMsg(`Summary saved to "${selectedMemory.title}".`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save summary.');
    }
  };

  const handleGenerateNarrative = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedNarrative(null);
    try {
      const result = await aiTimelineNarrative({
        memory_ids: memories.map((m) => m.id),
        use_demo_fallback: useDemoFallback,
      });
      setGeneratedNarrative(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Narrative generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Model Status */}
      <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5933A] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Local Open-Weight AI Assistant</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A382A]">
              Reflective Memory Studio
            </h2>
            <p className="text-sm text-[#5C554C] mt-1 max-w-2xl leading-relaxed">
              Powered entirely by an open-weight model (<span className="font-mono text-xs font-bold text-[#1A382A]">gemma3:1b</span>) running locally via Ollama. Echoes creates respectful tributes and structured keepsakes strictly grounded in the memories you preserve.
            </p>
          </div>

          {/* Model Status Card */}
          <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-4 sm:min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1A382A] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#C5933A]" />
                <span>Inference Engine</span>
              </span>
              <button
                onClick={onRefreshAIStatus}
                title="Refresh Ollama status"
                className="text-[#5C554C] hover:text-[#1A382A]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5C554C]">Provider:</span>
                <span className="font-medium text-[#1A382A]">Ollama (Local)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C554C]">Model:</span>
                <span className="font-mono font-semibold text-[#1A382A]">
                  {aiStatus?.configured_model || 'gemma3:1b'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C554C]">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    aiStatus?.connected && aiStatus?.model_available
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      aiStatus?.connected && aiStatus?.model_available
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  {aiStatus?.connected && aiStatus?.model_available
                    ? 'Connected & Ready'
                    : 'Service Offline'}
                </span>
              </div>
            </div>

            {/* Offline fallback toggle */}
            <div className="mt-3 pt-2.5 border-t border-[#DFD7C7] flex items-center justify-between text-[11px]">
              <span className="text-[#7A7368]">Deterministic Fallback:</span>
              <button
                type="button"
                onClick={() => setUseDemoFallback(!useDemoFallback)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  useDemoFallback
                    ? 'bg-[#D8A64B] text-[#1A382A]'
                    : 'bg-[#EDE5D5] text-[#5C554C]'
                }`}
              >
                {useDemoFallback ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Ethical Boundary Reminder */}
        <div className="mt-6 pt-4 border-t border-[#DFD7C7]/70 flex items-start gap-2 text-xs text-[#5C554C] bg-[#EDE5D5]/50 p-3 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#D8A64B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[#1A382A]">Ethical Commitment:</span> Echoes honors real human lives by refusing to simulate consciousness, impersonate departed voices, or claim supernatural communication. All outputs are clearly labeled as AI-assisted writing grounded in user-provided memories.
          </p>
        </div>
      </div>

      {/* Tool Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#DFD7C7] pb-3 text-sm">
        <button
          onClick={() => setActiveTool('card')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTool === 'card'
              ? 'bg-[#1A382A] text-[#EDE5D5] shadow-xs'
              : 'text-[#5C554C] hover:bg-[#F4EFE6] hover:text-[#1A382A]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D8A64B]" />
          <span>Remembrance Card Studio</span>
        </button>

        <button
          onClick={() => setActiveTool('tribute')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTool === 'tribute'
              ? 'bg-[#1A382A] text-[#EDE5D5] shadow-xs'
              : 'text-[#5C554C] hover:bg-[#F4EFE6] hover:text-[#1A382A]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#D8A64B]" />
          <span>Reflective Tribute Writer</span>
        </button>

        <button
          onClick={() => setActiveTool('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTool === 'summary'
              ? 'bg-[#1A382A] text-[#EDE5D5] shadow-xs'
              : 'text-[#5C554C] hover:bg-[#F4EFE6] hover:text-[#1A382A]'
          }`}
        >
          <Quote className="w-4 h-4 text-[#D8A64B]" />
          <span>Grounded Summarizer</span>
        </button>

        <button
          onClick={() => setActiveTool('narrative')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTool === 'narrative'
              ? 'bg-[#1A382A] text-[#EDE5D5] shadow-xs'
              : 'text-[#5C554C] hover:bg-[#F4EFE6] hover:text-[#1A382A]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#D8A64B]" />
          <span>Oral History Narrative</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => {
              setUseDemoFallback(true);
              setErrorMsg('Deterministic fallback enabled. Click generate again to preview.');
            }}
            className="text-[11px] underline font-medium text-amber-900 self-start"
          >
            Enable Offline Deterministic Mode and retry
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TOOL 1: Remembrance Card Studio */}
      {activeTool === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A382A]">
              Select Memory to Commemorate
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
                Choose a saved story
              </label>
              <select
                value={selectedMemoryId}
                onChange={(e) => setSelectedMemoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FBF9F4] border border-[#DFD7C7] text-sm text-[#282520] focus:outline-hidden focus:border-[#1A382A]"
              >
                {memories.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.date || m.approximate_period || 'Undated'})
                  </option>
                ))}
              </select>
            </div>

            {selectedMemory && (
              <div className="bg-[#FBF9F4] p-4 rounded-lg border border-[#DFD7C7] text-xs space-y-2">
                <span className="font-semibold text-[#1A382A]">Preview of selected story:</span>
                <p className="text-[#5C554C] line-clamp-4 italic leading-relaxed">
                  "{selectedMemory.story}"
                </p>
              </div>
            )}

            <button
              onClick={handleGenerateCard}
              disabled={isGenerating || !selectedMemory}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1A382A] text-[#EDE5D5] font-medium text-sm hover:bg-[#234A38] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#D8A64B]" />
              <span>{isGenerating ? 'Crafting Remembrance Card...' : 'Craft Remembrance Card (gemma3:1b)'}</span>
            </button>
          </div>

          {/* Result Card Preview */}
          <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 flex flex-col justify-between">
            {generatedCard ? (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-linear-to-br from-[#FBF9F4] to-[#F9EED4]/60 border-2 border-[#D8A64B]/60 shadow-md">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8C651E] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#C5933A]" />
                      <span>Remembrance Card &bull; {generatedCard.model}</span>
                    </span>
                    <span className="text-[10px] text-[#7A7368]">AI-Assisted</span>
                  </div>

                  <h4 className="font-serif text-2xl font-semibold text-[#1A382A] mb-2">
                    {generatedCard.title}
                  </h4>

                  <p className="text-sm text-[#3E3A34] italic mb-4 leading-relaxed font-serif">
                    "{generatedCard.essence}"
                  </p>

                  {generatedCard.key_elements?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {generatedCard.key_elements.map((el, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDE5D5] text-[#1A382A] border border-[#DFD7C7]"
                        >
                          {el}
                        </span>
                      ))}
                    </div>
                  )}

                  {generatedCard.quote_or_moment && (
                    <div className="mt-3 pt-3 border-t border-[#D8A64B]/30 flex items-start gap-2 text-xs text-[#5C554C]">
                      <Quote className="w-3.5 h-3.5 text-[#C5933A] shrink-0 mt-0.5" />
                      <span>{generatedCard.quote_or_moment}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setGeneratedCard(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5C554C] hover:bg-[#EDE5D5]"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveCardToMemory}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38] shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-[#D8A64B]" />
                    <span>Save to Memory</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#5C554C] my-auto">
                <Sparkles className="w-8 h-8 text-[#C5933A] mx-auto mb-2 opacity-60" />
                <h4 className="font-serif text-lg text-[#1A382A]">No Card Generated Yet</h4>
                <p className="text-xs text-[#7A7368] mt-1 max-w-sm mx-auto">
                  Select a memory on the left and click "Craft Remembrance Card" to create a respectful, poetic keepsake.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: Reflective Tribute Writer */}
      {activeTool === 'tribute' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A382A]">
              Compose a Commemorative Tribute
            </h3>
            <p className="text-xs text-[#5C554C]">
              Draft a thoughtful prose reflection celebrating an ancestor or loved one based solely on user-entered memories.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
                Person of Focus (Optional)
              </label>
              <input
                type="text"
                value={tributePerson}
                onChange={(e) => setTributePerson(e.target.value)}
                placeholder="e.g. Abuela Elena, Grandfather Arthur"
                className="w-full px-3 py-2 rounded-lg bg-[#FBF9F4] border border-[#DFD7C7] text-sm text-[#282520] focus:outline-hidden focus:border-[#1A382A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
                Select Memories to Ground the Tribute
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#FBF9F4] border border-[#DFD7C7] rounded-lg">
                {memories.map((m) => {
                  const isChecked = selectedMemoryIdsForTribute.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-[#EDE5D5] rounded text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMemoryIdsForTribute([...selectedMemoryIdsForTribute, m.id]);
                          } else {
                            setSelectedMemoryIdsForTribute(
                              selectedMemoryIdsForTribute.filter((id) => id !== m.id)
                            );
                          }
                        }}
                      />
                      <span className="font-medium text-[#1A382A] truncate">{m.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateTribute}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1A382A] text-[#EDE5D5] font-medium text-sm hover:bg-[#234A38] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Heart className="w-4 h-4 text-[#D8A64B]" />
              <span>{isGenerating ? 'Composing Tribute...' : 'Compose Tribute with Local AI'}</span>
            </button>
          </div>

          {/* Tribute Result */}
          <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 flex flex-col justify-between">
            {generatedTribute ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#8C651E] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#C5933A]" />
                    <span>AI-Assisted Tribute &bull; {generatedTribute.model}</span>
                  </span>
                  <span className="text-[10px] text-[#7A7368]">Editable</span>
                </div>

                <div className="text-xs text-[#7A7368] italic">
                  Review and refine the draft below before preserving:
                </div>

                <textarea
                  rows={8}
                  value={editableTributeText}
                  onChange={(e) => setEditableTributeText(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#F6F1E7] border border-[#DFD7C7] text-sm text-[#282520] font-serif leading-relaxed focus:outline-hidden focus:border-[#1A382A]"
                />

                <div className="text-[10px] text-[#7A7368]">
                  {generatedTribute.grounding_note}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <select
                    value={selectedMemoryId}
                    onChange={(e) => setSelectedMemoryId(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DFD7C7] text-xs text-[#282520]"
                  >
                    {memories.map((m) => (
                      <option key={m.id} value={m.id}>
                        Save to: {m.title}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGeneratedTribute(null)}
                      className="px-3 py-1.5 text-xs text-[#5C554C] hover:bg-[#EDE5D5] rounded-lg"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveTributeToMemory}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38] shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5 text-[#D8A64B]" />
                      <span>Save Tribute</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#5C554C] my-auto">
                <Heart className="w-8 h-8 text-[#C5933A] mx-auto mb-2 opacity-60" />
                <h4 className="font-serif text-lg text-[#1A382A]">No Tribute Drafted Yet</h4>
                <p className="text-xs text-[#7A7368] mt-1 max-w-sm mx-auto">
                  Select memories on the left to ground the tribute, specify who to honor, and let local open-weight AI draft a respectful commemorative reflection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: Grounded Summarizer */}
      {activeTool === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#1A382A]">
              Distill Memory into Concise Summary
            </h3>
            <p className="text-xs text-[#5C554C]">
              Extract a 2-3 sentence grounded summary capturing the core elements of a story.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#1A382A] uppercase tracking-wider mb-1">
                Choose Memory
              </label>
              <select
                value={selectedMemoryId}
                onChange={(e) => setSelectedMemoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FBF9F4] border border-[#DFD7C7] text-sm text-[#282520]"
              >
                {memories.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating || !selectedMemory}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1A382A] text-[#EDE5D5] font-medium text-sm hover:bg-[#234A38] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Quote className="w-4 h-4 text-[#D8A64B]" />
              <span>{isGenerating ? 'Summarizing...' : 'Summarize with Local AI'}</span>
            </button>
          </div>

          <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 flex flex-col justify-between">
            {generatedSummary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#8C651E] uppercase tracking-wider">
                  <span>Grounded Summary &bull; {generatedSummary.model}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F1E7] border border-[#DFD7C7] text-sm font-serif leading-relaxed text-[#282520]">
                  {generatedSummary.summary}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setGeneratedSummary(null)}
                    className="px-3 py-1.5 text-xs text-[#5C554C] hover:bg-[#EDE5D5] rounded-lg"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveSummaryToMemory}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A382A] text-[#EDE5D5] text-xs font-medium hover:bg-[#234A38] shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-[#D8A64B]" />
                    <span>Save to Memory</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-[#5C554C] my-auto">
                <Quote className="w-8 h-8 text-[#C5933A] mx-auto mb-2 opacity-60" />
                <h4 className="font-serif text-lg text-[#1A382A]">No Summary Generated</h4>
                <p className="text-xs text-[#7A7368] mt-1 max-w-sm mx-auto">
                  Select a memory on the left to extract a high-fidelity summary.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 4: Oral History Narrative */}
      {activeTool === 'narrative' && (
        <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1A382A]">
                Multi-Generational Oral History
              </h3>
              <p className="text-xs text-[#5C554C] mt-1">
                Weave all {memories.length} preserved memories into a cohesive chronological history.
              </p>
            </div>

            <button
              onClick={handleGenerateNarrative}
              disabled={isGenerating || memories.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A382A] text-[#EDE5D5] text-sm font-medium hover:bg-[#234A38] transition-all shadow-xs disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4 text-[#D8A64B]" />
              <span>{isGenerating ? 'Synthesizing...' : 'Synthesize Oral History (Local AI)'}</span>
            </button>
          </div>

          {generatedNarrative && (
            <div className="bg-[#FBF9F4] border-2 border-[#D8A64B]/60 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#8C651E] uppercase tracking-wider pb-3 border-b border-[#D8A64B]/30">
                <span>Oral History Synthesis &bull; {generatedNarrative.model}</span>
                <span className="text-[10px] text-[#7A7368]">AI-Assisted</span>
              </div>

              <div className="text-base text-[#282520] font-serif leading-relaxed whitespace-pre-wrap">
                {generatedNarrative.narrative}
              </div>

              {generatedNarrative.themes?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#DFD7C7]">
                  <span className="text-xs font-semibold text-[#5C554C]">Identified Threads:</span>
                  {generatedNarrative.themes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#EDE5D5] text-[#1A382A] text-xs border border-[#DFD7C7]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

