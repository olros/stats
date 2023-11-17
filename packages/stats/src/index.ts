export type PageviewOptions = {
  /** Page of pageview. Defaults to `location.pathname`. Must be set if location is undefined (server-side) */
  pathname?: string;
  /** Referrer-site, defaults to `window.document.referrer` if available */
  referrer?: string;
};

export type StatsInit = {
  team: string;
  project: string;
  /** URL of Stats. Must be set if self-hosted. Defaults to `https://stats.olafros.com` */
  baseUrl?: string;
  /** Send events from localhost, defaults to false */
  allowLocalhost?: boolean;
};

/**
 * Create a stats-instance which has methods to track pageviews and events
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
export const Stats = <CustomEvents extends string>({
  team,
  project,
  baseUrl,
  allowLocalhost = false,
}: StatsInit) => {
  const url = `${
    baseUrl || "https://stats.olafros.com"
  }/api/${team}/${project}`;

  const sendRequest = async (
    endpoint: "event" | "pageview",
    data: Record<string, unknown>
  ) => {
    if (typeof window !== "undefined") {
      return navigator.sendBeacon(`${url}/${endpoint}/`, JSON.stringify(data));
    }
    return fetch(`${url}/${endpoint}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      credentials: "omit",
      body: JSON.stringify(data),
    }).then(({ ok }) => ok);
  };

  const isBotOrLocalhost = () => {
    if (typeof window !== "undefined") {
      const isBot = Boolean(
        // @ts-ignore
        window._phantom ||
          // @ts-ignore
          window.__nightmare ||
          window.navigator.webdriver ||
          // @ts-ignore
          window.Cypress
      );
      if (
        (!allowLocalhost && window.location.host.includes("localhost")) ||
        isBot
      )
        return true;
    }
    return false;
  };

  /**
   * Track a pageview
   * @param options Optional PageviewOptions
   */
  const pageview = async (options: PageviewOptions = {}): Promise<boolean> => {
    try {
      if (isBotOrLocalhost()) {
        return false;
      }
      const pathname = options.pathname || location.pathname;
      const referrer =
        options.referrer ||
        (typeof window !== "undefined" ? window.document.referrer : null);

      const data = {
        pathname,
        screen_width:
          typeof window !== "undefined" ? window.innerWidth : undefined,
        referrer,
      };

      return sendRequest(`pageview`, data);
    } catch {
      return false;
    }
  };

  /**
   * Track a custom event
   * @param name The event name
   */
  const event = async (name: CustomEvents): Promise<boolean> => {
    try {
      if (isBotOrLocalhost()) {
        return false;
      }
      return sendRequest(`event`, { name });
    } catch {
      return false;
    }
  };

  return { event, pageview };
};
