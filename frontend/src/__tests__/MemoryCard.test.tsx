import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryCard } from '../components/MemoryCard';
import { Memory } from '../types';

const mockMemory: Memory = {
  id: 'test-1',
  title: 'Grandmother Cooking Stew',
  story: 'She stirred the pot with a wooden spoon carved by her father.',
  date: '1985-11-20',
  approximate_period: 'Late Autumn 1985',
  category: 'Tradition',
  people: ['Grandmother', 'Father'],
  places: ['Kitchen'],
  tags: ['cooking', 'stew'],
  ai_remembrance_card: {
    title: 'The Wooden Spoon',
    essence: 'Hand-carved wood stirring memories across generations.',
    key_elements: ['Carved spoon', 'Autumn stew'],
    generated_at: '2026-10-28T00:00:00Z',
    model: 'gemma3:1b',
    is_ai_assisted: true,
  },
  created_at: '2026-10-28T00:00:00Z',
  updated_at: '2026-10-28T00:00:00Z',
};

describe('MemoryCard', () => {
  it('renders memory title, date, category and people', () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <MemoryCard
        memory={mockMemory}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Grandmother Cooking Stew')).toBeInTheDocument();
    expect(screen.getByText('Tradition')).toBeInTheDocument();
    expect(screen.getByText('Grandmother')).toBeInTheDocument();
    expect(screen.getByText('1985-11-20')).toBeInTheDocument();
    expect(screen.getByText(/The Wooden Spoon/i)).toBeInTheDocument();
  });

  it('triggers onView when clicking title or read button', () => {
    const onView = vi.fn();
    render(
      <MemoryCard
        memory={mockMemory}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Grandmother Cooking Stew'));
    expect(onView).toHaveBeenCalledWith(mockMemory);
  });

  it('renders demo story badge when is_fictional_demo is true', () => {
    const demoMem: Memory = { ...mockMemory, is_fictional_demo: true };
    render(
      <MemoryCard
        memory={demoMem}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText(/Demo Story/i)).toBeInTheDocument();
  });
});

