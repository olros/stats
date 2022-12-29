import create_slug from 'slugify';

export const slugify = (string: string) =>
  create_slug(string, {
    lower: true,
    strict: true,
    trim: true,
  });
