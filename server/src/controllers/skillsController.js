import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listSkills(_request, response, next) {
	try {
		const skills = await prisma.skill.findMany({
			include: { _count: { select: { userSkills: true, projectRequirements: true } } },
			orderBy: { name: 'asc' },
		});
		return response.json(skills);
	} catch (error) {
		return next(error);
	}
}

export async function listSkillExchanges(_request, response, next) {
	try {
		const exchanges = await prisma.skillExchange.findMany({
			where: { status: 'OPEN' },
			include: {
				provider: { select: { id: true, name: true, initials: true, major: true } },
				offeredSkill: true,
				wantedSkill: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return response.json(exchanges);
	} catch (error) {
		return next(error);
	}
}

export async function createSkillExchange(request, response, next) {
	const { providerId, requesterId, offeredSkill, wantedSkill, message = '' } = request.body || {};
	if (![providerId, requesterId, offeredSkill, wantedSkill].every((value) => typeof value === 'string' && value.trim())) {
		return response.status(400).json({ error: 'providerId, requesterId, offeredSkill, and wantedSkill are required' });
	}
	if (providerId === requesterId) return response.status(400).json({ error: 'You cannot request an exchange from yourself' });
	if (typeof message !== 'string' || message.length > 1000) {
		return response.status(400).json({ error: 'Message must be under 1000 characters' });
	}

	try {
		const exchange = await prisma.$transaction(async (transaction) => {
			const [offer, want] = await Promise.all([
				transaction.skill.upsert({ where: { name: offeredSkill.trim() }, update: {}, create: { name: offeredSkill.trim() } }),
				transaction.skill.upsert({ where: { name: wantedSkill.trim() }, update: {}, create: { name: wantedSkill.trim() } }),
			]);
			return transaction.skillExchange.create({
				data: {
					providerId: providerId.trim(),
					requesterId: requesterId.trim(),
					offeredSkillId: offer.id,
					wantedSkillId: want.id,
					message: message.trim(),
				},
				include: { provider: { select: { id: true, name: true, initials: true } }, offeredSkill: true, wantedSkill: true },
			});
		});
		return response.status(201).json(exchange);
	} catch (error) {
		if (error.code === 'P2003') return response.status(404).json({ error: 'Student account not found' });
		return next(error);
	}
}