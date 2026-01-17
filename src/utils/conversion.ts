/**
 * 文字変換関連のユーティリティ関数
 */

/** 'A'のASCIIコード */
export const ASCII_CODE_A = 65

/**
 * 数字をアルファベットに変換する（1→A, 2→B, ...）
 * @param number - 1〜26の数字
 * @returns 対応するアルファベット（A-Z）
 */
export function numberToAlpha(number: number): string {
  return String.fromCharCode(ASCII_CODE_A + number - 1)
}

/**
 * アルファベットを数字に変換する（A→1, B→2, ...）
 * @param alpha - A〜Zのアルファベット
 * @returns 対応する数字（1-26）
 */
export function alphaToNumber(alpha: string): number {
  return alpha.toUpperCase().charCodeAt(0) - ASCII_CODE_A + 1
}

/**
 * アルファベットをシフトする（A+1→B, Z+1→A）
 * @param alpha - シフト対象のアルファベット
 * @param shift - シフト量（正: 右シフト、負: 左シフト）
 * @returns シフト後のアルファベット
 */
export function shiftAlpha(alpha: string, shift: number): string {
  const num = alphaToNumber(alpha)
  const shifted = ((((num - 1 + shift) % 26) + 26) % 26) + 1
  return numberToAlpha(shifted)
}

/**
 * カタカナをひらがなに変換
 * @param str - 変換する文字列
 * @returns ひらがなに変換された文字列
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60)
  })
}

/**
 * ひらがなをカタカナに変換
 * @param str - 変換する文字列
 * @returns カタカナに変換された文字列
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60)
  })
}

/**
 * 全角アルファベットを半角に変換
 * @param str - 変換する文字列
 * @returns 半角アルファベットに変換された文字列
 */
export function toHalfWidthAlpha(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0),
  )
}
