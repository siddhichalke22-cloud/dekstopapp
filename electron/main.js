import { app, BrowserWindow } from 'electron';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipcHandlers.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let backendProcess;

function startPackagedBackend() {
	if (process.env.VITE_DEV_SERVER_URL || backendProcess) return;

	const backendPath = app.isPackaged
		? path.join(process.resourcesPath, 'backend', 'server.cjs')
		: path.join(currentDirectory, '../dist/backend/server.cjs');
	const environmentFile = path.join(app.getPath('userData'), '.env');

	backendProcess = spawn(process.execPath, [backendPath], {
		stdio: 'ignore',
		windowsHide: true,
		env: {
			...process.env,
			ELECTRON_RUN_AS_NODE: '1',
			DOTENV_CONFIG_PATH: environmentFile,
		},
	});

	backendProcess.on('error', (error) => {
		console.error('Unable to start SkillBridge API:', error.message);
	});
	backendProcess.on('exit', (code) => {
		if (code && code !== 0) console.error(`SkillBridge API exited with code ${code}`);
		backendProcess = null;
	});
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 820,
		minWidth: 800,
		minHeight: 600,
		show: false,
		webPreferences: {
			preload: path.join(currentDirectory, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	mainWindow.once('ready-to-show', () => mainWindow?.show());
	mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
	mainWindow.webContents.on('will-navigate', (event, url) => {
		const isLocalDevUrl = process.env.VITE_DEV_SERVER_URL && url.startsWith(process.env.VITE_DEV_SERVER_URL);
		if (!url.startsWith('file://') && !isLocalDevUrl) event.preventDefault();
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(currentDirectory, '../dist/index.html'));
	}
}

app.whenReady().then(() => {
	registerIpcHandlers(() => mainWindow);
	startPackagedBackend();
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('before-quit', () => {
	if (backendProcess && !backendProcess.killed) backendProcess.kill();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
