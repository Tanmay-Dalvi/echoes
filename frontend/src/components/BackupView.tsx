import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  FileText,
  CheckCircle,
  HardDrive,
  Info,
  Layers,
  Globe,
} from 'lucide-react';
import { Memory, HealthStatus, ImportResult } from '../types';
import { exportArchive, importArchive, seedDemoData, clearAllMemories, clearDemoStories } from '../api';

interface BackupViewProps {
  memories: Memory[];
  health: HealthStatus | null;
  onRefreshData: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  memories,
  health,
  onRefreshData,
}) => {
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite' | 'keep_both'>('skip');
  const [excludeDemoFromExport, setExcludeDemoFromExport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingDemo, setIsClearingDemo] = useState(false);

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoMemoriesCount = memories.filter((m) => m.is_fictional_demo).length;
  const personalMemoriesCount = memories.length - demoMemoriesCount;

  const isBrowserLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const data = await exportArchive(excludeDemoFromExport);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `echoes-archive-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage(`Archive successfully exported (${data.count} memories${excludeDemoFromExport ? ', excluding demo data' : ''}).`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);
    setErrorMessage(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.memories || !Array.isArray(parsed.memories)) {
          throw new Error('Invalid archive format: missing "memories" array.');
        }

        const res = await importArchive(parsed, conflictStrategy);
        setImportResult(res);
        onRefreshData();
        setMessage(`Import complete: ${res.imported} imported, ${res.updated} updated, ${res.skipped} skipped.`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Import failed. Check file format.');
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSeedDemo = async (resetExisting: boolean) => {
    if (resetExisting && !confirm('This will replace all current memories with the fictional demo garden. Continue?')) {
      return;
    }
    setIsSeeding(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const res = await seedDemoData(resetExisting);
      onRefreshData();
      setMessage(`Fictional demo memories loaded (${res.seeded_count} stories preserved).`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to seed demo data.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDemoOnly = async () => {
    if (!confirm('This will remove only the fictional demo stories. Any memories you created will remain untouched. Continue?')) {
      return;
    }
    setIsClearingDemo(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const res = await clearDemoStories();
      onRefreshData();
      setMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove demo stories.');
    } finally {
      setIsClearingDemo(false);
    }
  };

  const handleClearArchive = async () => {
    if (!confirm('Are you certain you wish to clear all memories from this local archive? This cannot be undone unless you have an exported backup.')) {
      return;
    }
    setIsClearing(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      await clearAllMemories();
      onRefreshData();
      setMessage('All memories cleared from local archive.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to clear archive.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#F6F1E7] border border-[#DFD7C7] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5933A] mb-1">
          <Database className="w-4 h-4" />
          <span>Local Data Ownership & Sovereignty</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1A382A]">
          Backup, Export & Restore
        </h2>
        <p className="text-sm text-[#5C554C] mt-1 max-w-2xl leading-relaxed">
          In Echoes, your memories belong completely to you. All stories, dates, and AI-assisted reflections can be exported into portable, human-readable JSON files and restored at any time.
        </p>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#EDE5D5] flex items-center justify-center text-[#1A382A] mb-4">
              <Download className="w-5 h-5 text-[#C5933A]" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1A382A] mb-2">
              Export Archive (JSON)
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed mb-4">
              Save your entire memory garden to a portable <span className="font-mono text-xs">.json</span> file. Includes all stories, dates, metadata, and local AI reflections.
            </p>
            <div className="p-3 bg-[#F6F1E7] rounded-lg text-xs text-[#3E3A34] mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span>Personal Memories:</span>
                <span className="font-semibold text-[#1A382A]">{personalMemoriesCount}</span>
              </div>
              <div className="flex items-center justify-between text-[#7A7368]">
                <span>Fictional Demo Stories:</span>
                <span>{demoMemoriesCount}</span>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#5C554C] cursor-pointer mb-6 select-none">
              <input
                type="checkbox"
                checked={excludeDemoFromExport}
                onChange={(e) => setExcludeDemoFromExport(e.target.checked)}
                className="rounded text-[#1A382A]"
              />
              <span>Exclude fictional demo stories from exported file</span>
            </label>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting || memories.length === 0}
            className="w-full py-2.5 px-4 rounded-lg bg-[#1A382A] text-[#EDE5D5] font-medium text-sm hover:bg-[#234A38] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#D8A64B]" />
            <span>{isExporting ? 'Exporting...' : 'Download JSON Archive'}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#EDE5D5] flex items-center justify-center text-[#1A382A] mb-4">
              <Upload className="w-5 h-5 text-[#C5933A]" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#1A382A] mb-2">
              Restore / Import Archive
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed mb-4">
              Restore memories from a previously exported Echoes backup file with atomic transaction protection and conflict resolution.
            </p>

            {/* Conflict Strategy Selector */}
            <div className="space-y-1.5 mb-6 text-xs">
              <label className="block font-semibold text-[#1A382A]">
                Conflict Handling Strategy:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setConflictStrategy('skip')}
                  className={`py-1 px-2 rounded-lg border text-center transition-all ${
                    conflictStrategy === 'skip'
                      ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A]'
                      : 'bg-[#F6F1E7] text-[#5C554C] border-[#DFD7C7]'
                  }`}
                >
                  Skip Duplicates
                </button>
                <button
                  type="button"
                  onClick={() => setConflictStrategy('overwrite')}
                  className={`py-1 px-2 rounded-lg border text-center transition-all ${
                    conflictStrategy === 'overwrite'
                      ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A]'
                      : 'bg-[#F6F1E7] text-[#5C554C] border-[#DFD7C7]'
                  }`}
                >
                  Overwrite
                </button>
                <button
                  type="button"
                  onClick={() => setConflictStrategy('keep_both')}
                  className={`py-1 px-2 rounded-lg border text-center transition-all ${
                    conflictStrategy === 'keep_both'
                      ? 'bg-[#1A382A] text-[#EDE5D5] border-[#1A382A]'
                      : 'bg-[#F6F1E7] text-[#5C554C] border-[#DFD7C7]'
                  }`}
                >
                  Keep Both
                </button>
              </div>
            </div>
          </div>

          <label className="w-full py-2.5 px-4 rounded-lg bg-[#EDE5D5] text-[#1A382A] font-medium text-sm hover:bg-[#DFD7C7] transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#DFD7C7]">
            <Upload className="w-4 h-4 text-[#C5933A]" />
            <span>{isImporting ? 'Validating & Importing...' : 'Select JSON File to Restore'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Report Table if result present */}
      {importResult && (
        <div className="p-5 rounded-xl bg-[#F6F1E7] border border-[#DFD7C7] text-xs">
          <h4 className="font-semibold text-[#1A382A] mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Import Verification Report</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
            <div className="p-2 rounded bg-[#FBF9F4] border border-[#DFD7C7]">
              <span className="text-[#5C554C] block">Total Processed</span>
              <span className="font-bold text-[#1A382A] text-sm">{importResult.total_processed}</span>
            </div>
            <div className="p-2 rounded bg-[#FBF9F4] border border-[#DFD7C7]">
              <span className="text-[#5C554C] block">Imported New</span>
              <span className="font-bold text-emerald-700 text-sm">{importResult.imported}</span>
            </div>
            <div className="p-2 rounded bg-[#FBF9F4] border border-[#DFD7C7]">
              <span className="text-[#5C554C] block">Updated Existing</span>
              <span className="font-bold text-blue-700 text-sm">{importResult.updated}</span>
            </div>
            <div className="p-2 rounded bg-[#FBF9F4] border border-[#DFD7C7]">
              <span className="text-[#5C554C] block">Skipped</span>
              <span className="font-bold text-amber-700 text-sm">{importResult.skipped}</span>
            </div>
          </div>
          {importResult.errors?.length > 0 && (
            <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 space-y-1">
              <span className="font-semibold">Validation Errors Encountered:</span>
              {importResult.errors.map((e, idx) => (
                <p key={idx}>{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fictional Demo Data Section */}
      <div className="bg-[#FBF9F4] border border-[#DFD7C7] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C5933A]" />
          <h3 className="font-serif text-xl font-semibold text-[#1A382A]">
            Fictional Demo Archive
          </h3>
        </div>
        <p className="text-xs text-[#5C554C] leading-relaxed">
          Echoes never uses your personal memories for demos or testing. Reviewers can populate the archive with 6 respectfully written fictional memories illustrating diverse eras (1944 to 2005), people, and local AI reflections. Demo stories are tagged with an explicit <code className="bg-[#EDE5D5] px-1 py-0.5 rounded text-[11px] text-[#8C651E]">🎭 Demo Story</code> badge and can be removed at any time without affecting your personal recollections.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleSeedDemo(false)}
            disabled={isSeeding}
            className="px-4 py-2 rounded-lg bg-[#EDE5D5] text-[#1A382A] text-xs font-medium hover:bg-[#DFD7C7] transition-colors border border-[#DFD7C7]"
          >
            {isSeeding ? 'Seeding...' : 'Merge Fictional Demo Stories'}
          </button>

          {demoMemoriesCount > 0 && (
            <button
              onClick={handleClearDemoOnly}
              disabled={isClearingDemo}
              className="px-4 py-2 rounded-lg bg-[#F6F1E7] text-[#8C651E] text-xs font-medium hover:bg-[#EDE5D5] transition-colors border border-[#D8A64B]/40"
            >
              {isClearingDemo ? 'Removing...' : `Remove Demo Stories (${demoMemoriesCount})`}
            </button>
          )}

          <button
            onClick={handleClearArchive}
            disabled={isClearing}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 ml-auto flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Memories</span>
          </button>
        </div>
      </div>

      {/* Privacy & Storage Audit Card */}
      <div className="bg-[#EDE5D5]/50 border border-[#DFD7C7] rounded-xl p-6 text-xs text-[#5C554C] space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#1A382A]">
          <ShieldCheck className="w-4 h-4 text-[#D8A64B]" />
          <span>Architecture & Deployment Privacy Notice</span>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-[#1A382A]">Local Self-Hosted Mode:</strong> When installed and running on your own device, the application server binds strictly to loopback (<code className="bg-[#FBF9F4] px-1 py-0.5 rounded text-[11px]">127.0.0.1:8000</code>), reads from <code className="bg-[#FBF9F4] px-1 py-0.5 rounded text-[11px]">./data/echoes.db</code>, and connects to your local Ollama instance on <code className="bg-[#FBF9F4] px-1 py-0.5 rounded text-[11px]">127.0.0.1:11434</code>.
          </li>
          <li>
            <strong className="text-[#1A382A]">Hosted Preview Mode:</strong> If you are evaluating this app on a remote hosted preview (e.g. Render), note that web browsers cannot access your local device's Ollama from a remote server without explicit local bridging. For private family memories, running locally is strongly recommended.
          </li>
          <li>
            <strong className="text-[#1A382A]">Data at Rest:</strong> Local SQLite storage is not automatically encrypted at rest. For sensitive oral histories, ensure your device uses full-disk encryption (e.g. LUKS on Linux, FileVault on macOS, BitLocker on Windows).
          </li>
          <li>
            <strong className="text-[#1A382A]">Zero Telemetry:</strong> No analytics, tracking beacons, or cloud AI fallbacks are bundled into this codebase.
          </li>
        </ul>
      </div>
    </div>
  );
};
