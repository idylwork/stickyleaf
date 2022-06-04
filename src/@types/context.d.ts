export interface IElectronAPI {
  update: (title: string) => void;
  notify: (message: string) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
