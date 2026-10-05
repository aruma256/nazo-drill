import type { ComponentProps } from 'react'
import { AnswerInputArea } from './AnswerInputArea'

/** 穴埋め・形のドリルで共通の入力案内。 */
export function PrefectureAnswerGuide() {
  return (
    <p className="mt-2 text-sm text-gray-500">
      漢字・ひらがな・カタカナで入力できます（都・府・県は省略可）
    </p>
  )
}

/** 表記や接尾辞を含む県名を、両ドリルで同じ入力設定で受け付ける。 */
export function PrefectureAnswerInput(
  props: Omit<
    ComponentProps<typeof AnswerInputArea>,
    'placeholder' | 'maxLength'
  >,
) {
  return <AnswerInputArea {...props} placeholder="県名を入力" maxLength={20} />
}
