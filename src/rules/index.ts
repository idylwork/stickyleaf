import backlog from './backlog';
import backlog_reverse from './backlog_reverse';
import duplicated from './duplicated';
import markdown from './markdown';
import sql from './sql';

interface Options {
  headingRate?: number[];
  placeHolders?: Map<string, string>;
}

const ruleMaps: { [index: string]: Map<RegExp, string | Function>; } = {
  backlog,
  backlog_reverse,
  sql,
  duplicated,
  markdown,
};

/**
 * 変換ルールとテンプレート構文を有効にする
 * @param origin
 * @param ruleName
 * @param options
 * @returns
 */
export const convert = (origin: string, ruleName: string, options: Options = {}) => {
  // 変換ルールリストを取得
  const ruleMap = ruleMaps[ruleName];
  if (!ruleMap) {
    return origin;
  }

  // 整形
  let output = origin.replace(/(.)\n?$/, '$1\n');

  // 見出しレベルのデフォルト
  if (!options.headingRate) {
    options.headingRate = [2, 3, 6];
  }

  // プレースホルダを変換
  if (options.placeHolders && options.placeHolders.size) {
    options.placeHolders.forEach((value, placeName) => {
      const chunks = value.split(/, ?/);
      let index = 0;
      const regExp = new RegExp(`{{ ?${placeName} ?}}`, 'g');

      // @for (items) コンマ区切りの数だけ繰り返す
      const forRegExp = new RegExp(`@for ?\\(${placeName}\\)\\n?([\\s\\S]+?\\n)?@endfor\\n?`, 'g');
      output = output.replace(forRegExp, (_all: string, text: string) => {
        return value !== '' ? text.repeat(chunks.length) : '';
      });

      // @for (item in items) コンマ区切りの数だけ繰り返す
      const forInRegExp = new RegExp(`@for ?\\(([^ ]+) in ${placeName}\\)\\n?([\\s\\S]+?\\n)?@endfor\\n?`, 'g');
      output = output.replace(forInRegExp, (_all: string, item: string, text: string) => {
        const chunks = value.split(/, ?/);
        return chunks.map((chunk) => {
          const itemRegExp = new RegExp(`{{ ?${item} ?}}`, 'g');
          return text.replace(itemRegExp, chunk);
        }).join('');
      });

      // @if (item) 空欄でなければ表示する
      const ifRegExp = new RegExp(`@if ?\\(${placeName}\\)\\n?([\\s\\S]+?\\n)?@endif\\n?`, 'g');
      output = output.replace(ifRegExp, (_all: string, text: string) => {
        let unlessText = '';
        text = text.replace(/@else\n?([\s\S]*$)/, (all: string, elseClause: string) => {
          unlessText = elseClause;
          return '';
        });
        return value !== '' ? text : unlessText;
      });

      if (chunks.length === 1) {
        output = output.replace(regExp, value);
      } else {
        output = output.replace(regExp, () => {
          // コンマ区切りの場合は順に使用する
          if (!chunks[index]) {
            index = 0;
          }
          const chunk = chunks[index];
          index += 1;
          return chunk;
        });
      }
    });
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
