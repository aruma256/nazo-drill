import { useCallback } from 'react'

/**
 * localStorageのキーを生成
 */
function getCorrectCountKey(drillName: string, mode: string): string {
  return `${drillName}-${mode}-correctCount`
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
      const key = getCorrectCountKey(drillName, mode)
      const value = localStorage.getItem(key)
      return value ? parseInt(value, 10) : 0
    },
    [drillName],
  )

  /**
   * 累計正答数をインクリメント
   */
  const incrementCorrectCount = useCallback(
    (mode: string): number => {
      const key = getCorrectCountKey(drillName, mode)
      const currentCount = getCorrectCount(mode)
      const newCount = currentCount + 1
      localStorage.setItem(key, newCount.toString())
      return newCount
    },
    [drillName, getCorrectCount],
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
      return modes.reduce(
        (acc, mode) => {
          acc[mode] = getCorrectCount(mode)
          return acc
        },
        {} as Record<string, number>,
      )
    },
    [getCorrectCount],
  )

  return {
    getCorrectCount,
    incrementCorrectCount,
    resetCorrectCount,
    getAllCorrectCounts,
  }
}
