import React, { createContext, ReactNode, useContext, useReducer } from 'react';

interface MarkDownStates {
  origin: string;
  placeHolders: Map<string, string>;
}

interface MarkDownStatesUpdate {
  origin?: string;
  placeHolders?: Map<string, string>;
}

interface Action {
  type: 'UPDATE' | 'CLEAR';
  markDownStates: MarkDownStatesUpdate;
}

const initialStates: MarkDownStates = { origin: '', placeHolders: new Map };
/** @var {Context} ステートのコンテクスト */
const MarkDownContext = createContext<MarkDownStates>(initialStates);
/** @var {Context} ステート変更のコンテクスト */
const MarkDownDispatchContext = createContext<Function>(() => {});

/**
 * ツールチップへのJSXの表示を行う
 * @example
 *   const { openToolTip } = useToolTip();
 *   openToolTip(<div>ツールチップ内容</div>, someElement)
 */
const useMarkDown = () => {
  /** @var {Object} toolTip ツールチップに表示する内容 */
  const markDownStates = useContext(MarkDownContext);
  /** @var {Function} dispatch ツールチップを更新する */
  const dispatch = useContext(MarkDownDispatchContext);

  /**
   * ツールチップを閉じる
   */
  // const updateMarkDown = useMemo(
  //   () => ({ origin, placeHolders }) => {
  //     dispatch({ type: 'UPDATE', { origin, placeHolders } });
  //   },
  //   [dispatch]
  // );
  const updateMarkDown = (markDownStates: MarkDownStatesUpdate) => {
    dispatch({ type: 'UPDATE', markDownStates });
  };

  return {
    ...markDownStates,
    updateMarkDown,
  };
};

/**
 * 個席選択リストの操作
 * @param {Object} selectedSeats 変更前のステート { selected: { [個席ID]: 選択中個席情報 }, path: [個席SVG情報] }
 * @param {Object} action
 * @returns {Object} 個席に関わるステート
 *   {
 *     selected: { 個席ID: { ...zsinfoAPIに関する個席情報 } },
 *     paths: [{ SVGパスに関する個席情報 }],
 *   }
 */
const markDownReducer = (oldStates: MarkDownStates, action: Action): MarkDownStates => {
  const newSeatsState = {
    origin: oldStates.origin,
    placeHolders: new Map(oldStates.placeHolders),
  };
  switch (action.type) {
    case 'UPDATE': {
      return { ...oldStates, ...action.markDownStates };
    }
    default:
  }
  return newSeatsState;
};

/**
 * 個席選択リストを利用可能にする
 * @param {JSX.Element} props.children
 * @returns {JSX.Element}
 */
export const MarkDownProvider: React.FC<{children?: ReactNode;}> = ({ children }) => {
  const [markDownState, dispatch] = useReducer(markDownReducer, initialStates);

  return (
    <MarkDownDispatchContext.Provider value={dispatch}>
      <MarkDownContext.Provider value={markDownState}>
        {children}
      </MarkDownContext.Provider>
    </MarkDownDispatchContext.Provider>
  );
};

export default useMarkDown;
