/**
 * Forward a request from an edge-function to an internal serverless function.
 * This is done to speed up request from the clients perspectives
 * @param url The URL-segment after `/api-internal/`
 */
export const forwardRequestToInternalApi = async (request: Request, url: string) => {
  const host = process.env.NODE_ENV === 'production' ? 'https://stats.olafros.com' : 'http://localhost:3000';
  const body = await request.json();
  return fetch(`${host}/api-internal/${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: request.headers,
  });
};
