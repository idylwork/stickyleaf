import React from 'react';
import './ConsoleTab.scss'

type Props<T> = {
  selection: T;
  items: T[];
  onChange: (newSelection: T) => void;
}

/**
 * コンソール
 * @param props.selection - 選択中のアイテム
 * @param props.items - 選択できるアイテム
 * @param props.onChange - 選択が変更されたときの処理
 * @returns
 */
export const ConsoleTab = <T,>({ selection, items, onChange }: React.PropsWithChildren<Props<T>>) => {
  const handleTabChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChange(items[Number(event.currentTarget.value)]);
  }

  return (
    <div className="ConsoleTab">
      {items.map((item, index) => (
        <button type="button" className={`ConsoleTab-item ${item === selection ? 'ConsoleTab-selected' : ''}`} key={index} value={index} onClick={handleTabChange}>
          {item}
        </button>
      ))}
    </div>
  )
};
