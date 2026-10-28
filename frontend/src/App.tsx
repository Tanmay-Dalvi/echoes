import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MemoryGardenView } from './components/MemoryGardenView';
import { TimelineView } from './components/TimelineView';
import { AIAssistantView } from './components/AIAssistantView';
import { BackupView } from './components/BackupView';
import { MemoryDetailModal } from './components/MemoryDetailModal';
import { MemoryFormModal } from './components/MemoryFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import {
  fetchHealth,
  fetchAIStatus,
  fetchMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  seedDemoData,
} from './api';
import { Memory, MemoryCreate, HealthStatus, AIStatus } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'garden' | 'timeline' | 'ai' | 'backup'>('garden');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);
  const [deletingMemory, setDeletingMemory] = useState<Memory | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = useCallback(async (isInitial = false) => {
    setIsRefreshing(true);
    try {
      const [h, ai, mems] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchAIStatus().catch(() => null),
        fetchMemories({
          search: searchQuery || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort: sortBy,
        }).catch(() => []),
      ]);

      if (h) setHealth(h);
      if (ai) setAiStatus(ai);
      setMemories(mems);
    } catch (err: any) {
      showNotification('Failed to connect to local Echoes service', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    loadAllData(true);
  }, []);

  useEffect(() => {
    loadAllData(false);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleCreateMemory = async (data: MemoryCreate) => {
    setIsSubmitting(true);
    try {
      if (editingMemory) {
        const updated = await updateMemory(editingMemory.id, data);
        setMemories(memories.map((m) => (m.id === updated.id ? updated : m)));
        showNotification(`Memory "${updated.title}" updated.`);
      } else {
        const created = await createMemory(data);
        setMemories([created, ...memories]);
        showNotification(`Memory "${created.title}" preserved to archive.`);
      }
      setIsCreateModalOpen(false);
      setEditingMemory(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to save memory', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingMemory) return;
    setIsDeleting(true);
    try {
      await deleteMemory(deletingMemory.id);
      setMemories(memories.filter((m) => m.id !== deletingMemory.id));
      showNotification(`"${deletingMemory.title}" removed from local archive.`);
      setDeletingMemory(null);
      if (viewingMemory?.id === deletingMemory.id) {
        setViewingMemory(null);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete memory', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMemoryUpdated = (updated: Memory) => {
    setMemories(memories.map((m) => (m.id === updated.id ? updated : m)));
    if (viewingMemory?.id === updated.id) {
      setViewingMemory(updated);
    }
  };

  const handleSeedDemoDirect = async () => {
    try {
      await seedDemoData(false);
      await loadAllData();
      showNotification('Fictional demo memories seeded successfully.');
    } catch (err: any) {
      showNotification(err.message || 'Demo seeding failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#282520] flex flex-col font-sans selection:bg-[#E8DFC8]">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-70 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-[#1A382A] text-[#EDE5D5] border-[#D8A64B]/40'
              : 'bg-red-800 text-white border-red-900'
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={() => {
          setEditingMemory(null);
          setIsCreateModalOpen(true);
        }}
        health={health}
        aiStatus={aiStatus}
        onRefresh={() => loadAllData(false)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="grow max-w-6xl w-full mx-auto px-4 py-8">
        {currentTab === 'garden' && (
          <MemoryGardenView
            memories={memories}
            onViewMemory={(m) => setViewingMemory(m)}
            onEditMemory={(m) => {
              setEditingMemory(m);
              setIsCreateModalOpen(true);
            }}
            onDeleteMemory={(m) => setDeletingMemory(m)}
            onOpenCreateModal={() => {
              setEditingMemory(null);
              setIsCreateModalOpen(true);
            }}
            onOpenAIModal={(m) => {
              setCurrentTab('ai');
            }}
            onSeedDemo={handleSeedDemoDirect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView
            memories={memories}
            onViewMemory={(m) => setViewingMemory(m)}
            onEditMemory={(m) => {
              setEditingMemory(m);
              setIsCreateModalOpen(true);
            }}
            onDeleteMemory={(m) => setDeletingMemory(m)}
          />
        )}

        {currentTab === 'ai' && (
          <AIAssistantView
            memories={memories}
            aiStatus={aiStatus}
            onMemoryUpdated={handleMemoryUpdated}
            onRefreshAIStatus={() => fetchAIStatus().then(setAiStatus).catch(() => null)}
          />
        )}

        {currentTab === 'backup' && (
          <BackupView
            memories={memories}
            health={health}
            onRefreshData={() => loadAllData(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DFD7C7] bg-[#F6F1E7] text-[#5C554C] text-xs py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-[#1A382A]">Echoes</span>
            <span>&bull;</span>
            <span className="italic">A Private Memory Garden</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-[#7A7368]">
            Local-First &bull; Open-Weight AI (<span className="font-mono">gemma3:1b</span>) &bull; Zero External Telemetry &bull; Hacktoberfest 2026
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MemoryDetailModal
        memory={viewingMemory}
        onClose={() => setViewingMemory(null)}
        onEdit={(m) => {
          setViewingMemory(null);
          setEditingMemory(m);
          setIsCreateModalOpen(true);
        }}
        onDelete={(m) => setDeletingMemory(m)}
        onMemoryUpdated={handleMemoryUpdated}
      />

      <MemoryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingMemory(null);
        }}
        onSubmit={handleCreateMemory}
        initialData={editingMemory}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingMemory}
        memory={deletingMemory}
        onClose={() => setDeletingMemory(null)}
        onConfirm={handleDeleteConfirmed}
        isDeleting={isDeleting}
      />
    </div>
  );
};

