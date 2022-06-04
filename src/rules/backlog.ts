import { splitPresence } from '../modules'

interface Options {
  headingRate: number[];
}

export default new Map<RegExp, string | Function>([
  /* コード */
  [/^```([^`]*\n)```$/gm, '{code}$1{/code}'],
  /* インラインコード */
  [/`([^`]+)`/g, '{code}$1{/code}'],
  /* リストのネスト */
  [/(  |	)(?=- )/g, '-'],
  /* リスト内の改行 */
  [/(^- [^\n]+)(?:\n(?:  |\t)(?:[^\n]+))+/gm, (args: string[]) => {
    return args[0].replace(/\n/g, '&br;');
  }],
  /* 表組み */
  [/(.+\|.+)\n\|?:--:(?:\|:--:)+\|?\n((?:.+\|.+\n)+)/g, (args: string[]) => {
    let rows = args[2].split('\n');
    rows.unshift(args[1]);
    let output = '';
    rows.forEach((row: string, rowNo: number) => {
      let items = splitPresence(row, '|');
      if (items.length) {
        output += '|' + items.join('|') + '|'
        output += rowNo === 0 ? 'h\n' : '\n';
      }
    });
    return output;
  }],
  /* 見出し */
  [/^(#{1,6}) (.+)$/gm, (args: string[], options: Options) => {
    let sharpCount = args[1].length;
    let headingLevel = 0;
    options.headingRate.forEach((threshold, index: number) => {
      if (sharpCount >= threshold) {
        headingLevel = index + 1;
      }
    });
    let text = args[2];
    switch (headingLevel) {
      case 0:
      case 1:
      case 2:
        return '\n' + '*'.repeat(headingLevel + 1) + ' ' + text;
      case 3:
        return "''" + text + "''";
    }
  }],
  /* 間隔調整 (見出しの前) */
  [/\n{2,}(\*{2,3} |\{code\})/g, '\n$1'],
  /* 間隔調整 (リストの後) */
  [/(\n- [^\n]+)\n{2,}/g, '$1\n'],
]);
