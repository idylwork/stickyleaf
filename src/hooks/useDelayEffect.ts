import { useEffect, useState } from 'react';

interface Options {
  onFirst?: Function | null;
  delay?: number
}

/**
 * 時間差で副作用フックを実行する
 * 連続で変更があった場合は古い変更の副作用をキャンセルする
 * @param {Function} callback 値の操作が終了してしばらく待ってから実行されるコールバック
 * @param {Array} deps 依存する変数
 * @param {Function|null} options.onStart 操作開始時に実行するコールバック
 * @param {number} options.delay useDelayEffectの発火猶予 (ミリ秒)
 */
const useDelayEffect = (
  callback: Function,
  deps: any[] = [],
  { onFirst = null, delay = 1000 }: Options = {}
) => {
  /** @var {boolean} 値の変更直後か */
  const [isHolding, setIsHolding] = useState<boolean>(false);
  /** @var {number|null} 延期中のタイムアウトID */
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    setIsHolding(true);
    if (!timeoutId) {
      if (onFirst) {
        onFirst();
      }
    }

    if (timeoutId) {
      // 連続でステートを変更した場合はタイマーをリセット
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    if (isHolding) {
      const newTimeoutId: number = window.setTimeout(() => {
        setIsHolding(false);

        // 一定時間タイムアウトIDの更新がなければ実行
        callback();
      }, delay);
      setTimeoutId(newTimeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useDelayEffect;
