import React, { useEffect, useMemo, useState } from 'react';
import './App.scss';

import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../atoms';
import { MarkDownProvider } from '../hooks/useMarkDown';
import { classList } from '../libs/String';
import { Console } from './Console';
import { Preview } from './Preview';

export const App = () => {
  const theme = useAtomValue(themeAtom)
  const [isActive, setIsActive] = useState(true);
  /** ランダムな背景色 */
  const background = useMemo(() => `linear-gradient(${theme.topColor}, ${theme.bottomColor} ${theme.gradientPercentage}%)`, [theme]);
  /** テクスチャ画像の透明度 */
  const textureOpacity: number = useMemo(() => theme.textureRatio, [theme]);

  useEffect(() => {
    const unlisten = getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      setIsActive(focused);
    });
    return () => {
      void unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <MarkDownProvider>
      <main className={classList('App', 'window-draggable', !isActive && 'is-inactive')} style={{ backgroundImage: background }}>
        <div className="App-texture" style={{ opacity: textureOpacity }} />
        <Preview />
        <Console />
      </main>
    </MarkDownProvider>
  );
};
