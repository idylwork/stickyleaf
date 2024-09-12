import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity: number) => ipcRenderer.send('update-opacity', opacity),
  notify: (message: string) => ipcRenderer.send('notify', message),
  saveFile: (data: string) => ipcRenderer.send('save-file', data),
  loadFile: async () => ipcRenderer.invoke('load-file'),
});
