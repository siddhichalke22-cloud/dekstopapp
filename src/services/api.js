const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
	constructor(message, status, details) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.details = details;
	}
}

async function request(path, { signal, ...options } = {}) {
	let response;
	const token = localStorage.getItem('skillbridge.token');
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			signal,
			headers: {
				...(options.body ? { 'Content-Type': 'application/json' } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...options.headers,
			},
		});
	} catch (error) {
		if (error.name === 'AbortError') throw error;
		throw new ApiError('Unable to reach the API server.', 0, error);
	}

	if (response.status === 204) return null;

	const contentType = response.headers.get('content-type') || '';
	const result = contentType.includes('application/json')
		? await response.json()
		: await response.text();

	if (!response.ok) {
		const message = typeof result === 'object' && result?.error
			? result.error
			: `API request failed with status ${response.status}.`;
		throw new ApiError(message, response.status, result);
	}

	return result;
}

export const api = {
	health: ({ signal } = {}) => request('/health', { signal }),
	register: (student, { signal } = {}) => request('/auth/register', { method: 'POST', body: JSON.stringify(student), signal }),
	login: (credentials, { signal } = {}) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials), signal }),
	getProjects: ({ signal } = {}) => request('/projects', { signal }),
	getProject: (id, { signal } = {}) => request(`/projects/${encodeURIComponent(id)}`, { signal }),
	createProject: (project, { signal } = {}) => request('/projects', {
		method: 'POST',
		body: JSON.stringify(project),
		signal,
	}),
	updateProject: (id, changes, { signal } = {}) => request(`/projects/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(changes),
		signal,
	}),
	deleteProject: (id, { signal } = {}) => request(`/projects/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		signal,
	}),
	applyToProject: (id, message = '', { signal } = {}) => request(`/projects/${encodeURIComponent(id)}/applications`, {
		method: 'POST', body: JSON.stringify({ message }), signal,
	}),
	getMyApplications: ({ signal } = {}) => request('/projects/me/applications', { signal }),
	getBookmarks: ({ signal } = {}) => request('/projects/me/bookmarks', { signal }),
	saveBookmark: (id, { signal } = {}) => request(`/projects/${encodeURIComponent(id)}/bookmark`, { method: 'PUT', signal }),
	removeBookmark: (id, { signal } = {}) => request(`/projects/${encodeURIComponent(id)}/bookmark`, { method: 'DELETE', signal }),
	getTeams: ({ signal } = {}) => request('/teams', { signal }),
	getTeam: (id, { signal } = {}) => request(`/teams/${encodeURIComponent(id)}`, { signal }),
	createTeam: (team, { signal } = {}) => request('/teams', {
		method: 'POST',
		body: JSON.stringify(team),
		signal,
	}),
	updateTeam: (id, changes, { signal } = {}) => request(`/teams/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(changes),
		signal,
	}),
	deleteTeam: (id, { signal } = {}) => request(`/teams/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		signal,
	}),
	applyToTeam: (id, message = '', { signal } = {}) => request(`/teams/${encodeURIComponent(id)}/applications`, {
		method: 'POST', body: JSON.stringify({ message }), signal,
	}),
	getMyTeamApplications: ({ signal } = {}) => request('/teams/me/applications', { signal }),
	getProfile: ({ signal } = {}) => request('/profile', { signal }),
	getMyProfile: ({ signal } = {}) => request('/profile/me', { signal }),
	getStudents: ({ signal } = {}) => request('/profile/students', { signal }),
	updateMyProfile: (changes, { signal } = {}) => request('/profile/me', { method: 'PATCH', body: JSON.stringify(changes), signal }),
	updateMySkills: (data, { signal } = {}) => request('/profile/me/skills', { method: 'PUT', body: JSON.stringify(data), signal }),
	updateProfile: (id, changes, { signal } = {}) => request(`/profile/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(changes),
		signal,
	}),
	getSkills: ({ signal } = {}) => request('/skills', { signal }),
	getSkillExchanges: ({ signal } = {}) => request('/skills/exchanges', { signal }),
	getSkillOffers: ({ signal } = {}) => request('/skills/offers', { signal }),
	createSkillOffer: (offer, { signal } = {}) => request('/skills/offers', { method: 'POST', body: JSON.stringify(offer), signal }),
	requestSkillExchange: (offerId, message = '', { signal } = {}) => request('/skills/requests', { method: 'POST', body: JSON.stringify({ offerId, message }), signal }),
	createSkillExchange: (exchange, { signal } = {}) => request('/skills/exchanges', {
		method: 'POST',
		body: JSON.stringify(exchange),
		signal,
	}),
};

export function saveSession(session) {
	localStorage.setItem('skillbridge.token', session.token);
	localStorage.setItem('skillbridge.user', JSON.stringify(session.user));
}

export function getSessionUser() {
	try { return JSON.parse(localStorage.getItem('skillbridge.user') || 'null'); } catch { return null; }
}

export function clearSession() {
	localStorage.removeItem('skillbridge.token');
	localStorage.removeItem('skillbridge.user');
}

export default api;
