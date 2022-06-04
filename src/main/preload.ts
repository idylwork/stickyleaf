import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  update: (title: string) => ipcRenderer.send('update-title', title),
  notify: (message: string) => ipcRenderer.send('notify', message),
});
