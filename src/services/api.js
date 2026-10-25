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
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			signal,
			headers: {
				...(options.body ? { 'Content-Type': 'application/json' } : {}),
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
	getProfile: ({ signal } = {}) => request('/profile', { signal }),
	updateProfile: (id, changes, { signal } = {}) => request(`/profile/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(changes),
		signal,
	}),
	getSkills: ({ signal } = {}) => request('/skills', { signal }),
	getSkillExchanges: ({ signal } = {}) => request('/skills/exchanges', { signal }),
	createSkillExchange: (exchange, { signal } = {}) => request('/skills/exchanges', {
		method: 'POST',
		body: JSON.stringify(exchange),
		signal,
	}),
};

export default api;
