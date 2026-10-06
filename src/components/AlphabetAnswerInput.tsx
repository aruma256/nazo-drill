import type { ComponentProps } from 'react'
import { AnswerInputArea } from './AnswerInputArea'

/** 数字変換・シフトで共通の英字入力。表示と入力値を大文字に揃える。 */
export function AlphabetAnswerInput(
  props: Omit<
    ComponentProps<typeof AnswerInputArea>,
    'placeholder' | 'inputTransform' | 'inputClassName'
  >,
) {
  return (
    <AnswerInputArea
      {...props}
      placeholder="答えを入力"
      inputTransform={(value) => value.toUpperCase()}
      inputClassName="uppercase"
    />
  )
}
