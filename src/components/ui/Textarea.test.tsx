import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders and accepts input', async () => {
    render(<Textarea label="Description" data-testid="description-textarea" />);

    expect(screen.getByText('Description')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'A product description');

    expect(textarea).toHaveValue('A product description');
  });

  it('displays an error message', () => {
    render(<Textarea label="Notes" error="Notes are required" />);

    expect(screen.getByText('Notes are required')).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(
      <Textarea className="custom-textarea-class" data-testid="textarea" />
    );

    expect(screen.getByTestId('textarea')).toHaveClass('custom-textarea-class');
  });
});
