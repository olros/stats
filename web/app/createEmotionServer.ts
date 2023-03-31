/**
 * Polyfilled `createEmotionServer` with solution from the following GitHub comment:
 * https://github.com/emotion-js/emotion/issues/2446#issuecomment-1372440174
 * In order to allow the application to be runned in a worker-environment (Vercel edge)
 */

import type { EmotionCache } from '@emotion/utils';

interface EmotionCriticalToChunks {
  html: string;
  styles: { key: string; ids: string[]; css: string }[];
}

interface EmotionServer {
  constructStyleTagsFromChunks: (criticalData: EmotionCriticalToChunks) => string;
  extractCriticalToChunks: (html: string) => EmotionCriticalToChunks;
}

function createExtractCriticalToChunks(cache: EmotionCache) {
  return function (html: string): EmotionCriticalToChunks {
    const RGX = new RegExp(`${cache.key}-([a-zA-Z0-9-_]+)`, 'gm');

    const o: EmotionCriticalToChunks = { html, styles: [] };
    let match: null | RegExpExecArray;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids: Record<any, boolean> = {};
    while ((match = RGX.exec(html)) !== null) {
      if (ids[match[1]] === undefined) {
        ids[match[1]] = true;
      }
    }

    const regularCssIds: string[] = [];
    let regularCss = '';

    Object.keys(cache.inserted).forEach((id) => {
      if ((ids[id] !== undefined || cache.registered[`${cache.key}-${id}`] === undefined) && cache.inserted[id] !== true) {
        if (cache.registered[`${cache.key}-${id}`]) {
          regularCssIds.push(id);
          regularCss += cache.inserted[id];
        } else {
          o.styles.push({
            key: `${cache.key}-global`,
            ids: [id],
            css: cache.inserted[id] as string,
          });
        }
      }
    });

    o.styles.push({ key: cache.key, ids: regularCssIds, css: regularCss });

    return o;
  };
}

function generateStyleTag(cssKey: string, ids: string, styles: string, nonceString: string) {
  return `<style data-emotion="${cssKey} ${ids}"${nonceString}>${styles}</style>`;
}

function createConstructStyleTagsFromChunks(cache: EmotionCache, nonceString: string) {
  return function (criticalData: EmotionCriticalToChunks): string {
    let styleTagsString = '';

    criticalData.styles.forEach((item) => {
      styleTagsString += generateStyleTag(item.key, item.ids.join(' '), item.css, nonceString);
    });

    return styleTagsString;
  };
}

export function createEmotionServer(cache: EmotionCache): EmotionServer {
  if (cache.compat !== true) {
    cache.compat = true;
  }
  const nonceString = cache.nonce !== undefined ? ` nonce="${cache.nonce}"` : '';
  return {
    extractCriticalToChunks: createExtractCriticalToChunks(cache),
    constructStyleTagsFromChunks: createConstructStyleTagsFromChunks(cache, nonceString),
  };
}
