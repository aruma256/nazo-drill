import type { ReactNode } from 'react'
import { CHALLENGE_TIME_LIMIT } from '../constants/challenge'
import type { DrillId } from '../constants/theme'
import { ModeButton } from './ModeButton'
import { SectionHeader } from './SectionHeader'

interface PracticeMode<Mode extends string> {
  mode: Mode
  label: string
  icon?: ReactNode
}

interface DrillStartScreenProps<Mode extends string> {
  drillId: DrillId
  title: string
  children: ReactNode
  practiceModes: readonly PracticeMode<Mode>[]
  onStartDrill: (mode: Mode) => void
  onStartChallenge: () => void
  challengeMode?: string
  onOpenNote?: () => void
  footer?: ReactNode
}

/** ルール説明とモード選択の配置・記録表示・読み上げ名を統一する。 */
export function DrillStartScreen<Mode extends string>({
  drillId,
  title,
  children,
  practiceModes,
  onStartDrill,
  onStartChallenge,
  challengeMode = 'challenge',
  onOpenNote,
  footer,
}: DrillStartScreenProps<Mode>) {
  const challengeLabel = `実力テスト（${CHALLENGE_TIME_LIMIT}秒）`

  return (
    <>
      <section className="mb-8">
        <SectionHeader>ルール</SectionHeader>
        <div className="space-y-2 pl-3 text-gray-700">{children}</div>
      </section>
      <section className="mb-6">
        <SectionHeader>モードを選択</SectionHeader>
        <div className="space-y-3">
          <ModeButton
            label={challengeLabel}
            ariaLabel={`${title}：${challengeLabel}`}
            mode={challengeMode}
            drillName={drillId}
            onClick={onStartChallenge}
            icon="⏱️"
            variant="challenge"
          />
          <div className="border-t-4 border-[var(--drill-primary-light)]" />
          {practiceModes.map(({ mode, label, icon = '✏️' }) => (
            <ModeButton
              key={mode}
              label={label}
              ariaLabel={`${title}：${label}`}
              mode={mode}
              drillName={drillId}
              onClick={() => {
                onStartDrill(mode)
              }}
              icon={icon}
            />
          ))}
          {onOpenNote && (
            <>
              <div className="border-t-4 border-[var(--drill-primary-light)]" />
              <ModeButton
                label="暗記ノート"
                ariaLabel={`${title}：暗記ノート`}
                mode="note"
                drillName={drillId}
                onClick={onOpenNote}
                icon="📖"
                hidePoints
              />
            </>
          )}
        </div>
      </section>
      {footer}
    </>
  )
}
