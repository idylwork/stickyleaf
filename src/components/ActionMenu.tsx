import React, { useState } from 'react';
import './ActionMenu.scss';
import { MenuButton } from './MenuButton';

type Props = {
  actions: { [key: string]: (() => void) | null }
};

/**
 * 処理を実行するメニュー
 * @param param0
 * @returns
 */
export const ActionMenu: React.FC<Props> = ({ actions }) => {
  /** 表示中か */
  const [isPresented, setIsPresented] = useState(false);

  /**
   * 表示切り替え時の処理
   * @param newIsPresented
   */
  const handleToggle = (newIsPresented: boolean) => {
    setIsPresented(newIsPresented);
  };

  return (
    <MenuButton label="Menu" isPresented={isPresented} onToggle={handleToggle}>
      <ul className="ActionMenu-list">
        {Object.entries(actions).map(([label, action]) => (action
          ? <li className="ActionMenu-item" key={label} onClick={() => { action(); setIsPresented(false); }}>{label}</li>
          : <li className="ActionMenu-item ActionMenu-disabled" key={label}>{label}</li>
        ))}
      </ul>
    </MenuButton>
  );
};
