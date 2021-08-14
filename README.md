# VSCode Type-only imports and exports

## Overview

Convert imports or exports to `import type` and `export type` when possible.

**For imports:**

```ts
// CONVERT THIS

import UserComponent, { UserComponentProps } from './UserComponent';

// TO

import UserComponent from './UserComponent';
import type { UserComponentProps } from "./UserComponent";
```

**For exports:**

```ts
// CONVERT THIS

export { UserComponentProps, UserComponent } from './UserComponent';
export { UserType } from './types';
export { DEFAULT_USER } from './constants';

// TO

export { UserComponent } from './UserComponent';
export type { UserComponentProps } from "./UserComponent";
export type { UserType } from "./types";
export { DEFAULT_USER } from './constants';
```

## Changelog

[CHANGELOG.md](https://github.com/mscolnick/vscode-type-only-imports/blob/master/CHANGELOG.md)
