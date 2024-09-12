import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './MenuButton.scss';

type Props = {
  label: string;
  className?: string;
  isPresented?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
};

/**
 * メニューを開くボタン
 * @param param0
 * @returns
 */
export const MenuButton: React.FC<Props> = ({ label, className = '', isPresented, onToggle, children }) => {
  /* 操作メニューを表示するか */
  const [isContentsPresented, setIsContentsPresented] = useState(false);
  /** メニューのDOM要素参照 */
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * 操作メニューを開閉する
   */
  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsContentsPresented(!isContentsPresented);
  };

  useEffect(() => {
    onToggle && onToggle(isContentsPresented);

    // 閉じた時はなにもしない
    if (!isContentsPresented) return

    /**
     * メニュー以外の場所をクリックしたらメニューを閉じる
     * @param event
     */
    const handleDocumentClick = (event: MouseEvent) => {
      if (contentRef.current && event.target && contentRef.current.contains(event.target as Node)) return;
      setIsContentsPresented(false);
    }

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isContentsPresented]);

  // isPresentedが変更された時に伝搬する
  useEffect(() => {
    if (isPresented === undefined) return;
    setIsContentsPresented(isPresented);
  }, [isPresented])

  return (
    <div className={`MenuButton ${className}`}>
      <button type="button" className="MenuButton-button" onClick={handleButtonClick}>{label}</button>
      <CSSTransition in={isContentsPresented} timeout={100} nodeRef={contentRef} unmountOnExit classNames="MenuButton-content">
        <div ref={contentRef} className="MenuButton-content">
          {children}
        </div>
      </CSSTransition>
    </div>
  );
};
