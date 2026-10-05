import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NumberToAlphaPage } from '../NumberToAlphaPage'
import { AlphaShiftPage } from '../AlphaShiftPage'
import { GojuonPickPage } from '../GojuonPickPage'
import { GojuonSlidePage } from '../GojuonSlidePage'
import { PrefectureFillPage } from '../PrefectureFillPage'
import { PrefectureShapePage } from '../PrefectureShapePage'
import { generateWordQuestion as generateNumberWord } from '../../drills/numberToAlpha'
import { generateChallengeQuestion as generateShift } from '../../drills/alphaShift'
import { generateWordQuestion as generateGojuonWord } from '../../drills/gojuonPick'
import { generateSlideQuestion } from '../../drills/gojuonSlide'
import { CHALLENGE_TIME_LIMIT } from '../../constants/challenge'

const cases = [
  {
    name: '数字→アルファベット',
    Page: NumberToAlphaPage,
    drillName: '123-abc',
    mode: 'challenge',
    answer: () => generateNumberWord(null).question.answer,
  },
  {
    name: 'アルファベットシフト',
    Page: AlphaShiftPage,
    drillName: 'abc-shift',
    mode: 'challenge',
    answer: () => generateShift(null, true).question.answer,
  },
  {
    name: '五十音表の文字拾い',
    Page: GojuonPickPage,
    drillName: '50on-pick',
    mode: 'challenge',
    answer: () => generateGojuonWord(null).question.answer,
  },
  {
    name: '五十音表のスライド',
    Page: GojuonSlidePage,
    drillName: '50on-slide',
    mode: 'challenge',
    answer: () => generateSlideQuestion(null).question.answer,
  },
  ...['ほっかいどう', 'ホッカイドウ', 'ﾎｯｶｲﾄﾞｳ', '北海道'].map((answer) => ({
    name: `都道府県の穴埋め（${answer}）`,
    Page: PrefectureFillPage,
    drillName: 'prefecture-fill',
    mode: 'challenge',
    answer: () => answer,
  })),
  {
    name: '都道府県の形',
    Page: PrefectureShapePage,
    drillName: 'prefecture-shape',
    mode: 'prefecture-challenge',
    answer: () => '北海道',
  },
]

function answer(value: string) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: '回答する' }))
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('実力テストの得点・履歴・保存の整合性', () => {
  it.each(cases.map((testCase) => [testCase.name, testCase] as const))(
    '%sの正誤を得点・履歴・累計・最高記録に反映する',
    (_name, { Page, drillName, mode, answer: correctAnswer }) => {
      render(
        <StrictMode>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </StrictMode>,
      )
      fireEvent.click(screen.getByRole('button', { name: /実力テスト/ }))
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(1000)
        })
      }
      const value = correctAnswer()
      answer(value)
      const key = `${drillName}-${mode}-correctCount`
      expect(localStorage.getItem(key)).toBe('1')
      expect(screen.getByText('正解数').parentElement).toHaveTextContent(
        /^正解数\s*1$/,
      )
      answer('間違い')
      expect(localStorage.getItem(key)).toBe('1')
      expect(screen.getByText('-5秒')).toBeInTheDocument()
      expect(screen.getByText('40')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeEnabled()
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'また間違い' },
      })
      expect(screen.getByRole('button', { name: '回答する' })).toBeEnabled()
      // ペナルティ表示中のEnterも受け付け、再び5秒減らす。
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
      expect(screen.getByText('35')).toBeInTheDocument()
      expect(localStorage.getItem(key)).toBe('1')
      expect(screen.getByText('正解数').parentElement).toHaveTextContent(
        /^正解数\s*1$/,
      )
      act(() => {
        vi.advanceTimersByTime(CHALLENGE_TIME_LIMIT * 1000)
      })
      expect(
        screen.getByRole('heading', { name: '結果発表' }),
      ).toBeInTheDocument()
      expect(localStorage.getItem(`${drillName}-${mode}-highScore`)).toBe('1')
      const table = screen
        .getByRole('columnheader', { name: '結果' })
        .closest('table')!
      const rows = within(table)
        .getAllByRole('row')
        .filter((row) => row.closest('table') === table)
      expect(rows).toHaveLength(5)
      expect(rows[1].children[2]).toHaveTextContent(value)
      expect(within(rows[1]).getByText('✓')).toBeInTheDocument()
      expect(within(rows[2]).getByText('間違い')).toBeInTheDocument()
      expect(within(rows[2]).getByText('✗')).toBeInTheDocument()
      expect(within(rows[3]).getByText('また間違い')).toBeInTheDocument()
      expect(within(rows[3]).getByText('✗')).toBeInTheDocument()
      expect(within(rows[4]).getByText('-')).toBeInTheDocument()
    },
  )
})
