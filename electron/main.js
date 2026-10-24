import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipcHandlers.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;

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
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
