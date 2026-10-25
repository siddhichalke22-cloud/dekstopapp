import prisma from '../services/prisma.js';
const editableFields = ['name', 'description'];

function selectTeamData(body = {}) {
	return Object.fromEntries(
		editableFields
			.filter((field) => body[field] !== undefined)
			.map((field) => [field, body[field]]),
	);
}

function validateTeamData(data, { requireName = false } = {}) {
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return 'Request body must be a JSON object';
	}
	if (requireName && (typeof data.name !== 'string' || !data.name.trim())) {
		return 'Team name is required';
	}
	if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) {
		return 'Team name must be a non-empty string';
	}
	if (data.description !== undefined && typeof data.description !== 'string') {
		return 'Team description must be a string';
	}
	return null;
}

function normalizeTeamData(data) {
	return Object.fromEntries(
		Object.entries(data).map(([field, value]) => [field, typeof value === 'string' ? value.trim() : value]),
	);
}

const teamInclude = {
	members: { include: { user: { select: { id: true, name: true, email: true, initials: true } } } },
	projects: { select: { id: true, name: true, status: true, progress: true } },
};

export async function listTeams(_request, response, next) {
	try {
		const teams = await prisma.team.findMany({
			include: teamInclude,
			orderBy: { name: 'asc' },
		});
		return response.json(teams);
	} catch (error) {
		return next(error);
	}
}

export async function getTeam(request, response, next) {
	try {
		const team = await prisma.team.findUnique({
			where: { id: request.params.id },
			include: teamInclude,
		});
		if (!team) return response.status(404).json({ error: 'Team not found' });
		return response.json(team);
	} catch (error) {
		return next(error);
	}
}

export async function createTeam(request, response, next) {
	const data = selectTeamData(request.body);
	const validationError = validateTeamData(data, { requireName: true });
	if (validationError) return response.status(400).json({ error: validationError });

	try {
		const team = await prisma.team.create({
			data: normalizeTeamData(data),
			include: teamInclude,
		});
		return response.status(201).json(team);
	} catch (error) {
		return next(error);
	}
}

export async function updateTeam(request, response, next) {
	const data = selectTeamData(request.body);
	if (Object.keys(data).length === 0) {
		return response.status(400).json({ error: 'At least one editable team field is required' });
	}
	const validationError = validateTeamData(data);
	if (validationError) return response.status(400).json({ error: validationError });

	try {
		const team = await prisma.team.update({
			where: { id: request.params.id },
			data: normalizeTeamData(data),
			include: teamInclude,
		});
		return response.json(team);
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Team not found' });
		return next(error);
	}
}

export async function deleteTeam(request, response, next) {
	try {
		await prisma.team.delete({ where: { id: request.params.id } });
		return response.status(204).end();
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Team not found' });
		return next(error);
	}
}
