import prisma from './prisma.js';

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

export function createProject(data, requiredSkills = []) {
	return prisma.$transaction(async (transaction) => {
		const skills = await Promise.all(requiredSkills.map((item) => transaction.skill.upsert({
			where: { name: item.name },
			update: {},
			create: { name: item.name },
		})));
		return transaction.project.create({
			data: {
				...data,
				requiredSkills: { create: skills.map((skill, index) => ({ skillId: skill.id, requiredLevel: requiredSkills[index].requiredLevel })) },
			},
			...projectRelations,
		});
	});
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
