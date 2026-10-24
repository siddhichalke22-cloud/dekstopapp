import { app, ipcMain } from 'electron';

export function registerIpcHandlers(window) {
	const isTrustedWindow = (event) => event.sender === window.webContents;

	ipcMain.handle('app:get-info', (event) => {
		if (!isTrustedWindow(event)) return null;

		return {
			name: app.getName(),
			version: app.getVersion(),
			platform: process.platform,
		};
	});

	ipcMain.handle('window:minimize', (event) => {
		if (!isTrustedWindow(event) || window.isDestroyed()) return false;
		window.minimize();
		return true;
	});

	ipcMain.handle('window:toggle-maximize', (event) => {
		if (!isTrustedWindow(event) || window.isDestroyed()) return false;

		if (window.isMaximized()) window.unmaximize();
		else window.maximize();

		return window.isMaximized();
	});

	ipcMain.handle('window:close', (event) => {
		if (!isTrustedWindow(event) || window.isDestroyed()) return false;
		window.close();
		return true;
	});
}
