import { IconTool } from '@tabler/icons-react';
import * as React from 'react';

export function Logo() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
      <span role="img" aria-label="Cocos logo">
        <IconTool className="h-8 w-8 text-primary-foreground" stroke={2} />
      </span>
    </div>
  );
}
