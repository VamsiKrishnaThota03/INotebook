// In development the CRA proxy (package.json "proxy") forwards /api to http://localhost:5000.
// For a deployed build set REACT_APP_API_URL to the backend origin.
const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export const getToken = () => localStorage.getItem('token');

export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) headers['auth-token'] = getToken() || '';
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // empty or non-JSON body
  }
  if (!response.ok) {
    const message =
      (data && data.errors && data.errors.map((e) => e.msg).join('. ')) ||
      (data && data.error) ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}
