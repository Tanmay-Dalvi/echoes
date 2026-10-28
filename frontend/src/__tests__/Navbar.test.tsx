import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';

describe('Navbar', () => {
  it('renders branding and navigation tabs', () => {
    const setCurrentTab = vi.fn();
    const onOpenCreate = vi.fn();
    const onRefresh = vi.fn();

    render(
      <Navbar
        currentTab="garden"
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={onOpenCreate}
        health={null}
        aiStatus={{
          connected: true,
          model_available: true,
          configured_model: 'gemma3:1b',
          offline_capable: true,
        }}
        onRefresh={onRefresh}
        isRefreshing={false}
      />
    );

    expect(screen.getByText('Echoes')).toBeInTheDocument();
    expect(screen.getByText('Memory Garden')).toBeInTheDocument();
    expect(screen.getByText(/gemma3:1b.*Active/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Timeline'));
    expect(setCurrentTab).toHaveBeenCalledWith('timeline');

    fireEvent.click(screen.getByText('AI Reflections'));
    expect(setCurrentTab).toHaveBeenCalledWith('ai');
  });
});

