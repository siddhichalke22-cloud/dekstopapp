import prisma from '../services/prisma.js';

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

export async function listSkillOffers(_request, response, next) {
	try {
		const offers = await prisma.skillOffer.findMany({
			where: { status: 'OPEN' },
			include: {
				user: { select: { id: true, name: true, initials: true, university: true, major: true } },
				teachingSkill: true,
				wantedSkill: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return response.json(offers);
	} catch (error) {
		return next(error);
	}
}

export async function createSkillOffer(request, response, next) {
	const { teaches, wants, detail = '', mode = 'Flexible' } = request.body || {};
	if (![teaches, wants].every((value) => typeof value === 'string' && value.trim())) {
		return response.status(400).json({ error: 'Both the skill you teach and the skill you want to learn are required' });
	}
	if (typeof detail !== 'string' || detail.length > 1000 || typeof mode !== 'string' || mode.length > 80) {
		return response.status(400).json({ error: 'Offer details are invalid or too long' });
	}

	try {
		const offer = await prisma.$transaction(async (transaction) => {
			const teachingSkill = await transaction.skill.upsert({ where: { name: teaches.trim() }, update: {}, create: { name: teaches.trim() } });
			const wantedSkill = await transaction.skill.upsert({ where: { name: wants.trim() }, update: {}, create: { name: wants.trim() } });
			return transaction.skillOffer.create({
				data: {
					userId: request.user.id,
					teachingSkillId: teachingSkill.id,
					wantedSkillId: wantedSkill.id,
					detail: detail.trim(),
					mode: mode.trim(),
				},
				include: { user: { select: { id: true, name: true, initials: true, university: true, major: true } }, teachingSkill: true, wantedSkill: true },
			});
		});
		return response.status(201).json(offer);
	} catch (error) {
		return next(error);
	}
}

export async function requestSkillExchange(request, response, next) {
	const { offerId, message = '' } = request.body || {};
	if (typeof offerId !== 'string' || !offerId.trim()) return response.status(400).json({ error: 'Skill offer id is required' });
	if (typeof message !== 'string' || message.length > 1000) return response.status(400).json({ error: 'Message must be under 1000 characters' });

	try {
		const offer = await prisma.skillOffer.findUnique({ where: { id: offerId }, include: { user: true } });
		if (!offer || offer.status !== 'OPEN') return response.status(404).json({ error: 'Skill offer is no longer available' });
		if (offer.userId === request.user.id) return response.status(400).json({ error: 'You cannot request your own offer' });
		const exchange = await prisma.skillExchange.create({
			data: {
				providerId: offer.userId,
				requesterId: request.user.id,
				offeredSkillId: offer.teachingSkillId,
				wantedSkillId: offer.wantedSkillId,
				message: message.trim(),
				status: 'PENDING',
			},
			include: { provider: { select: { id: true, name: true } }, offeredSkill: true, wantedSkill: true },
		});
		return response.status(201).json(exchange);
	} catch (error) {
		return next(error);
	}
}

export async function createSkillExchange(request, response, next) {
	const { providerId, offeredSkill, wantedSkill, message = '' } = request.body || {};
	const requesterId = request.user.id;
	if (![providerId, offeredSkill, wantedSkill].every((value) => typeof value === 'string' && value.trim())) {
		return response.status(400).json({ error: 'providerId, offeredSkill, and wantedSkill are required' });
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