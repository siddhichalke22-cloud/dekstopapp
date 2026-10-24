import { app, ipcMain } from 'electron';

export function registerIpcHandlers(getWindow) {
	const getTrustedWindow = (event) => {
		const window = getWindow();
		return window && !window.isDestroyed() && event.sender === window.webContents ? window : null;
	};

	ipcMain.handle('app:get-info', (event) => {
		if (!getTrustedWindow(event)) return null;

		return {
			name: app.getName(),
			version: app.getVersion(),
			platform: process.platform,
		};
	});

	ipcMain.handle('window:minimize', (event) => {
		const window = getTrustedWindow(event);
		if (!window) return false;
		window.minimize();
		return true;
	});

	ipcMain.handle('window:toggle-maximize', (event) => {
		const window = getTrustedWindow(event);
		if (!window) return false;

		if (window.isMaximized()) window.unmaximize();
		else window.maximize();

		return window.isMaximized();
	});

	ipcMain.handle('window:close', (event) => {
		const window = getTrustedWindow(event);
		if (!window) return false;
		window.close();
		return true;
	});
}
