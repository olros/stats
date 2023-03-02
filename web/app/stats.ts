import { Stats } from '@olros/stats';

export const stats = Stats<'live-demo' | 'update-filters'>({
  team: 'olros',
  project: 'stats',
  allowLocalhost: process.env.NODE_ENV === 'development',
  baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
});
