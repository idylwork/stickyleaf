export default new Map<RegExp, string | Function>([
  /* 全体 */
  [/^[\s\S]+$/, (args: string) => {
    let rows = args[0].split('\n');

    let duplicated = rows.filter(function (row, i, self) {
      return  row !== '' && self.indexOf(row) === i && i !== self.lastIndexOf(row);
    });

    if (duplicated.length) {
      return duplicated.join('\n');
    } else {
      return '重複した行はありません'
    }
  }],
]);
