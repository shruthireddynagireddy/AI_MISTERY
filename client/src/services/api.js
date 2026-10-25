async function request(path, options = {}) {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'Something went wrong. Please try again.');
  return payload;
}
export const createCase = (body) => request('/cases', { method: 'POST', body: JSON.stringify(body) });
export const getCase = (id) => request(`/cases/${id}`);
export const submitAccusation = (id, suspectId) => request(`/cases/${id}/accusations`, { method: 'POST', body: JSON.stringify({ suspectId }) });
