# Stats

Simple tool to track analytics to Stats (https://stats.olafros.com). This package is only exported as an ESM-module.

## Usage

Create an instance of Stats:

```tsx
// utils/stats.ts
import { Stats } from '@olros/stats';

const TEAM = 'your-team-ID';
const PROJECT = 'your-project-ID';

export const stats = Stats({ team: TEAM, project: PROJECT });`}
```

Use the `stats.pageview`-method on each pagenavigation to track pageviews. Example from React with React-Router:

```tsx
// route.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { stats } from 'utils/stats'; // Import the stats-instance

// ...

const location = useLocation();

useEffect(() => {
  stats.pageview();
}, [location.pathname, location.search]);
```

Use the `stats.event`-method to track custom events:

```tsx
// route.ts
import { stats } from 'utils/stats'; // Import the stats-instance

// ...

const handleClick = () => {
  stats.event('buy');
}
```

## Configuration

### `Stats<CustomEvents>()`:

- `team`: The team-ID, required
- `project`: The project-ID, required
- `baseUrl`: URL of Stats. Must be set if self-hosted. Defaults to `https://stats.olafros.com`
- `allowLocalhost`: Send events from localhost, defaults to false

The `CustomEvents`-generic can be used to optionally typecheck which custom events are allowed.
By default all strings are accepted:

```ts
const statsWithGenerics = Stats<'buy' | 'save'>(init);

statsWithGenerics.event('buy'); // ✅ No errors
statsWithGenerics.event('delete'); // ❌ Error

const statsWithoutGenerics = Stats(init);

statsWithoutGenerics.event('delete'); // ✅ No errors
```
