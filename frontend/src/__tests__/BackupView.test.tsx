import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackupView } from '../components/BackupView';

describe('BackupView', () => {
  it('renders export, restore options and privacy details', () => {
    render(
      <BackupView
        memories={[]}
        health={null}
        onRefreshData={vi.fn()}
      />
    );

    expect(screen.getByText('Backup, Export & Restore')).toBeInTheDocument();
    expect(screen.getByText(/Export Archive \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Restore \/ Import Archive/i)).toBeInTheDocument();
    expect(screen.getByText(/Conflict Handling Strategy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fictional Demo Archive/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Notice/i)).toBeInTheDocument();
  });
});

