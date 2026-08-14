import React, { useMemo } from 'react';
import './App.scss';

import { useAtomValue } from 'jotai';
import { themeAtom } from '../atoms';
import { MarkDownProvider } from '../hooks/useMarkDown';
import { Console } from './Console';
import { Preview } from './Preview';

export const App = () => {
  const theme = useAtomValue(themeAtom)
  /** ランダムな背景色 */
  const background = useMemo(() => `linear-gradient(${theme.topColor}, ${theme.bottomColor} ${theme.gradientPercentage}%)`, [theme]);
  /** テクスチャ画像の透明度 */
  const textureOpacity: number = useMemo(() => theme.textureRatio, [theme]);

  return (
    <MarkDownProvider>
      <main className="App window-draggable" style={{ backgroundImage: background }}>
        <div className="App-texture" style={{ opacity: textureOpacity }} />
        <Preview />
        <Console />
      </main>
    </MarkDownProvider>
  );
};
