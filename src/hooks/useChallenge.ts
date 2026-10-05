import { useChallengeTimeUp } from './useChallengeTimeUp'
import { useCountdownTimer } from './useCountdownTimer'
import { usePenaltyTimeout } from './usePenaltyTimeout'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'
import type { HistoryEntry, Question } from '../types/drill'

interface ChallengeOptions {
  score: number
  history: HistoryEntry[]
  currentQuestion: Question | null
  onTimeUp: (score: number, history: HistoryEntry[]) => void
  /** 時間切れ時に残す回答。盤面を操作するドリルでは途中の盤面を渡す。 */
  userAnswer?: string
}

/** 全ドリル共通の制限時間・誤答ペナルティ・終了処理。 */
export function useChallenge({
  score,
  history,
  currentQuestion,
  onTimeUp,
  userAnswer,
}: ChallengeOptions) {
  const { remainingTime, subtractTime } =
    useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { isPenalized, activatePenalty } = usePenaltyTimeout()
  const isFinished = remainingTime === 0

  useChallengeTimeUp(
    remainingTime,
    score,
    history,
    currentQuestion,
    onTimeUp,
    userAnswer,
  )

  const applyPenalty = () => {
    if (isFinished) return
    subtractTime(WRONG_ANSWER_PENALTY_SECONDS)
    activatePenalty()
  }

  return { remainingTime, isPenalized, isFinished, applyPenalty }
}
