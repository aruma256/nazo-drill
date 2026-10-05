import { act, fireEvent, render, screen } from '@testing-library/react'
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
  vi.useRealTimers()
})

describe('都道府県名の穴埋めの共通入力', () => {
  it.each([
    {
      label: '穴埋めモード',
      mode: 'normal',
      random: 12.5 / 47,
      value: 'ﾄｳｷｮｳﾄ',
    },
    {
      label: '1県確定特訓',
      mode: 'one-prefecture',
      random: 0,
      value: '宮崎県',
    },
    {
      label: '実力テスト',
      mode: 'challenge',
      random: 12.5 / 47,
      value: 'とうきょうと',
    },
  ])(
    '$label で接尾辞を含む県名を回答できる',
    ({ label, mode, random, value }) => {
      vi.mocked(Math.random).mockReturnValue(random)
      if (mode === 'challenge') vi.useFakeTimers()
      render(
        <MemoryRouter>
          <PrefectureFillPage />
        </MemoryRouter>,
      )
      expect(
        screen.getByText(
          '漢字・ひらがな・カタカナで入力できます（都・府・県は省略可）',
        ),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }))
      if (mode === 'challenge') {
        for (let i = 0; i < 3; i++) {
          act(() => {
            vi.advanceTimersByTime(1000)
          })
        }
      }
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'placeholder',
        '県名を入力',
      )
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '20')
      answer(value)
      expect(localStorage.getItem(`prefecture-fill-${mode}-correctCount`)).toBe(
        '1',
      )
      if (mode === 'challenge') {
        expect(screen.getByText('正解数').parentElement).toHaveTextContent(
          /^正解数\s*1$/,
        )
      } else {
        expect(screen.getByText('正解！')).toBeInTheDocument()
      }
    },
  )
})

describe('都道府県名の穴埋めの2県確定特訓', () => {
  it.each([
    'えひめ',
    'エヒメ',
    '愛媛',
    '愛媛県',
    'えひめけん',
    'ｴﾋﾒｹﾝ',
    ' 愛 媛 県　',
  ])(
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
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '20')

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

  it.each([
    '三重',
    'みえ',
    '三重県',
    'みえけん',
    'とうきょう',
    'みえ えひめ',
    '愛媛府',
    '愛媛市',
  ])(
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
