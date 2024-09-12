export interface IElectronAPI {
  setOpacity: (opacity: number) => void;
  notify: (message: string) => void;
  saveFile: (data: string) => void;
  loadFile: () => { ok: true; data: string; } |  { ok: false; data: null; };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
