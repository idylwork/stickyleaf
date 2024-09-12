import React, { useRef, useState } from 'react';
import './ConsoleTab.scss'
import { TAB_MAX_COUNT } from '../constants';

type Props = {
  selection: string;
  tabs: string[];
  onSelect: (target: string | undefined) => void;
  onRename: (target: string, tag: string) => void;
  onDelete: (target: string) => void;
}

/**
 * コンソール
 * @param props.selection - 選択中のアイテム
 * @param props.items - 選択できるアイテム
 * @param props.onSelect - 選択が変更されたときの処理
 * @returns
 */
export const ConsoleTab = ({ selection, tabs, onSelect, onRename, onDelete }: React.PropsWithChildren<Props>) => {
  /**
   * タブ変更時の動作
   */
  const handleTabChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = event.currentTarget.value;
    const nextTab = index !== '' ? tabs[Number(index)] : undefined;
    if (nextTab !== selection) {
      onSelect(nextTab);
    }
  }

  return (
    <div className="ConsoleTab">
      <div className="ConsoleTab-area">
        {tabs.map((tab) => (
          <ConsoleTabItem tab={tab} onSelect={onSelect} onRename={onRename} onDelete={onDelete} selected={selection === tab} key={tab} />
        ))}
      </div>
      <button type="button" className="ConsoleTab-button ConsoleTab-append" onClick={handleTabChange} disabled={tabs.length >= TAB_MAX_COUNT}>
        +
      </button>
    </div>
  )
};

type ItemProps = {
  tab: string;
  selected: boolean;
  onSelect: (newSelection: string | undefined) => void;
  onRename: (target: string, tag: string) => void;
  onDelete: (target: string) => void;
}

const ConsoleTabItem = ({ tab, selected, onSelect, onRename, onDelete }: ItemProps) => {
  const [isRenameEnabled, setIsRenameEnable] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 名称変更開始
   * @returns
   */
  const startRename = () => {
    if (!selected) return;
    setName(tab);
    setIsRenameEnable(true);
    requestAnimationFrame(() => {
      inputRef.current?.select()
    });
  }

  /**
   * 名称入力時の動作
   * @param event
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  }

  /**
   * 名称確定時の処理
   * @param event
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (tab !== name) {
      onRename(tab, name);
    }
    setIsRenameEnable(false);
  }

  /**
   * 削除ボタンタップ時の動作
   * @param event
   */
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(tab);
  }

  return selected ? (
    <div className={`ConsoleTab-button ConsoleTab-item ${selected ? 'ConsoleTab-selected' : ''}`} onClick={() => onSelect(tab)}>
      {isRenameEnabled ? (
        <form className="ConsoleTab-button-inner" onSubmit={handleSubmit}>
          <input ref={inputRef} type="text" className="ConsoleTab-input" value={name} maxLength={30} onChange={handleChange} onBlur={handleSubmit} />
          <div className="ConsoleTab-delete" onClick={handleDelete}>
            <div className="ConsoleTab-delete-icon">&times;</div>
          </div>
        </form>
      ) : (
        <div className="ConsoleTab-button-inner">
          <span className="ConsoleTab-text" onClick={startRename}>{tab}</span>
          <div className="ConsoleTab-delete" onClick={handleDelete}>
            <div className="ConsoleTab-delete-icon">&times;</div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <button type="button" className="ConsoleTab-button ConsoleTab-item ConsoleTab-unselected" onClick={() => onSelect(tab)}>
      {tab}
    </button>
  )
}
