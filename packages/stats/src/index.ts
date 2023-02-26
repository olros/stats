export type PageviewOptions = {
  /** Page of pageview. Defaults to `location.pathname`. Must be set if location is undefined (server-side) */
  pathname?: string;
};

export type StatsInit = {
  team: string;
  project: string;
  /** URL of Stats. Must be set if self-hosted. Defaults to `https://stats.olafros.com` */
  baseUrl?: string;
  /** Send events from localhost, defaults to false */
  allowLocalhost?: boolean;
}

/**
 * Create a stats-instance which has methods to track pageviews, etc...
 * @param init Configuration
 */
export const Stats = ({ team, project, baseUrl, allowLocalhost = false }: StatsInit) => {

  /**
   * Track a pageview
   * @param options Optional PageviewOptions
   */
  const pageview = async (options: PageviewOptions = {}): Promise<void> => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isBot = Boolean(window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress);
      if ((!allowLocalhost && window.location.host.includes('localhost')) || isBot) return;
    }
    const pathname = options.pathname || location.pathname;

    const data = {
      pathname,
      screen_width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    };

    await fetch(`${baseUrl || 'https://stats.olafros.com'}/api/${team}/${project}/pageview/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      mode: 'no-cors',
      credentials: 'omit',
    });
  }

  return { pageview };
}
