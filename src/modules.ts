interface arrayToTableOptions {
  class?: string | string[];
  headerRow: number;
}

const specialChars: { [index: string]: string; } = {
  '&': '&amp;', "'": '&#x27;', '`': '&#x60;',
  '"': '&quot;', '<': '&lt;', '>': '&gt;',
  '#': '&#x23;', '-': '&minus;'
};
const specialCharsReg: RegExp = new RegExp(`[${Object.keys(specialChars).join('')}]`, 'g');

/** 受け取った文字列をクリップボードにコピー */
export const setClipboard = (text: string) => {
  if (text.length === 0) return;
  var temp = document.createElement('textarea');
  temp.value = text;
  temp.selectionStart = 0;
  temp.selectionEnd = temp.value.length;
  temp.style.position = 'fixed';
  temp.style.left = '-100%';
  document.body.appendChild(temp);
  temp.focus();
  var result = document.execCommand('copy');
  temp.blur();
  document.body.removeChild(temp);
};

/** 分割して空要素を削除 */
export const splitPresence = (text: string, delimiter: string): string[] => {
  return text.split(delimiter).filter((value) => { return value !== ''; });
};

/** HTMLタグをエスケープ */
export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') return text;
  return text.replace(specialCharsReg, (match) => {
    return specialChars[match];
  });
};

/** 範囲を指定して乱数を取得 */
export const randomNumber = (min: number = 0, max: number | null = null): number => {
  if (max === null) {
    max = min;
    min = 0;
  } else {
    max -= min;
  }
  return Math.floor(Math.random() * max) + min;
}

/** 二次元配列からtableタグを作成 */
export const arrayToTable = (array: string[][], options: arrayToTableOptions = { headerRow: 0 }) => {
  let rows = [];
  let table = document.createElement('table');

  // options.class クラスの追加
  if (options.class) {
    if (options.class instanceof Array) {
      table.classList.add(...options.class);
    } else {
      table.classList.add(options.class);
    }
  }

  for (let row = 0; row < array.length; row++) {
    // 行の追加
    rows.push(table.insertRow());
    let isHeaderRow = options.headerRow > row;

    for (let col = 0; col < array[0].length; col++) {
      // セルの追加
      let cell = rows[row].insertCell();
      if (isHeaderRow) cell.classList.add('preview-md-table-th');
      let innerText = array[row][col] !== void 0 ? array[row][col] : '';
      cell.appendChild(document.createTextNode(innerText));
    }
  }
  return table;
};
