import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppTheme } from './use-app-theme';

describe('useAppTheme', () => {
  it('reports the app theme from the .dark class on <html>', async () => {
    document.documentElement.classList.remove('dark');
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe('light');

    await act(async () => {
      document.documentElement.classList.add('dark');
      await Promise.resolve();
    });
    expect(result.current).toBe('dark');
  });
});
