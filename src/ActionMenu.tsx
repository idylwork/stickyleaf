import React, { useState, useRef, useEffect } from 'react';
import './ActionMenu.scss';

type Props = {
  actions: { [key: string]: (() => void) | null }
};

/**
 * 処理を実行するメニュー
 * @param param0
 * @returns
 */
export const ActionMenu: React.FC<Props> = ({ actions }) => {
  /* 操作メニューを表示するか */
  const [isMenuPresented, setIsMenuPresented] = useState(false);
  /** メニューのDOM要素参照 */
  const menuRef = useRef<HTMLUListElement>(null);

  /**
   * 操作メニューを開閉する
   */
  const handleButtonClick = () => {
    setIsMenuPresented(!isMenuPresented);
  };

  useEffect(() => {
    // 閉じた時はなにもしない
    if (!isMenuPresented) return

    /**
     * メニュー以外の場所をクリックしたらメニューを閉じる
     * @param event
     */
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && event.target && menuRef.current.contains(event.target as Node)) return;
      setIsMenuPresented(false);
    }

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isMenuPresented]);

  return (
    <div className="ActionMenu">
      <button type="button" className="btn btn-small transparent black-text" onClick={handleButtonClick}>Menu</button>
      {isMenuPresented && <ul className="ActionMenu-list card" ref={menuRef}>
        {Object.entries(actions).map(([label, action]) => (action
          ? <li className="ActionMenu-item" key={label} onClick={() => { action(); setIsMenuPresented(false); }}>{label}</li>
          : <li className="ActionMenu-item ActionMenu-disabled" key={label}>{label}</li>
        ))}
      </ul>}
    </div>
  );
};
