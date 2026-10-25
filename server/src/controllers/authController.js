import bcrypt from 'bcryptjs';
import prisma from '../services/prisma.js';
import { signUserToken } from '../middleware/requireAuth.js';

const publicUserSelect = {
	id: true,
	name: true,
	email: true,
	title: true,
	initials: true,
	bio: true,
	university: true,
	major: true,
};

export async function register(request, response, next) {
	const { name, email, password, university = '', major = '' } = request.body || {};
	if (typeof name !== 'string' || !name.trim()) return response.status(400).json({ error: 'Name is required' });
	if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: 'A valid email is required' });
	if (typeof password !== 'string' || password.length < 8) return response.status(400).json({ error: 'Password must be at least 8 characters' });

	try {
		const normalizedEmail = email.trim().toLowerCase();
		const passwordHash = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: {
				name: name.trim(),
				email: normalizedEmail,
				passwordHash,
				initials: name.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join(''),
				university: typeof university === 'string' ? university.trim() : '',
				major: typeof major === 'string' ? major.trim() : '',
			},
			select: publicUserSelect,
		});
		return response.status(201).json({ token: signUserToken(user), user });
	} catch (error) {
		if (error.code === 'P2002') return response.status(409).json({ error: 'An account with this email already exists' });
		return next(error);
	}
}

export async function login(request, response, next) {
	const { email, password } = request.body || {};
	if (typeof email !== 'string' || typeof password !== 'string') {
		return response.status(400).json({ error: 'Email and password are required' });
	}

	try {
		const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			return response.status(401).json({ error: 'Email or password is incorrect' });
		}
		const { passwordHash: _passwordHash, ...publicUser } = user;
		return response.json({ token: signUserToken(user), user: publicUser });
	} catch (error) {
		return next(error);
	}
}