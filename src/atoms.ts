import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { randomNumber } from './modules';

export interface Theme {
  opacity: number;
  topColor: string;
  bottomColor: string;
  gradientPercentage: number;
  textureRatio: number;
}

/**
 * 表示中のテーマAtom
 */
export const themeAtom = atom<Theme>({
    opacity: 0.9,
    topColor: `hsl(${randomNumber(360)}, ${randomNumber(90, 100)}%, ${randomNumber(90, 100)}%)`,
    bottomColor: `hsl(${randomNumber(360)}, ${randomNumber(80, 100)}%, ${randomNumber(30, 80)}%)`,
    gradientPercentage: randomNumber(50, 200),
    textureRatio: randomNumber(1, 4) * 0.1,
  });

/**
 * 保存されたテーマリストAtom
 */
export const themesAtom = atomWithStorage<Theme[]>('themes', []);

/**
 * テンプレート構文の有効化ステータスAtom
 */
export const isTemplateEnabledAtom = atom(false);