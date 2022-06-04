import React, { useState, useRef, useLayoutEffect } from 'react';
import './Console.scss';
import ruleMaps, { convert } from './rules/index';
import { setClipboard } from './modules';
import noUiSlider from 'nouislider';

import useDelayEffect from './hooks/useDelayEffect';
import useMarkDown from './hooks/useMarkDown';
const { electronAPI } = window;

/**
 * タブ名リスト
 */
const tabNames: string[] = [
  'general',
  'release',
  'temp',
];

// const sliderInput = document.getElementById('range');
// if (sliderInput) {
//   noUiSlider.create(sliderInput, {
//     start: [ 2, 3, 4 ], // ハンドルの初期位置を指定。数を増やせばハンドルの数も増える。
//     step: 1, // ハンドル可動最小範囲
//     margin: 1, // ハンドル間の最低距離
//     connect: false, // ハンドル間着色
//     direction: 'ltr', // どちらを始点にするか。ltr(Left To Right) or rtl(Right To Left)。
//     orientation: 'horizontal', // スライダーの方向。横向きか縦か。縦の場合は、cssでrangeのheightを適当に設定しないとつぶれてしまう。
//     behaviour: 'tap-drag', // ハンドルの動かし方。
//     range: {
//       'min': 1,
//       'max': 6
//     }, // スライダーの始点と終点
//     pips: {
//       mode: 'steps',
//       density: 100 // 小さな目盛り
//     }
//   });
// }

export const Console: React.FC = () => {
  const { origin, placeHolders, updateMarkDown } = useMarkDown();

  /* 見出しレベル */
  const [headingRate, setHeadingRate] = useState<number[]>([2, 4, 5]);
  /* 選択中のルール */
  const [selectedRule, setSelectedRule] = useState<string>('backlog');
  /* 選択中のタブ */
  const [selectedTab, setSelectedTab] = useState<string>(tabNames[0]);
  /* テンプレート構文やプレースホルダを利用するか */
  const [isTemplateEnable, setIsTemplateEnable] = useState<boolean>(false);

  /* ステートを初期化済みか */
  const isInitializedRef = useRef<boolean>(false);
  /* タブ別のテキストリスト */
  const originsRef = useRef<Map<string, string>>(new Map());

  /*
    slider: {
      min: 0,
      max: 100,
      start: 40,
      step: 1
    },
  */

  // 文章をローカルストレージへ保存
  const saveOrigins = () => {
    const newOrigins = new Map(originsRef.current);
    newOrigins.set(selectedTab, origin);
    originsRef.current = newOrigins;
    localStorage.setItem('origins', JSON.stringify([...newOrigins]));
  };

  // 初期化時にローカルストレージからステートを読み出す
  useLayoutEffect(() => {
    const newOrigins = new Map<string, string>(JSON.parse(localStorage.getItem('origins') ?? '[]'));
    originsRef.current = newOrigins;
    updateMarkDown({
      origin: newOrigins.get(selectedTab) ?? '',
    })
    setTimeout(() => {
      isInitializedRef.current = true;
    }, 100);
  }, []);

  // ローカルストレージへの保存
  useDelayEffect(() => {
    if (isInitializedRef.current) {
      saveOrigins();
    }
  }, [origin]);

  // ルール選択時
  const handleRuleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRule(event.currentTarget.value);

    // アプリケーションタイトルの更新
    electronAPI.update(selectedRule);
  };

  /**
   * 本文中からプレースホルダ構文を検出してMapオブジェクトを登録する
   * @param origin
   * @param placeHolders
   * @returns
   */
  const findPlaceHolders = (origin: string, placeHolders: Map<string, string> = new Map) => {
    const newPlaceHolders = new Map(placeHolders);
    newPlaceHolders.forEach((value, placeName) => {
      if (value === '') {
        newPlaceHolders.delete(placeName);
      }
    });

    /**
     * プレースホルダ名を取得してnewPlaceHoldersを更新
     * @param all 全文 (未使用)
     * @param placeName プレースホルダのキー名
     */
    const appendPlaceHolder = (placeName: string) => {
      if (!newPlaceHolders.has(placeName)) {
        newPlaceHolders.set(placeName, '');
      }
    };
    origin.replace(/{{ ?([a-zA-Z_-]+) ?}}/g, (all: string, placeName: string) => {
      appendPlaceHolder(placeName);
    });
    origin.replace(/@(?:if|for) ?\((?:\S+ in )([a-zA-Z_-]+)\)/g, () => {});

    return newPlaceHolders;
  };

  /**
   * 文章入力時
   * @param event
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newOrigin = event.currentTarget.value;

    // プレースホルダの検知
    if (isTemplateEnable) {
      updateMarkDown({ origin: newOrigin, placeHolders: findPlaceHolders(newOrigin, placeHolders) })
    } else {
      updateMarkDown({ origin: newOrigin })
    }
  };

  /**
   * タブ変更時
   * @param event
   */
  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    saveOrigins();
    const newSelectedTab = event.currentTarget.value;
    setSelectedTab(newSelectedTab);
    updateMarkDown({ origin: originsRef.current.get(newSelectedTab) ?? '' })
  };

  /** テンプレート構文を有効にする */
  const handleEnableTemplate = () => {
    setIsTemplateEnable(true);
    updateMarkDown({ placeHolders: findPlaceHolders(origin) });
  };

  /**
   * プレイスホルダ入力時
   * @param event
   */
  const handlePlaceholderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentTarget = event.currentTarget as HTMLInputElement;
    const newPlaceHolders = new Map(placeHolders);
    newPlaceHolders.set(currentTarget.dataset.placeName ?? '', currentTarget.value);
    updateMarkDown({ placeHolders: newPlaceHolders });
  };

  /**
   * テキストを変換してコピー
   */
  const copy = () => {
    const options = { headingRate, placeHolders };
    const text = convert(origin, selectedRule, options).replace(/<br>/g, '\n');
    if (text) {
      setClipboard(text);
      electronAPI.notify(`コピーしました (${text.replace(/\s+/g, ' ').replace(/\s+$/g, '')})`);
    }
  };

  return (
    <section className="Console window-undraggable">
      <div className="Console-surface">
        <select className="browser-default" value={selectedRule} onChange={handleRuleChange}>
          {Object.keys(ruleMaps).map((ruleName) => <option key={ruleName}>{ruleName}</option>)}
        </select>
        {['backlog', 'backlogReverse'].includes(selectedRule) && (
          <div className="Console-input-heading-rate"></div>
        )}
        <button className="btn btn-small transparent black-text" onClick={copy}>Copy</button>
        {isTemplateEnable
          ? [...placeHolders].map(([placeName, value]) => (
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
          ))
          : <button type="button" className="btn btn-extra-small btn-block transparent black-text" onClick={handleEnableTemplate}>
               Template Syntax
            </button>
        }
        <textarea
          className="Console-textarea"
          value={origin}
          autoCapitalize="off"
          onChange={handleTextChange}
        />
        <div className="Console-radio-inline">
          {tabNames.map((tabName) => (
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
