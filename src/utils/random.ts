/**
 * ランダム関連のユーティリティ関数
 */

/**
 * ランダムな整数を生成
 * @param min - 最小値（含む）
 * @param max - 最大値（含む）
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 配列からランダムに要素を選択
 */
export function getRandomElement<T>(array: readonly T[]): T {
  return array[getRandomInt(0, array.length - 1)]
}

/**
 * 前回の値を除外して配列からランダムに選択
 * @param array - 選択元の配列
 * @param lastValue - 除外する前回の値（nullなら除外なし）
 * @param getKey - 比較用キー取得関数（省略時は値そのもの）
 */
export function getRandomElementExcluding<T, K = T>(
  array: readonly T[],
  lastValue: K | null,
  getKey: (item: T) => K = (x) => x as unknown as K,
): T {
  if (lastValue === null || array.length <= 1) {
    return getRandomElement(array)
  }
  const filtered = array.filter((item) => getKey(item) !== lastValue)
  return getRandomElement(filtered.length > 0 ? filtered : array)
}
