import type { ReactNode } from 'react'
import type { Feedback } from '../types/drill'
import { DrillScreenLayout } from './DrillScreenLayout'
import { FeedbackModal } from './FeedbackModal'
import { PracticeAnswerArea } from './PracticeAnswerArea'

interface PracticeScreenLayoutProps {
  onBack: () => void
  drillLabel: string
  question: ReactNode
  answer: ReactNode
  feedback: Feedback | null
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  disabled?: boolean
  children: ReactNode
}

/** 練習の問題・回答・答え表示・正誤確認と、次問への操作をまとめる。 */
export function PracticeScreenLayout({
  onBack,
  drillLabel,
  question,
  answer,
  feedback,
  revealed,
  onReveal,
  onNext,
  disabled = false,
  children,
}: PracticeScreenLayoutProps) {
  return (
    <>
      <DrillScreenLayout onBack={onBack} drillLabel={drillLabel}>
        {question}
        <PracticeAnswerArea
          revealed={revealed}
          answer={answer}
          onReveal={onReveal}
          onNext={onNext}
          disabled={disabled || !!feedback}
        >
          {children}
        </PracticeAnswerArea>
      </DrillScreenLayout>
      <FeedbackModal
        isOpen={!!feedback}
        type={feedback?.type ?? 'correct'}
        hintContent={feedback?.type === 'correct' ? answer : undefined}
        onNext={onNext}
      />
    </>
  )
}
