import React, { useState } from 'react';
import { MenuButton } from './MenuButton';
import './ThemeMenu.scss';
import { useAtom } from 'jotai';
import { Theme, themeAtom, themesAtom } from '../atoms';
import { THEME_MAX_COUNT } from '../constants';

/**
 * テーマに関するメニュー
 * @returns
 */
export const ThemeMenu: React.FC = () => {
  /** 表示中のテーマ */
  const [theme, setTheme] = useAtom(themeAtom);
  /** 保存されたテーマリスト */
  const [themes, setThemes] = useAtom(themesAtom);
  /** 表示中か */
  const [isPresented, setIsPresented] = useState(false);

  /**
   * 表示切り替え時の処理
   * @param newIsPresented
   */
  const handleToggle = (newIsPresented: boolean) => {
    setIsPresented(newIsPresented);
  };

  /**
   * 透明度変更時の動作
   * @param event
   */
  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number(event.currentTarget.value);
    setTheme({ ...theme, opacity: newOpacity });
    window.electronAPI.setOpacity(newOpacity);
  };

  /**
   * テーマを追加保存する
   */
  const handleAppendTheme = () => {
    if (themes.some((target) => (Object.keys(target) as (keyof Theme)[]).every((prop) => target[prop] === theme[prop]))) {
      return
    }
    setThemes([...themes, theme]);
  };

  /**
   * テーマを削除する
   * @param index
   */
  const deleteTheme = (index: number) => {
    const newThemes = [...themes];
    newThemes.splice(index, 1)
    setThemes(newThemes);
  };

  return (
    <MenuButton label="Theme" isPresented={isPresented} onToggle={handleToggle} className="ThemeMenu">
      <ul className="ActionMenu-list">
        <li className="ActionMenu-item">
          <input type="range" className="ThemeMenu-input" min="0.8" max="1" step="0.01" value={theme.opacity} onChange={handleOpacityChange} />
        </li>
        {themes.map((theme, index) => (
          <li className="ActionMenu-item ThemeMenu-item" key={index}>
            <div className="ThemeMenu-theme" onClick={() => setTheme(theme)}>
              <div className="ThemeMenu-color" style={{ backgroundImage: `linear-gradient(90deg, ${theme.topColor}, ${theme.bottomColor} ${theme.gradientPercentage}%)` }}>
                <div className="ThemeMenu-item-texture" style={{ opacity: theme.textureRatio }} />
              </div>
            </div>
            <button type="button" className="ThemeMenu-delete" onClick={() => deleteTheme(index)}>&times;</button>
          </li>
        ))}
        {themes.length < THEME_MAX_COUNT && (
          <li className="ActionMenu-item" onClick={handleAppendTheme}>
            テーマを保存する
          </li>
        )}
      </ul>
    </MenuButton>
  );
};
