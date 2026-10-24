import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.API_PORT || 4000);
const host = process.env.API_HOST || '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error('API_PORT must be an integer between 1 and 65535');
}

const server = app.listen(port, host, () => {
	console.log(`API server listening at http://${host}:${port}`);
});

server.on('error', (error) => {
	console.error('Failed to start API server:', error.message);
	process.exitCode = 1;
});

function shutdown() {
	server.close((error) => {
		if (error) {
			console.error('Error while closing API server:', error.message);
			process.exitCode = 1;
		}
	});
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
