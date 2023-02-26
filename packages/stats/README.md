# Stats

Simple tool to track analytics to Stats (https://stats.olafros.com).

## Usage

Create an instance of Stats:

```tsx
// utils/stats.ts
import { Stats } from '@olros/stats';

const TEAM = '${teamSlug}';
const PROJECT = '${projectSlug}';

export const stats = Stats({ team: TEAM, project: PROJECT });`}
```

Use the `stats.pageview`-method on each pagenavigation to track pageviews. Example from React with React-Router:

```tsx
// routes/a-random-page.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { stats } from 'utils/stats'; // The instance created in the previous step

// ...

const location = useLocation();

useEffect(() => {
  stats.pageview();
}, [location.pathname, location.search]);
```

## Configuration

### `Stats()`

- `team`: The team-ID, required
- `project`: The project-ID, required
- `baseUrl`: URL of Stats. Must be set if self-hosted. Defaults to `https://stats.olafros.com`
- `allowLocalhost`: Send events from localhost, defaults to false
