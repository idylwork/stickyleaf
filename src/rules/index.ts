import { replaceMustache } from '../libs/String';
import backlog from './backlog';
import backlog_reverse from './backlog_reverse';
import duplicated from './duplicated';
import markdown from './markdown';
import sql from './sql';

interface Options {
  headingRate?: number[];
  placeHolders?: Map<string, string>;
}

/** 変換ルール名 */
export const RuleType = {
  Html: 'markdown',
  Backlog: 'backlog',
  BacklogReverse: 'backlog_reverse',
  Sql: 'sql',
  Duplicated: 'duplicated',
  None: '',
} as const;
export type RuleType = typeof RuleType[keyof typeof RuleType]

const ruleMaps: { [index: string]: Map<RegExp, string | Function>; } = {
  [RuleType.Backlog]: backlog,
  [RuleType.BacklogReverse]: backlog_reverse,
  [RuleType.Sql]: sql,
  [RuleType.Duplicated]: duplicated,
  [RuleType.Html]: markdown,
};

/**
 * 変換ルールとテンプレート構文を有効にする
 * @param origin
 * @param ruleType
 * @param options
 * @returns
 */
export const convert = (origin: string, ruleType: RuleType, options: Options = {}) => {
  // 変換ルールリストを取得
  const ruleMap = ruleMaps[ruleType] ?? new Map();

  // 末尾整形
  let output = origin.replace(/(.)\n?$/, '$1\n');

  // 見出しレベルのデフォルト
  if (!options.headingRate) {
    options.headingRate = [2, 3, 6];
  }

  // プレースホルダを変換
  if (options.placeHolders && options.placeHolders.size) {
    output = replaceMustache(output, options.placeHolders);
  }

  // ルールで変換
  const data = {};
  ruleMap.forEach((replace: string | Function, reg: RegExp) => {
    if (typeof replace === 'function') {
      output = output.replace(reg, (...matches) => replace(matches, { ...options, data }));
    } else {
      output = output.replace(reg, replace);
    }
  });
  return output;
};

export default ruleMaps;
