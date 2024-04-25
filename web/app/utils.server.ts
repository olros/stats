import { LoaderFunctionArgs } from '@remix-run/node';
import create_slug from 'slugify';

export const slugify = (string: string) =>
  create_slug(string, {
    lower: true,
    strict: true,
    trim: true,
  });

export const redirect = (response: LoaderFunctionArgs['response'], to: string) => {
  if (response) {
    response.status = 302;
    response.headers.set('Location', to);
    throw response;
  }
  throw new Error("response can't be null when using redirect");
};
