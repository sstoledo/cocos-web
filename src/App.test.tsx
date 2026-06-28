import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

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
