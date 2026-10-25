import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'dist/backend');

await mkdir(outputDirectory, { recursive: true });
await build({
	entryPoints: [path.join(root, 'server/src/server.js')],
	outfile: path.join(outputDirectory, 'server.cjs'),
	bundle: true,
	platform: 'node',
	format: 'cjs',
	target: 'node20',
	packages: 'bundle',
	external: ['pg-native'],
	define: {
		'import.meta.url': JSON.stringify(pathToFileURL(path.join(outputDirectory, 'server.cjs')).href),
	},
	sourcemap: false,
});

console.log('Bundled API server to dist/backend/server.cjs');