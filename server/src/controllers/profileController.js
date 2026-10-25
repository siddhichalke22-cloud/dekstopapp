import prisma from '../services/prisma.js';
const editableFields = ['name', 'email', 'title', 'initials', 'bio', 'university', 'major', 'projectUpdates', 'weeklyDigest'];

export async function getProfile(_request, response, next) {
	try {
		const profile = await prisma.user.findFirst({
			orderBy: { createdAt: 'asc' },
			select: {
				id: true, name: true, email: true, title: true, initials: true, bio: true,
				university: true, major: true, createdAt: true,
				skills: { include: { skill: true } },
				learningGoals: { include: { skill: true } },
			},
		});

		if (!profile) return response.status(404).json({ error: 'Profile not found' });
		return response.json(profile);
	} catch (error) {
		return next(error);
	}
}

export async function getMyProfile(request, response, next) {
	try {
		const profile = await prisma.user.findUnique({
			where: { id: request.user.id },
			include: { skills: { include: { skill: true } }, learningGoals: { include: { skill: true } } },
		});
		if (!profile) return response.status(404).json({ error: 'Profile not found' });
		const { passwordHash: _passwordHash, ...publicProfile } = profile;
		return response.json(publicProfile);
	} catch (error) {
		return next(error);
	}
}

export async function updateProfile(request, response, next) {
	const profileId = request.user?.id || request.params.id;
	const data = Object.fromEntries(
		editableFields
			.filter((field) => request.body[field] !== undefined)
			.map((field) => [field, request.body[field]]),
	);

	if (!profileId) return response.status(400).json({ error: 'Profile id is required' });
	if (Object.keys(data).length === 0) {
		return response.status(400).json({ error: 'At least one profile field is required' });
	}
	if (Object.entries(data).some(([field, value]) => {
		if (['projectUpdates', 'weeklyDigest'].includes(field)) return typeof value !== 'boolean';
		return typeof value !== 'string' || (['name', 'email', 'title', 'initials'].includes(field) && !value.trim());
	})) {
		return response.status(400).json({ error: 'Required profile fields must be non-empty strings' });
	}

	try {
		const profile = await prisma.user.update({
			where: { id: profileId },
			data: Object.fromEntries(Object.entries(data).map(([field, value]) => [field, value.trim()])),
			select: { id: true, name: true, email: true, title: true, initials: true, bio: true, university: true, major: true, projectUpdates: true, weeklyDigest: true, updatedAt: true },
		});
		return response.json(profile);
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Profile not found' });
		return next(error);
	}
}

export async function updateMySkills(request, response, next) {
	const { skills = [], learningGoals = [] } = request.body || {};
	if (!Array.isArray(skills) || !Array.isArray(learningGoals)) {
		return response.status(400).json({ error: 'Skills and learning goals must be arrays' });
	}
	const isValidSkill = (item) => item && typeof item.name === 'string' && item.name.trim();
	if (!skills.every(isValidSkill) || !learningGoals.every(isValidSkill)) {
		return response.status(400).json({ error: 'Each skill must include a name' });
	}
	const levels = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
	if (skills.some((item) => item.proficiency && !levels.has(item.proficiency)) || learningGoals.some((item) => item.targetLevel && !levels.has(item.targetLevel))) {
		return response.status(400).json({ error: 'Skill levels must be BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT' });
	}

	try {
		const profile = await prisma.$transaction(async (transaction) => {
			await transaction.userSkill.deleteMany({ where: { userId: request.user.id } });
			await transaction.learningGoal.deleteMany({ where: { userId: request.user.id } });
			for (const item of skills) {
				const skill = await transaction.skill.upsert({ where: { name: item.name.trim() }, update: {}, create: { name: item.name.trim() } });
				await transaction.userSkill.create({ data: { userId: request.user.id, skillId: skill.id, proficiency: item.proficiency || 'BEGINNER' } });
			}
			for (const item of learningGoals) {
				const skill = await transaction.skill.upsert({ where: { name: item.name.trim() }, update: {}, create: { name: item.name.trim() } });
				await transaction.learningGoal.create({ data: { userId: request.user.id, skillId: skill.id, targetLevel: item.targetLevel || 'INTERMEDIATE' } });
			}
			return transaction.user.findUnique({
				where: { id: request.user.id },
				include: { skills: { include: { skill: true } }, learningGoals: { include: { skill: true } } },
			});
		});
		if (!profile) return response.status(404).json({ error: 'Profile not found' });
		const { passwordHash: _passwordHash, ...publicProfile } = profile;
		return response.json(publicProfile);
	} catch (error) {
		return next(error);
	}
}

export async function listStudents(_request, response, next) {
	try {
		const students = await prisma.user.findMany({
			select: {
				id: true, name: true, initials: true, title: true, university: true, major: true, bio: true,
				skills: { include: { skill: true } },
				learningGoals: { include: { skill: true } },
			},
			orderBy: { createdAt: 'desc' },
			take: 50,
		});
		return response.json(students);
	} catch (error) {
		return next(error);
	}
}
