import { useChallengeTimeUp } from './useChallengeTimeUp'
import { useCountdownTimer } from './useCountdownTimer'
import { usePenaltyTimeout } from './usePenaltyTimeout'
import {
  CHALLENGE_TIME_LIMIT,
  WRONG_ANSWER_PENALTY_SECONDS,
} from '../constants/challenge'
import type { HistoryEntry } from '../types/drill'

interface ChallengeOptions {
  score: number
  history: HistoryEntry[]
  onTimeUp: (score: number, history: HistoryEntry[]) => void
}

/** 全ドリル共通の制限時間・誤答ペナルティ・終了処理。 */
export function useChallenge({ score, history, onTimeUp }: ChallengeOptions) {
  const { remainingTime, subtractTime } =
    useCountdownTimer(CHALLENGE_TIME_LIMIT)
  const { isPenalized, activatePenalty } = usePenaltyTimeout()
  const isFinished = remainingTime === 0

  useChallengeTimeUp(remainingTime, score, history, onTimeUp)

  const applyPenalty = () => {
    if (isFinished) return
    subtractTime(WRONG_ANSWER_PENALTY_SECONDS)
    activatePenalty()
  }

  return { remainingTime, isPenalized, isFinished, applyPenalty }
}
