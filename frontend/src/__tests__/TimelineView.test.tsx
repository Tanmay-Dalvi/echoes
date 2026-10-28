import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineView } from '../components/TimelineView';
import { Memory } from '../types';

const mockMemories: Memory[] = [
  {
    id: 'm-dated',
    title: 'First Flight to Chicago',
    story: 'Boarded the propeller plane in 1962.',
    date: '1962-07-14',
    category: 'Milestone',
    people: ['Dad'],
    places: ['Chicago'],
    tags: ['travel'],
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
  },
  {
    id: 'm-undated',
    title: 'Summer at the Lakehouse',
    story: 'Swimming until fireflies came out.',
    approximate_period: 'Childhood Summer',
    category: 'Family',
    people: ['Siblings'],
    places: ['Lake'],
    tags: ['swimming'],
    created_at: '2026-10-28T00:00:00Z',
    updated_at: '2026-10-28T00:00:00Z',
  },
];

describe('TimelineView', () => {
  it('renders dated timeline and undated section gracefully', () => {
    render(
      <TimelineView
        memories={mockMemories}
        onViewMemory={vi.fn()}
        onEditMemory={vi.fn()}
        onDeleteMemory={vi.fn()}
      />
    );

    expect(screen.getByText('First Flight to Chicago')).toBeInTheDocument();
    expect(screen.getByText('1962-07-14')).toBeInTheDocument();
    expect(screen.getByText('Summer at the Lakehouse')).toBeInTheDocument();
    expect(screen.getByText(/Undated & Seasonal Recollections/i)).toBeInTheDocument();
  });
});

