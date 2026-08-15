import { invoke } from '@tauri-apps/api/core';

export const setOpacity = (opacity: number) => {
  void invoke('update_opacity', { opacity });
};

export const notify = (message: string) => {
  void invoke('notify', { message });
};

export const saveFile = (data: string) => {
  void invoke('save_file', { data });
};

export const loadFile = () =>
  invoke<{ ok: true; data: string } | { ok: false; data: null }>('load_file');
