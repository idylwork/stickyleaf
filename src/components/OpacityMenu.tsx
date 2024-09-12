import React, { useState } from 'react';
import { MenuButton } from './MenuButton';
import './OpacityMenu.scss';

type Props = {
};

/**
 * 処理を実行するメニュー
 * @param param0
 * @returns
 */
export const OpacityMenu: React.FC<Props> = () => {
  const [opacity, setOpacity] = useState(0.9);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number(event.currentTarget.value);
    setOpacity(newOpacity);
    window.electronAPI.setOpacity(newOpacity);
  }

  return (
    <MenuButton className="OpacityMenu" label="Opacity">
      <input type="range" className="OpacityMenu-input" min="0.8" max="1" step="0.01" value={opacity} onChange={handleChange} />
    </MenuButton>
  );
};
