import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const projectRelations = {
	include: {
		members: { include: { user: { select: { id: true, name: true, initials: true } } } },
		team: true,
		requiredSkills: { include: { skill: true } },
	},
};

export function listProjects() {
	return prisma.project.findMany({
		...projectRelations,
		orderBy: { updatedAt: 'desc' },
	});
}

export function getProjectById(id) {
	return prisma.project.findUnique({
		where: { id },
		...projectRelations,
	});
}

export function createProject(data) {
	return prisma.project.create({ data });
}

export function updateProject(id, data) {
	return prisma.project.update({ where: { id }, data });
}

export function deleteProject(id) {
	return prisma.project.delete({ where: { id } });
}

export function createProjectApplication(projectId, userId, message) {
	return prisma.projectApplication.create({
		data: { projectId, userId, message },
		include: { project: { select: { id: true, name: true } } },
	});
}
