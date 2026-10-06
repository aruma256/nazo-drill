import type { ReactNode } from 'react'

interface TextQuestionProps {
  text?: string
  subtext?: ReactNode
}

/** 文字で出題する問題の大きさ・色・補足の配置を揃える。 */
export function TextQuestion({ text, subtext }: TextQuestionProps) {
  return (
    <div className="text-center">
      <div className="font-display break-words text-4xl font-bold text-drill-primary-dark sm:text-5xl">
        {text ?? '--'}
      </div>
      {subtext && <div className="mt-1 text-sm text-gray-500">{subtext}</div>}
    </div>
  )
}
