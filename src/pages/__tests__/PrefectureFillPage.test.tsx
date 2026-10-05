import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrefectureFillPage } from '../PrefectureFillPage'

const CORRECT_COUNT_KEY = 'prefecture-fill-two-prefectures-correctCount'
const REVEALED_PREFECTURE_TEXT = '三重'

function startTwoPrefecturesDrill() {
  render(
    <MemoryRouter>
      <PrefectureFillPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: /2県確定特訓/ }))
}

function answer(value: string) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: '回答する' }))
}

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('都道府県名の穴埋めの2県確定特訓', () => {
  it.each(['えひめ', 'エヒメ', '愛媛'])(
    '片方を最初から表示し、%sを1回回答すると正解・加点して次へ進める',
    (value) => {
      localStorage.setItem(CORRECT_COUNT_KEY, '7')
      startTwoPrefecturesDrill()

      expect(screen.getByText('「え」を含む')).toBeInTheDocument()
      expect(screen.getByText(REVEALED_PREFECTURE_TEXT)).toBeInTheDocument()
      expect(screen.getByText('と')).toBeInTheDocument()
      expect(screen.queryByText(/えひめ/)).not.toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'placeholder',
        '県名を入力',
      )

      answer(value)
      expect(screen.getByText('正解！')).toBeInTheDocument()
      expect(localStorage.getItem(CORRECT_COUNT_KEY)).toBe('8')
      fireEvent.click(screen.getByTestId('feedback-modal'))
      expect(screen.queryByText('「え」を含む')).not.toBeInTheDocument()
      expect(screen.getByText('北海道')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('')
      expect(screen.getByRole('textbox')).toBeEnabled()

      fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
      expect(
        screen.getByRole('button', { name: /2県確定特訓/ }),
      ).toHaveTextContent('累計8問')
    },
  )

  it.each(['三重', 'みえ', 'とうきょう', 'みえ えひめ'])(
    '%sの回答はすぐに不正解となり、公開した県と問題を保って再回答できる',
    (value) => {
      startTwoPrefecturesDrill()
      answer(value)
      expect(screen.getByText('もう一度！')).toBeInTheDocument()
      expect(localStorage.getItem(CORRECT_COUNT_KEY)).toBeNull()

      fireEvent.click(screen.getByTestId('feedback-modal'))
      expect(screen.getByText('「え」を含む')).toBeInTheDocument()
      expect(screen.getByText(REVEALED_PREFECTURE_TEXT)).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('')
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'えひめ' },
      })
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
      expect(screen.getByText('正解！')).toBeInTheDocument()
      expect(localStorage.getItem(CORRECT_COUNT_KEY)).toBe('1')
    },
  )
})
