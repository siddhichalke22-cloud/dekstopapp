import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-this-secret-before-deploying';

export function signUserToken(user) {
	return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(request, response, next) {
	const authorization = request.get('authorization') || '';
	const [scheme, token] = authorization.split(' ');
	if (scheme !== 'Bearer' || !token) return response.status(401).json({ error: 'Sign in to continue' });

	try {
		const payload = jwt.verify(token, JWT_SECRET);
		request.user = { id: payload.sub };
		return next();
	} catch {
		return response.status(401).json({ error: 'Your session is invalid or has expired' });
	}
}