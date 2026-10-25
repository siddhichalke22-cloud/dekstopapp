import * as projectsService from '../services/projectsService.js';
import prisma from '../services/prisma.js';
const allowedStatuses = new Set(['PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']);
const editableFields = ['name', 'description', 'status', 'progress', 'dueDate', 'teamId'];

function validateProjectData(data, { requireName = false } = {}) {
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return 'Request body must be a JSON object';
	}
	if (requireName && (typeof data.name !== 'string' || !data.name.trim())) {
		return 'Project name is required';
	}
	if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) {
		return 'Project name must be a non-empty string';
	}
	if (data.description !== undefined && typeof data.description !== 'string') {
		return 'Project description must be a string';
	}
	if (data.status !== undefined && !allowedStatuses.has(data.status)) {
		return 'Project status is invalid';
	}
	if (data.progress !== undefined && (!Number.isInteger(data.progress) || data.progress < 0 || data.progress > 100)) {
		return 'Project progress must be an integer from 0 to 100';
	}
	if (data.dueDate !== undefined && data.dueDate !== null && (typeof data.dueDate !== 'string' || Number.isNaN(Date.parse(data.dueDate)))) {
		return 'Project due date must be a valid date or null';
	}
	if (data.teamId !== undefined && data.teamId !== null && typeof data.teamId !== 'string') {
		return 'Project team id must be a string or null';
	}
	return null;
}

function selectEditableData(body) {
	return Object.fromEntries(
		editableFields
			.filter((field) => body[field] !== undefined)
			.map((field) => [field, body[field]]),
	);
}

function normalizeProjectData(data) {
	const normalized = { ...data };
	if (typeof normalized.name === 'string') normalized.name = normalized.name.trim();
	if (typeof normalized.description === 'string') normalized.description = normalized.description.trim();
	if (typeof normalized.dueDate === 'string') normalized.dueDate = new Date(normalized.dueDate);
	return normalized;
}

export async function listProjects(_request, response, next) {
	try {
		const projects = await projectsService.listProjects();
		return response.json(projects);
	} catch (error) {
		return next(error);
	}
}

export async function getProject(request, response, next) {
	try {
		const project = await projectsService.getProjectById(request.params.id);
		if (!project) return response.status(404).json({ error: 'Project not found' });
		return response.json(project);
	} catch (error) {
		return next(error);
	}
}

export async function createProject(request, response, next) {
	const validationError = validateProjectData(request.body, { requireName: true });
	if (validationError) return response.status(400).json({ error: validationError });
	const requiredSkills = request.body.requiredSkills || [];
	if (!Array.isArray(requiredSkills) || requiredSkills.some((skill) => !skill || typeof skill.name !== 'string' || !skill.name.trim())) {
		return response.status(400).json({ error: 'Required skills must be an array of named skills' });
	}
	const proficiencyLevels = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
	if (requiredSkills.some((skill) => skill.requiredLevel && !proficiencyLevels.has(skill.requiredLevel))) {
		return response.status(400).json({ error: 'Required skill level is invalid' });
	}

	try {
		const project = await projectsService.createProject(
			normalizeProjectData(selectEditableData(request.body)),
			requiredSkills.map((skill) => ({ name: skill.name.trim(), requiredLevel: skill.requiredLevel || 'BEGINNER' })),
		);
		return response.status(201).json(project);
	} catch (error) {
		return next(error);
	}
}

export async function updateProject(request, response, next) {
	const data = selectEditableData(request.body || {});
	if (Object.keys(data).length === 0) {
		return response.status(400).json({ error: 'At least one editable project field is required' });
	}
	const validationError = validateProjectData(data);
	if (validationError) return response.status(400).json({ error: validationError });

	try {
		const project = await projectsService.updateProject(request.params.id, normalizeProjectData(data));
		return response.json(project);
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Project not found' });
		return next(error);
	}
}

export async function deleteProject(request, response, next) {
	try {
		await projectsService.deleteProject(request.params.id);
		return response.status(204).end();
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Project not found' });
		return next(error);
	}
}

export async function applyToProject(request, response, next) {
	const { message = '' } = request.body || {};
	if (typeof message !== 'string' || message.length > 1000) {
		return response.status(400).json({ error: 'Application message must be under 1000 characters' });
	}

	try {
		const application = await projectsService.createProjectApplication(request.params.id, request.user.id, message.trim());
		return response.status(201).json(application);
	} catch (error) {
		if (error.code === 'P2002') return response.status(409).json({ error: 'You have already applied to this project' });
		if (error.code === 'P2003' || error.code === 'P2025') return response.status(404).json({ error: 'Project or student not found' });
		return next(error);
	}
}

export async function listMyApplications(request, response, next) {
	try {
		const applications = await prisma.projectApplication.findMany({
			where: { userId: request.user.id },
			include: { project: { include: { team: true, requiredSkills: { include: { skill: true } } } } },
			orderBy: { createdAt: 'desc' },
		});
		return response.json(applications);
	} catch (error) {
		return next(error);
	}
}

export async function listBookmarks(request, response, next) {
	try {
		const bookmarks = await prisma.projectBookmark.findMany({
			where: { userId: request.user.id },
			include: { project: { include: { team: true, requiredSkills: { include: { skill: true } } } } },
			orderBy: { createdAt: 'desc' },
		});
		return response.json(bookmarks.map((bookmark) => bookmark.project));
	} catch (error) {
		return next(error);
	}
}

export async function saveBookmark(request, response, next) {
	try {
		const bookmark = await prisma.projectBookmark.upsert({
			where: { projectId_userId: { projectId: request.params.id, userId: request.user.id } },
			create: { projectId: request.params.id, userId: request.user.id },
			update: {},
		});
		return response.status(201).json(bookmark);
	} catch (error) {
		if (error.code === 'P2003') return response.status(404).json({ error: 'Project not found' });
		return next(error);
	}
}

export async function removeBookmark(request, response, next) {
	try {
		await prisma.projectBookmark.deleteMany({ where: { projectId: request.params.id, userId: request.user.id } });
		return response.status(204).end();
	} catch (error) {
		return next(error);
	}
}
