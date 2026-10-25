import prisma from '../services/prisma.js';
const editableFields = ['name', 'email', 'title', 'initials', 'bio', 'university', 'major'];

export async function getProfile(_request, response, next) {
	try {
		const profile = await prisma.user.findFirst({
			orderBy: { createdAt: 'asc' },
			include: {
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

export async function updateProfile(request, response, next) {
	const profileId = request.params.id;
	const data = Object.fromEntries(
		editableFields
			.filter((field) => request.body[field] !== undefined)
			.map((field) => [field, request.body[field]]),
	);

	if (!profileId) return response.status(400).json({ error: 'Profile id is required' });
	if (Object.keys(data).length === 0) {
		return response.status(400).json({ error: 'At least one profile field is required' });
	}
	if (Object.values(data).some((value) => typeof value !== 'string' || !value.trim())) {
		return response.status(400).json({ error: 'Profile fields must be non-empty strings' });
	}

	try {
		const profile = await prisma.user.update({
			where: { id: profileId },
			data: Object.fromEntries(Object.entries(data).map(([field, value]) => [field, value.trim()])),
			select: { id: true, name: true, email: true, title: true, initials: true, bio: true, university: true, major: true, updatedAt: true },
		});
		return response.json(profile);
	} catch (error) {
		if (error.code === 'P2025') return response.status(404).json({ error: 'Profile not found' });
		return next(error);
	}
}
