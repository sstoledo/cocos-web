import App from '@/App';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows the shell header', () => {
    render(<App />);
    expect(screen.getByText('Cocos')).toBeInTheDocument();
  });
});
