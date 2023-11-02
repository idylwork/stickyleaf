import React from 'react';
import { indentText } from './libs/String';

type Props = {
  value: string;
  onChange: (newValue: string) => void;
};

/**
 * 入力補助機能を備えたテキストエリア
 * @returns
 */
export const TextArea: React.FC<Props> = ({ value, onChange }) => {
  /**
   * 文章入力時
   * @param event
   */
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.currentTarget.value);
  };

  /**
   * テキストエリアでキーを押下したときの処理
   * @param event
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const input = event.target as HTMLTextAreaElement

    // Tabキーでインデント
    if (event.key === 'Tab') {
      event.preventDefault()
      const { value: newValue, selectionStart, selectionEnd } = indentText({
        value,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd
      }, !event.shiftKey)

      onChange(newValue);
      setTimeout(() => {
        input.selectionStart = selectionStart;
        input.selectionEnd = selectionEnd
      })
    }
  };

  return (
    <textarea
      className="Console-textarea"
      value={value}
      autoCapitalize="off"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};
