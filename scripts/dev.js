import { spawn } from 'node:child_process';

const viteUrl = 'http://127.0.0.1:5173';
const apiHealthUrl = 'http://127.0.0.1:4000/api/health';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const managedProcesses = [];
let stopping = false;

function startNpmScript(scriptName) {
	const child = spawn(npmCommand, ['run', scriptName], {
		stdio: 'inherit',
		windowsHide: true,
	});
	managedProcesses.push(child);
	child.once('error', (error) => {
		console.error(`Could not start ${scriptName}:`, error.message);
		process.exitCode = 1;
		shutdown();
	});
	return child;
}

async function isHealthy(url, checkVite = false) {
	try {
		const response = await fetch(checkVite ? `${url}/@vite/client` : url, { signal: AbortSignal.timeout(1500) });
		if (!response.ok) return false;
		if (!checkVite) {
			const body = await response.json();
			return body.status === 'ok';
		}
		return true;
	} catch {
		return false;
	}
}

async function waitFor(url, checkVite = false, child) {
	const deadline = Date.now() + 30000;
	while (Date.now() < deadline) {
		if (await isHealthy(url, checkVite)) return;
		if (child?.exitCode !== null && child?.exitCode !== undefined) {
			throw new Error(`Development server exited with code ${child.exitCode}`);
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
	if (await isHealthy(viteUrl, true)) console.log('Reusing Vite at 127.0.0.1:5173');
	else {
		console.log('Starting Vite...');
		await waitFor(viteUrl, true, startNpmScript('dev:web'));
	}

	if (await isHealthy(apiHealthUrl)) console.log('Reusing API at 127.0.0.1:4000');
	else {
		console.log('Starting API...');
		await waitFor(apiHealthUrl, false, startNpmScript('dev:api'));
	}

	if (stopping) return;
	const desktop = startNpmScript('dev:desktop');
	desktop.once('exit', (code) => {
		if (!stopping) {
			process.exitCode = code || 0;
			shutdown();
		}
	});
}

function shutdown() {
	if (stopping) return;
	stopping = true;
	for (const child of managedProcesses) {
		if (child.exitCode === null) child.kill('SIGTERM');
	}
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
	shutdown();
});