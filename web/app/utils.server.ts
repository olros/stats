import { LoaderFunctionArgs, redirect as remixRedirect } from '@remix-run/node';
import create_slug from 'slugify';

export const slugify = (string: string) =>
  create_slug(string, {
    lower: true,
    strict: true,
    trim: true,
  });

export const redirect = (_: LoaderFunctionArgs['response'], to: string): never => {
  return remixRedirect(to) as never;
};
