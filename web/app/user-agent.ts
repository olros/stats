import type { IResult } from 'ua-parser-js';
import { UAParser } from 'ua-parser-js';

export type UserAgentData = IResult & {
  isBot: boolean;
};

const isBot = (input: string): boolean =>
  /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(
    input,
  );

const userAgentFromString = (input: string | undefined): UserAgentData => ({
  ...UAParser(input),
  isBot: input === undefined ? false : isBot(input),
});

export const userAgent = (request: Request): UserAgentData => userAgentFromString(request.headers.get('user-agent') || undefined);
