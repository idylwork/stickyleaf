import { arrayToTable, escapeHtml, splitPresence } from '../modules';

// マークダウンプレビュー
export default new Map<RegExp, string | Function>([
  /* コード */
  [/^```[a-z]*?\n*([^`]*\n)```$/gm, (args: string[]) => {
    return `<div class="preview-md-code">${escapeHtml(args[1])}</div>`;
  }],
  /* インラインコード */
  [/`([^`]+)`/g, '<span class="preview-md-code">$1</span>'],
  /* 引用 */
  [/(?:^> ?.*\n)+/gm, (args: string[]) => {
    let rows = splitPresence(args[0], '\n');
    let output = '<div class="preview-md-quote">';
    rows.forEach((row) => {
      output += row.replace(/^> ?/, '') + '<br>';
    });
    output += '</div>';
    return output;
  }],
  /* 罫線 */
  [/^-{3,}$/gm, '<hr class="preview-md-hr">'],
  /* リスト */
  [/^(?:[ 	]*- .*?\n)+/gm, (args: string[], options: { data: { checkboxIndex: number } }) => {
    let output = '<ul class="preview-md-list">';
    let rows = splitPresence(args[0], '\n');
    rows.forEach((row) => {
      let indent = 0;
      let text = row.replace(/^(  |	)*- /, (lineHead) => {
        indent = lineHead.split(/  |	/).length-1;
        return '';
      });

      let className = 'preview-md-list-item';
      if (indent) className += ' preview-md-list-indent-' + indent;

      // チェックボックス
      let isChecked: boolean | null = null; // null:リスト boolean:チェックボックス
      if (text.startsWith('[ ] ')) isChecked = false;
      if (text.startsWith('[x] ')) isChecked = true;
      if (typeof isChecked === 'boolean') {
        const index = options.data.checkboxIndex = 'checkboxIndex' in options.data
          ? options.data.checkboxIndex + 1
          : 0;
        let innerText = text.slice(4);
        text = `<input type="checkbox" name="checkbox[${index}]" class="preview-md-checkbox" ${isChecked ? 'checked' : ''}>${innerText}`;
        className += ' preview-md-checklist';
      }

      output += '<li class="' + className + '">' + text + '</li>';
    });
    output += '</ul>';
    return output;
  }],
  /* 表組み */
  [/(.*\|.*)\n\|?:--:(?:\|:--:)+\|?\n((?:.*\|.*\n)+)/g, (args: string[]) => {
    let rows = args[2].split('\n');
    rows.unshift(args[1]);

    let outputItems: string[][] = [];
    interface ActionCell {
      type: string;
      row: number;
      col: number;
    }
    let actionCells: ActionCell[] = [];

    // 特殊機能の定義
    const actions: { [index: string]: Function; } = {
      sum: (action: ActionCell) => {
        let sum = 0;
        outputItems.forEach((outputItem) => {
          let float = parseFloat(outputItem[action.col]);
          if (isNaN(float)) return;
          sum += float;
        });
        outputItems[action.row][action.col] = sum.toString();
      }
    };

    rows.forEach((row: string, rowNo: number) => {
      let items: string[] = row.split('|').filter((v) => { return v !== ''; });

      // 特殊機能セルの判別
      items.forEach((item: string, colNo: number) => {
        if (!item.startsWith('{{') || !item.endsWith('}}')) return;
        let type = item.slice(2, -2);
        actionCells.push({ type: type, row: rowNo, col: colNo });
      });

      if (row) {
        outputItems[rowNo] = items;
      }
    });

    // 特殊機能セルの変換
    actionCells.forEach((action: ActionCell) => {
      actions[action.type](action);
    });

    return arrayToTable(outputItems, {class: 'preview-md-table', headerRow: 1}).outerHTML;
  }],
  /* 見出し */
  [/^(#{1,6}) (.+)$/gm, (args: string) => {
    let level = args[1].length;
    return '<h' + level + ' class="preview-md-heading-' + level + '">' + args[2] + '</h' + level + '>';
  }],
]);
