import React, { useMemo, useRef } from 'react';
import useMarkDown from './hooks/useMarkDown';
import './Preview.scss';
import { convert } from './rules';

export const Preview: React.FC = () => {
  const { origin, placeHolders, updateMarkDown } = useMarkDown();

  const contentRef = useRef<HTMLDivElement>(null);

  // プレビューのクリックイベント
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLInputElement;

    // チェックボックスの場合
    if (contentRef.current && target.type === 'checkbox') {
      const checkboxes = contentRef.current.querySelectorAll('[type="checkbox"]');

      // 走査対象のチェックボックスのインデックス
      let index = -1;
      updateMarkDown({
        origin: (origin.replace(/- \[[ x]\] (.*)(\n)/gm, (chunk, text, suffix) => {
          index += 1;
          if (target.isEqualNode(checkboxes[index] ?? null)) {
            if (text === (target.nextSibling instanceof Text
              ? (target.nextSibling.nodeValue ?? '')
              : '').trim()) {
              return `- [${target.checked ? 'x' : ' '}] ${text}${suffix}`;
            } else {
              target.checked = !target.checked;
            }
          }
          return chunk;
        }))
      });
    }
  };

  /** 文章を変換 */
  const html = useMemo(() => {
    return convert(origin, 'markdown', { placeHolders }).replace(/\n/g, '<br>');
  }, [origin, placeHolders]);

  return (
    <section className="Preview window-draggable">
      <div
        ref={contentRef}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
};
