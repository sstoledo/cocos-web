import * as React from 'react';

export function Logo() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
      <svg
        className="h-8 w-8 text-primary-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Cocos logo"
      >
        <title>Cocos logo</title>
        <path
          d={
            'M22.7 2.3 21 .6c-.4-.4-1-.4-1.4 0l-1.4 1.4 3.2 3.2 1.4-1.4 ' +
            'c.4-.4.4-1 0-1.5zM19.3 5.7 7.1 17.9l-3.2-3.2L16.1 2.5l3.2 3.2z ' +
            'M6.4 18.6l-2.1 2.1c-.4.4-.4 1 0 1.4l1.8 1.8c.4.4 1 .4 1.4 0 ' +
            'l2.1-2.1-3.2-3.2z'
          }
        />
      </svg>
    </div>
  );
}
