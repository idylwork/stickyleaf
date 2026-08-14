import { useAtom, useAtomValue } from 'jotai';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { isTemplateEnabledAtom } from '../atoms';
import { BACKLOG_HEADING_RATE, NEW_TAB_PREFIX, STORAGE_DELIMITER, STORAGE_PREFIX } from '../constants';
import useDelayEffect from '../hooks/useDelayEffect';
import useMarkDown from '../hooks/useMarkDown';
import { updatedPlaceholders } from '../libs/String';
import { setClipboard } from '../modules';
import { RuleType, convert } from '../rules/index';
import { ActionMenu } from './ActionMenu';
import './Console.scss';
import { ConsoleTab } from './ConsoleTab';
import { TextArea } from './TextArea';
import { ThemeMenu } from './ThemeMenu';
const { electronAPI } = window;

export const Console = () => {
  /** マークダウン関連の状態管理 */
  const { origin, placeHolders, updateMarkDown } = useMarkDown();
  /** タブ名リスト */
  const [tabs, setTabs] = useState<string[]>([]);
  /** 選択中のタブ (初期化中はundefined) */
  const [selectedTab, setSelectedTab] = useState<string | undefined>(undefined);
  /** テンプレート構文やプレースホルダを利用するか */
  const isTemplateEnabled = useAtomValue(isTemplateEnabledAtom);

  /**
   * ローカルストレージから文章を読み込み
   * @param tab
   */
  const loadStorage = (tab: string) => {
    updateOrigin(localStorage.getItem(`${STORAGE_PREFIX}${tab}`) ?? '');
  };

  /**
   * ローカルストレージに文章を保存
   * @param tab
   * @param value - ファイル内容 (undefinedで削除)
   */
  const saveStorage = (tab: string, value: string | undefined) => {
    if (value !== undefined) {
      localStorage.setItem(`${STORAGE_PREFIX}${tab}`, value);
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}${tab}`);
    }
    localStorage.setItem('sort', tabs.join(STORAGE_DELIMITER))
  };

  // 初期化時にローカルストレージからステートを読み出す
  useLayoutEffect(() => {
    const data: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(STORAGE_PREFIX)) {
        const dataKey = storageKey.substring(STORAGE_PREFIX.length);
        data.push(dataKey);
      }
    }
    if (!data.length) {
      data.push(`${NEW_TAB_PREFIX}1`)
    }

    // 並べ替える
    const sort = (localStorage.getItem('sort') ?? '').split(STORAGE_DELIMITER);
    const newTabs = data.sort((a, b) => sort.indexOf(a) - sort.indexOf(a))

    const initialTab = newTabs[0];
    setSelectedTab(initialTab)
    setTabs(newTabs);

    loadStorage(initialTab);
  }, []);

  // 本文更新後に遅延してローカルストレージへ保存
  useDelayEffect(() => {
    if (selectedTab) {
      saveStorage(selectedTab, origin);
    }
  }, [origin]);

  /**
   * 本文更新時の動作
   * @param newOrigin - 新しい本文
   */
  const updateOrigin = (newOrigin: string) => {
    if (isTemplateEnabled) {
      // プレースホルダの検知
      updateMarkDown({ origin: newOrigin, placeHolders: updatedPlaceholders(placeHolders, newOrigin) })
    } else {
      updateMarkDown({ origin: newOrigin })
    }
  };

  /**
   * タブ変更時
   * @param target - 次のタブ
   * @param needsSave - 選択中のタブを保存するか (削除時は保存しない)
   */
  const selectTab = (target: string | undefined, needsSave = true) => {
    if (!selectedTab) return;

    // 削除時以外は遷移前に内容をストレージ保存
    if (needsSave) {
      saveStorage(selectedTab, origin);
    }

    if (target) {
      // タブの切り替え
      loadStorage(target);
      setSelectedTab(target);
    } else {
      // タブの追加
      let maxTabNo = 0;
      tabs.forEach((tab) => {
        if (tab.startsWith(NEW_TAB_PREFIX)) {
          const tabNo = (Number(tab.substring(NEW_TAB_PREFIX.length)) || 0);
          if (tabNo > maxTabNo) {
            maxTabNo = tabNo;
          }
        }
      });

      const newTab = `${NEW_TAB_PREFIX}${maxTabNo + 1}`;
      saveStorage(newTab, '');
      setTabs([...tabs, newTab]);
      setSelectedTab(newTab);
      updateMarkDown({ origin: '' })
    }
  };

  /**
   * タブを名称変更する
   * @param target
   */
  const renameTab = (target: string, name: string) => {
    const newName = name.replaceAll(STORAGE_DELIMITER, ' ')
    setTabs(tabs.map((tab) => tab === target ? newName : tab));
    saveStorage(newName, origin);
    saveStorage(target, undefined);
    setSelectedTab(newName);
  };

  /**
   * タブを削除する
   * @param target
   */
  const deleteTab = (target: string) => {
    let targetIndex = 0;
    const newTabs = tabs.filter((tab, index) => {
      if (tab !== target) return true;

      targetIndex = index;
      return false;
    });
    if (!newTabs.length) {
      newTabs.push(`${NEW_TAB_PREFIX}1`);
    }

    setTabs(newTabs);
    saveStorage(target, undefined);

    requestAnimationFrame(() => {
      selectTab(newTabs[targetIndex] ?? newTabs[targetIndex - 1], false)
    });
  };

  /**
   * プレイスホルダ入力変更時
   * @param event
   */
  const handlePlaceholderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentTarget = event.currentTarget as HTMLInputElement;
    const newPlaceHolders = new Map(placeHolders);
    newPlaceHolders.set(currentTarget.dataset.placeName ?? '', currentTarget.value);
    updateMarkDown({ placeHolders: newPlaceHolders });
  };

  return (
    <section className="Console window-undraggable">
      <div className="Console-surface">
        <div className="Console-menu">
          <ThemeMenu />
          <ConsoleActionMenu />
        </div>
        {isTemplateEnabled && [...placeHolders].map(([placeName, value]) => (
          <label className="Console-placeholder" key={placeName}>
            <div className="Console-placeholder-label">{placeName}</div>
            <input
              type="text"
              value={value}
              data-place-name={placeName}
              onChange={handlePlaceholderChange}
            />
          </label>
        ))}
        <TextArea value={origin} onChange={updateOrigin} />
        {selectedTab && <ConsoleTab selection={selectedTab} tabs={tabs} onSelect={selectTab} onRename={renameTab} onDelete={deleteTab} />}
      </div>
    </section>
  );
};

const ConsoleActionMenu = () => {
  /** テンプレート構文やプレースホルダを利用するか */
  const [isTemplateEnabled, setIsTemplateEnabled] = useAtom(isTemplateEnabledAtom);
  /** マークダウン関連の状態管理 */
  const { origin, placeHolders, updateMarkDown } = useMarkDown();

  /**
   * 本文更新時の動作
   * @param newOrigin - 新しい本文
   */
  const updateOrigin = (newOrigin: string) => {
    if (isTemplateEnabled) {
      // プレースホルダの検知
      updateMarkDown({ origin: newOrigin, placeHolders: updatedPlaceholders(placeHolders, newOrigin) })
    } else {
      updateMarkDown({ origin: newOrigin })
    }
  };

  /**
   * メニューのアクション定義
   */
  const actions = useMemo(() => ({
    'Markdown書式でコピー': () => {
      const options = { headingRate: BACKLOG_HEADING_RATE, placeHolders };
      const text = convert(origin, RuleType.None, options);
      if (text) {
        setClipboard(text);
        electronAPI.notify(`コピーしました (${text.replace(/\s+/g, ' ').replace(/\s+$/g, '')})`);
      }
    },
    'Backlog記法でコピー': () => {
      const options = { headingRate: BACKLOG_HEADING_RATE, placeHolders };
      const text = convert(origin, RuleType.Backlog, options);
      if (text) {
        setClipboard(text);
        electronAPI.notify(`コピーしました (${text.replace(/\s+/g, ' ').replace(/\s+$/g, '')})`);
      }
    },
    'Backlog記法から変換': null,
    [isTemplateEnabled ? 'テンプレート構文を使用しない' : 'テンプレート構文を使用する']: () => {
      setIsTemplateEnabled(!isTemplateEnabled);
      updateMarkDown({ placeHolders: updatedPlaceholders(null, origin) });
    },
    '重複行検索': () => {
      let duplicated = origin.split('\n').filter((row, i, self) => row !== '' && self.indexOf(row) === i && i !== self.lastIndexOf(row));
      if (duplicated.length) {
        electronAPI.notify(`重複する行がありました\n${duplicated.join('\n')}`);
      } else {
        electronAPI.notify('重複する行はありません');
      }
    },
    'ファイルに保存': () => {
      electronAPI.saveFile(origin);
    },
    'ファイルから復元する': async () => {
      const { ok, data } = await electronAPI.loadFile();
      if (ok && confirm('入力中の文章は上書きされます')) {
        updateOrigin(data ?? '');
      }
    },
  }), [origin, isTemplateEnabled]);

  return (
    <ActionMenu actions={actions} />
  );
}