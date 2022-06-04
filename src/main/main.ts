import path from 'path';
import { BrowserWindow, app, ipcMain, Notification } from 'electron';

if (process.env.NODE_ENV === 'development') {
  const execPath =
    process.platform === 'win32'
      ? '../node_modules/electron/dist/electron.exe'
      : '../node_modules/.bin/electron';

  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, execPath),
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    fullscreen: false,
    alwaysOnTop: process.env.NODE_ENV !== 'development',
    opacity: 0.9,
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  ipcMain.on('update-title', (_e, title) => {
    mainWindow.setTitle(`Persimmon − ${title}`);
  });

  ipcMain.on('notify', (_e, message) => {
    new Notification({ body: message, silent: true }).show()
  });

  mainWindow.loadFile('dist/index.html');
};

app.whenReady().then(createWindow);
app.once('window-all-closed', () => app.quit());
