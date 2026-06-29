import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders the brand logo', () => {
    render(<Logo />);

    expect(
      screen.getByRole('img', { name: /cocos logo/i })
    ).toBeInTheDocument();
  });
});
