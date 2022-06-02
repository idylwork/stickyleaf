import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import './App.scss';

import { Preview } from './Preview';
import { Console } from './Console';
import { randomNumber } from './modules';
import { MarkDownProvider } from './hooks/useMarkDown';

const textureOpacity: number = (() => randomNumber(1, 4) * 0.1)();

export const App = () => {
  // 背景色のランダム変更
  const [backgroundImage] = useState<string>(() => {
    const colorBgStart = `hsl(${randomNumber(360)}, ${randomNumber(90, 100)}%, ${randomNumber(90, 100)}%)`;
    const colorBgEnd = `hsl(${randomNumber(360)}, ${randomNumber(80, 100)}%, ${randomNumber(30, 80)}%)`;
    document.body.style.backgroundImage = `linear-gradient(${colorBgStart}, ${colorBgEnd} ${randomNumber(50, 200)}%)`;
    return `linear-gradient(${colorBgStart}, ${colorBgEnd} ${randomNumber(50, 200)}%)`;
  });

  return (
    <MarkDownProvider>
      <main className="App window-draggable" style={{ backgroundImage: backgroundImage }}>
        <div className="App-texture" style={{ opacity: textureOpacity }} />
        <Preview />
        <Console />
      </main>
    </MarkDownProvider>
  );
};
