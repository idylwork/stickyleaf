import { splitPresence } from '../modules'

export default new Map<RegExp, string | Function>([
  /* インラインコード */
  [/\{code\}(.+)\{\/code\}/g, '`$1`'],
  /* コード */
  [/\{code\}(\n[\s\S]+?\n)\{\/code\}/g, '```$1```'],
  /* リストのネスト */
  [/^(-{2,}) (.+)/gm, (args: string[]) => {
    let indentLevel = (args[1].length - 1);
    return '  '.repeat(indentLevel) + '- ' + args[2];
  }],
  /* リスト内の改行 */
  [/&br;/g, '\n'],
  /* 表組み */
  [/^(\|(.+\|)+h?\n)+/gm, (args: string[]) => {
    let rows = args[0].split('\n');
    let output = '';
    rows.forEach((row, rowNo) => {
      if (row.endsWith('h')) row = row.slice(0,-1);
      let items = splitPresence(row, '|');
      if (items.length) {
        output += '|' + items.join('|') + '|'
        output += rowNo === 0 ? '\n|' + ':--:|'.repeat(items.length) + '\n' : '\n';
      }
    });
    return output;
  }],
  /* 見出し */
  [/^(\*{1,3}) (.+)$/gm, (args: string[], options: { headingRate: number[]; }) => {
    let astariskCount = args[1].length;
    let headingLevel = options.headingRate[astariskCount - 1];
    return '#'.repeat(headingLevel) + ' ' + args[2];
  }],
  /* 太字行 */
  [/^''(.+)''$/gm, '###### $1'],
]);
