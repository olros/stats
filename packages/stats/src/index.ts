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
 * 
 * Generics can be used to optionally typecheck which custom events are allowed.
 * By default all strings are accepted
 * 
 * @param init Configuration
 * @example
 * ```
 * const stats = Stats<'buy' | 'save'>(init);
 * 
 * stats.event('buy'); // ✅ No errors
 * stats.event('delete'); // ❌ Error
 * ```
 */
export const Stats = <CustomEvents extends string>({ team, project, baseUrl, allowLocalhost = false }: StatsInit) => {
  
  const requestInit: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'no-cors',
    credentials: 'omit',
  };

  const url = `${baseUrl || 'https://stats.olafros.com'}/api/${team}/${project}`;

  const isBotOrLocalhost = () => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isBot = Boolean(window._phantom || window.__nightmare || window.navigator.webdriver || window.Cypress);
      if ((!allowLocalhost && window.location.host.includes('localhost')) || isBot) return true;
    }
    return false;
  }

  /**
   * Track a pageview
   * @param options Optional PageviewOptions
   */
  const pageview = async (options: PageviewOptions = {}): Promise<void> => {
    if (isBotOrLocalhost()) {
      return;
    }
    const pathname = options.pathname || location.pathname;

    const data = {
      pathname,
      screen_width: typeof window !== 'undefined' ? window.innerWidth : undefined,
    };

    await fetch(`${url}/pageview/`, { ...requestInit, body: JSON.stringify(data) });
  };

  /**
   * Track a custom event
   * @param name The event name
   */
  const event = async (name: CustomEvents): Promise<void> => {
    if (isBotOrLocalhost()) {
      return;
    }

    const data = { name };

    await fetch(`${url}/event/`, { ...requestInit, body: JSON.stringify(data) });
  };

  return { event, pageview };
};
