import type { ReactNode } from 'react'
import type { DrillId } from '../constants/theme'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'
import type { DrillPageController } from '../hooks/useDrillPage'
import type { HistoryEntry, Question } from '../types/drill'
import { ChallengeCountdownModal } from './ChallengeCountdownModal'
import { ChallengeResult } from './ChallengeResult'
import { DrillHeader } from './DrillHeader'
import { Layout } from './Layout'

interface DrillPageLayoutProps<Mode extends string> {
  drillId: DrillId
  title: string
  description: string
  controller: DrillPageController<Mode>
  startScreen: ReactNode
  renderPractice: (mode: Mode) => ReactNode
  challengeScreen: ReactNode
  noteScreen?: ReactNode
  questionRenderer?: (question: Question) => ReactNode
  historyEntryRenderer?: (entry: HistoryEntry) => ReactNode
}

/** 各画面の切り替え、ページの余白、カウントダウン、結果表示を統一する。 */
export function DrillPageLayout<Mode extends string>({
  drillId,
  title,
  description,
  controller,
  startScreen,
  renderPractice,
  challengeScreen,
  noteScreen,
  questionRenderer,
  historyEntryRenderer,
}: DrillPageLayoutProps<Mode>) {
  const { state, completeCountdown, startChallenge, backToStart } = controller

  return (
    <Layout
      maxWidth="2xl"
      drillId={drillId}
      compact={state.screen === 'drill' || state.screen === 'challenge'}
    >
      {state.screen === 'start' && (
        <>
          <DrillHeader title={title} description={description} />
          {startScreen}
        </>
      )}
      {state.screen === 'drill' && renderPractice(state.mode)}
      {state.screen === 'countdown' && (
        <ChallengeCountdownModal onComplete={completeCountdown} />
      )}
      {state.screen === 'challenge' && challengeScreen}
      {state.screen === 'challengeResult' && (
        <ChallengeResult
          score={state.result.score}
          history={state.result.history}
          timeLimit={CHALLENGE_TIME_LIMIT}
          drillName={title}
          onRetry={startChallenge}
          onBack={backToStart}
          questionRenderer={questionRenderer}
          historyEntryRenderer={historyEntryRenderer}
        />
      )}
      {state.screen === 'note' && noteScreen}
    </Layout>
  )
}
