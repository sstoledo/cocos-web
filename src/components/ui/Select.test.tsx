import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

describe('Select', () => {
  it('renders options and a label', () => {
    render(
      <Select label="Status" options={options} data-testid="status-select" />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Inactive' })
    ).toBeInTheDocument();
  });

  it('renders a placeholder option', () => {
    render(
      <Select
        options={options}
        placeholder="Choose a status"
        data-testid="status-select"
      />
    );

    expect(
      screen.getByRole('option', { name: 'Choose a status' })
    ).toBeInTheDocument();
  });

  it('calls onChange when a value is selected', async () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Status"
        options={options}
        onChange={handleChange}
        data-testid="status-select"
      />
    );

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'Inactive' })
    );

    expect(handleChange).toHaveBeenCalledOnce();
  });

  it('displays an error message', () => {
    render(
      <Select label="Status" options={options} error="Status is required" />
    );

    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });
});
