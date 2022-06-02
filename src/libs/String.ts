/** 選択中の文字列情報 */
type SelectionText = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * 文字列の選択部分をインデントする
 * @param selectionText.value 文字列
 * @param selectionText.selectionStart 選択開始位置
 * @param selectionText.selectionEnd 選択終了位置
 * @param isIndent インデントするか (falseでインデント解除)
 * @returns 選択中の文字列情報
 */
 export const indentText = ({ value, selectionStart, selectionEnd }: SelectionText, isIndent = true): SelectionText => {
  let [prefix, selection, suffix] = splitSelectionLines({ value, selectionStart, selectionEnd })

  let endOffset = 0
  let isFirstLineChanged = false
  if (isIndent) {
    isFirstLineChanged = selectionStart === selectionEnd ? true : /^[^\n]/.test(selection)
    if (isFirstLineChanged) {
      selection = `  ${selection}`
      endOffset += 2
    }
    selection = selection.replace(/\n(?!\n|$)/g, () => {
      endOffset += 2
      return '\n  '
    })
  } else {
    isFirstLineChanged = /^  /.test(selection)
    selection = selection.replace(/^  /mg, () => {
      endOffset -= 2
      return ''
    })
  }

  const startOffset = isFirstLineChanged ? (isIndent ? 2 : -2) : 0
  return {
    value: `${prefix}${selection}${suffix}`,
    selectionStart: selectionStart + startOffset,
    selectionEnd:  selectionEnd + endOffset,
  }
}

/**
 * コードコメントを切り替える
 * @param selectionText.value 文字列
 * @param selectionText.selectionStart 選択開始位置
 * @param selectionText.selectionEnd 選択終了位置
 */
export const toggleCodeComment = ({ value, selectionStart, selectionEnd }: SelectionText): SelectionText => {
  let [prefix, selection, suffix] = splitSelectionLines({ value, selectionStart, selectionEnd })

  let endOffset = 0
  const needsComment = !(/^(?:\/\/[^\n]*(?:\n|$)|\n)+$/.test(selection))
  if (needsComment) {
    selection = selection
      .replace(/^.*$/gm, (line) => {
        endOffset += 2
        return `//${line}`
      })
      .replace(/\n\/\/$/, () => {
        endOffset -= 2
        return '\n'
      })
  } else {
    selection = selection.replace(/^\/\//mg, () => {
      endOffset -= 2
      return ''
    })
  }
  return {
    value: `${prefix}${selection}${suffix}`,
    selectionStart: selectionStart,
    selectionEnd:  selectionEnd + endOffset,
  }
}

/**
 * 選択文字列を切り分ける (選択開始行を最初から含む)
 * @param selectionText.value 文字列
 * @param selectionText.selectionStart 選択開始位置
 * @param selectionText.selectionEnd 選択終了位置
 * @return [前方対象外, 置換対象部, 後方対象外]
 */
const splitSelectionLines = ({ value, selectionStart, selectionEnd }: SelectionText): [string, string, string] => {
  let prefixLines = value.slice(0, selectionStart).split('\n');
  const firstLine = prefixLines.pop();

  const prefix = `${prefixLines.join('\n')}${prefixLines.length ? '\n' : ''}`;
  let selection = firstLine + value.slice(selectionStart, selectionEnd);
  const suffix = value.slice(selectionEnd);
  return [prefix, selection, suffix]
}
