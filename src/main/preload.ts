import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title: string) => ipcRenderer.send('update-title', title),
  notify: (message: string) => ipcRenderer.send('notify', message),
  saveFile: (data: string) => ipcRenderer.send('save-file', data),
  loadFile: async () => ipcRenderer.invoke('load-file'),
});
