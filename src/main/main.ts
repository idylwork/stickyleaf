import fs from 'fs';
import path from 'path';
import { BrowserWindow, app, ipcMain, Notification, dialog } from 'electron';

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

  ipcMain.on('save-file', async (_e, data) => {
    // 場所とファイル名を選択
    const path = dialog.showSaveDialogSync(mainWindow, {
      buttonLabel: '保存',
      filters: [
        { name: 'Text', extensions: ['md', 'txt', 'text'] },
      ],
      properties:[
        'createDirectory', // MacOSでディレクトリの作成を許可
      ]
    });
    // キャンセルで閉じた場合
    if (path === undefined) return;

    // ファイルの内容を返却
    try {
      fs.writeFileSync(path, data);
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('load-file', async (_e) => {
    // ファイルを選択
    const paths = dialog.showOpenDialogSync({
      filters: [
        { name: 'Text', extensions: ['md', 'txt', 'text'] }
      ]
    });
    // キャンセルで閉じた場合
    if (paths === undefined) {
      return { ok: false, data: null };
    }

    try {
      const data = paths.map((path) => fs.readFileSync(path, { encoding: 'utf8' })).join('\n');
      return { ok: true, data: data };
    } catch (error) {
      return { ok: false, data: null, message: error instanceof Error ? error.message : 'Unknown Error' };
    }
  });

  mainWindow.loadFile('dist/index.html');
};

app.whenReady().then(createWindow);
app.once('window-all-closed', () => app.quit());
