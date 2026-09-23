import type { Access } from 'payload';

/** Any logged-in editor. */
export const authenticated: Access = ({ req }) => Boolean(req.user);

/** Everyone can read published documents; editors also see drafts. */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: 'published' } };
};

export const anyone: Access = () => true;
