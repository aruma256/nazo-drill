import type { ReactNode } from 'react'
import { ChallengeTimer } from './ChallengeTimer'
import { DrillMiniHeader } from './DrillMiniHeader'
import { PenaltyOverlay } from './PenaltyOverlay'
import { ScoreDisplay } from './ScoreDisplay'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'

interface DrillScreenLayoutProps {
  onBack: () => void
  drillLabel: string
  children: ReactNode
  challenge?: {
    remainingTime: number
    isPenalized: boolean
    score: number
  }
}

/** 練習・実力テスト共通のヘッダー、問題カード、問題と回答の間隔。 */
export function DrillScreenLayout({
  onBack,
  drillLabel,
  children,
  challenge,
}: DrillScreenLayoutProps) {
  return (
    <>
      <DrillMiniHeader onBack={onBack} drillLabel={drillLabel} />
      <div className="relative rounded-2xl bg-white/70 p-4">
        {challenge && (
          <>
            <PenaltyOverlay isPenalized={challenge.isPenalized} />
            <ChallengeTimer
              remainingSeconds={challenge.remainingTime}
              totalSeconds={CHALLENGE_TIME_LIMIT}
              isPenalized={challenge.isPenalized}
            />
            <ScoreDisplay score={challenge.score} />
          </>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    </>
  )
}
