import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import './Console.scss';
import { convert } from './rules/index';
import { setClipboard } from './modules';
import useDelayEffect from './hooks/useDelayEffect';
import useMarkDown from './hooks/useMarkDown';
import { ActionMenu } from './ActionMenu';
import { TextArea } from './TextArea';
import { updatedPlaceholders } from './libs/String';
const { electronAPI } = window;

/**
 * タブ名リスト
 */
const TAB_NAME: string[] = [
  'general',
  'release',
  'temp',
];

const HEADING_RATE = [2, 4, 5];

export const Console: React.FC = () => {
  /** マークダウン関連の状態管理 */
  const { origin, placeHolders, updateMarkDown } = useMarkDown();
  /* 選択中のルール */
  const [selectedRule, setSelectedRule] = useState<string>('backlog');
  /* 選択中のタブ */
  const [selectedTab, setSelectedTab] = useState<string>(TAB_NAME[0]);
  /* テンプレート構文やプレースホルダを利用するか */
  const [isTemplateEnable, setIsTemplateEnable] = useState<boolean>(false);
  /* ステートを初期化済みか */
  const isInitializedRef = useRef<boolean>(false);
  /* タブ別のテキストリスト */
  const originsRef = useRef<Map<string, string>>(new Map());

  /**
   * 全タブの文章を更新してローカルストレージへ保存
   */
  const updateOrigins = () => {
    const newOrigins = new Map(originsRef.current);
    newOrigins.set(selectedTab, origin);
    originsRef.current = newOrigins;
    localStorage.setItem('origins', JSON.stringify([...newOrigins]));
  };

  // 初期化時にローカルストレージからステートを読み出す
  useLayoutEffect(() => {
    try {
      const newOrigins = new Map<string, string>(JSON.parse(localStorage.getItem('origins') ?? '[]'));
      originsRef.current = newOrigins;
      updateMarkDown({ origin: newOrigins.get(selectedTab) ?? '' })
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
  }, []);

  // 本文更新後に遅延してローカルストレージへ保存
  useDelayEffect(() => {
    if (isInitializedRef.current) {
      updateOrigins();
    }
  }, [origin]);

  /**
   * 文章入力時
   * @param newOrigin 新しい本文
   */
  const handleOriginChange = (newOrigin: string) => {
    if (isTemplateEnable) {
      // プレースホルダの検知
      updateMarkDown({ origin: newOrigin, placeHolders: updatedPlaceholders(placeHolders, newOrigin) })
    } else {
      updateMarkDown({ origin: newOrigin })
    }
  };

  /**
   * タブ変更時
   * @param event
   */
  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateOrigins();
    const newSelectedTab = event.currentTarget.value;
    setSelectedTab(newSelectedTab);
    updateMarkDown({ origin: originsRef.current.get(newSelectedTab) ?? '' })

    // アプリケーションタイトルの更新
    electronAPI.setTitle(newSelectedTab);
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

  const actions = useMemo(() => ({
    'Backlog書式でコピー': () => {
      const options = { headingRate: HEADING_RATE, placeHolders };
      const text = convert(origin, 'backlog', options).replace(/<br>/g, '\n');
      if (text) {
        setClipboard(text);
        electronAPI.notify(`コピーしました (${text.replace(/\s+/g, ' ').replace(/\s+$/g, '')})`);
      }
    },
    'Backlog書式から変換': null,
    [isTemplateEnable ? 'テンプレート構文を使用しない' : 'テンプレート構文を使用する']: () => {
      setIsTemplateEnable(!isTemplateEnable);
      updateMarkDown({ placeHolders: updatedPlaceholders(null, origin) });
    },
    '重複行検索': () => {
      let duplicated = origin.split('\n').filter(function (row, i, self) {
        return row !== '' && self.indexOf(row) === i && i !== self.lastIndexOf(row);
      });
      if (duplicated.length) {
        electronAPI.notify(`重複する行がありました\n${duplicated.join('\n')}`);
      } else {
        electronAPI.notify('重複する行はありません');
      }
    },
    'ファイルに保存': () => {
      electronAPI.saveFile(origin);
      console.log(electronAPI.saveFile);
    },
    'ファイルから復元する': async () => {
      const { ok, data } = await electronAPI.loadFile();
      if (ok && confirm('入力中の文章は上書きされます')) {
        handleOriginChange(data);
      }
    },
  }), [origin, isTemplateEnable]);

  return (
    <section className="Console window-undraggable">
      <div className="Console-surface">
        <ActionMenu actions={actions} />
        {isTemplateEnable && [...placeHolders].map(([placeName, value]) => (
          <label className="Console-placeholder" key={placeName}>
            <div className="Console-placeholder-label">{placeName}</div>
            <input
              type="text"
              className="browser-default"
              value={value}
              data-place-name={placeName}
              onChange={handlePlaceholderChange}
            />
          </label>
        ))}
        <TextArea value={origin} onChange={handleOriginChange} />
        <div className="Console-radio-inline">
          {TAB_NAME.map((tabName) => (
            <label className="Console-tab" key={tabName}>
              <input type="radio" name="tab" value={tabName} checked={tabName === selectedTab} onChange={handleTabChange} />
              <span className="Console-tab-label">{tabName}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
};
