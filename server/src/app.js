import cors from 'cors';
import express from 'express';
import profileRouter from './routes/profile.js';
import projectsRouter from './routes/projects.js';
import teamsRouter from './routes/teams.js';
import skillsRouter from './routes/skills.js';

const app = express();
const allowedOrigins = new Set([
	'http://127.0.0.1:5173',
	'http://localhost:5173',
	'null',
]);

app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.has(origin)) return callback(null, true);
		return callback(new Error('Origin is not allowed by CORS'));
	},
}));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok' });
});

app.use('/api/projects', projectsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/skills', skillsRouter);

app.use((_request, response) => {
	response.status(404).json({ error: 'Route not found' });
});

app.use((error, _request, response, _next) => {
	console.error(error);
	response.status(500).json({ error: 'Internal server error' });
});

export default app;
