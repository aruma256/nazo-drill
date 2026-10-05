import { useCallback } from 'react'

/**
 * localStorageのキーを生成
 */
function getCorrectCountKey(drillName: string, mode: string): string {
  return `${drillName}-${mode}-correctCount`
}

function getHighScoreKey(drillName: string, mode: string): string {
  return `${drillName}-${mode}-highScore`
}

function getStoredCorrectCount(drillName: string, mode: string): number {
  const value = localStorage.getItem(getCorrectCountKey(drillName, mode))
  return value ? parseInt(value, 10) : 0
}

/** Reactの状態更新の外で累計正答数を保存する。 */
export function incrementStoredCorrectCount(
  drillName: string,
  mode: string,
): number {
  const count = getStoredCorrectCount(drillName, mode) + 1
  localStorage.setItem(getCorrectCountKey(drillName, mode), count.toString())
  return count
}

/**
 * ドリルの累計正答数をlocalStorageで管理するカスタムフック
 */
export function useDrillStorage(drillName: string) {
  /**
   * 累計正答数を取得
   */
  const getCorrectCount = useCallback(
    (mode: string): number => {
      return getStoredCorrectCount(drillName, mode)
    },
    [drillName],
  )

  /**
   * 累計正答数をインクリメント
   */
  const incrementCorrectCount = useCallback(
    (mode: string): number => {
      return incrementStoredCorrectCount(drillName, mode)
    },
    [drillName],
  )

  /**
   * 累計正答数をリセット
   */
  const resetCorrectCount = useCallback(
    (mode: string): void => {
      const key = getCorrectCountKey(drillName, mode)
      localStorage.removeItem(key)
    },
    [drillName],
  )

  /**
   * 複数モードの累計正答数を一括取得
   */
  const getAllCorrectCounts = useCallback(
    (modes: string[]): Record<string, number> => {
      return modes.reduce<Record<string, number>>((acc, mode) => {
        acc[mode] = getCorrectCount(mode)
        return acc
      }, {})
    },
    [getCorrectCount],
  )

  /**
   * 最高記録を取得
   */
  const getHighScore = useCallback(
    (mode: string): number => {
      const key = getHighScoreKey(drillName, mode)
      const value = localStorage.getItem(key)
      return value ? parseInt(value, 10) : 0
    },
    [drillName],
  )

  /**
   * 最高記録を更新（現在より高い場合のみ）
   * @returns 更新後の最高記録
   */
  const updateHighScore = useCallback(
    (mode: string, score: number): number => {
      const currentHighScore = getHighScore(mode)
      if (score > currentHighScore) {
        const key = getHighScoreKey(drillName, mode)
        localStorage.setItem(key, score.toString())
        return score
      }
      return currentHighScore
    },
    [drillName, getHighScore],
  )

  return {
    getCorrectCount,
    incrementCorrectCount,
    resetCorrectCount,
    getAllCorrectCounts,
    getHighScore,
    updateHighScore,
  }
}
