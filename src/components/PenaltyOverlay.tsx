import { WRONG_ANSWER_PENALTY_SECONDS } from '../constants/challenge'

interface PenaltyOverlayProps {
  isPenalized: boolean
}

/**
 * チャレンジモードで不正解時に表示されるペナルティオーバーレイ
 */
export function PenaltyOverlay({ isPenalized }: PenaltyOverlayProps) {
  if (!isPenalized) return null

  return (
    <div className="animate-fade-in-up pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="rounded-xl bg-red-500/90 px-6 py-4 text-center text-white shadow-lg">
        <div className="text-lg font-bold">不正解</div>
        <div className="text-2xl font-black">
          -{WRONG_ANSWER_PENALTY_SECONDS}秒
        </div>
      </div>
    </div>
  )
}
