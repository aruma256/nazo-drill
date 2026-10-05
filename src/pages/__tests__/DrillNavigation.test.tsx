import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AlphaShiftPage } from '../AlphaShiftPage'
import { GojuonPickPage } from '../GojuonPickPage'
import { GojuonSlidePage } from '../GojuonSlidePage'
import { MagicSquarePage } from '../MagicSquarePage'
import { NumberToAlphaPage } from '../NumberToAlphaPage'
import { PrefectureFillPage } from '../PrefectureFillPage'
import { PrefectureShapePage } from '../PrefectureShapePage'
import {
  CHALLENGE_COUNTDOWN_SECONDS,
  CHALLENGE_TIME_LIMIT,
} from '../../constants/challenge'

const pages = [
  { Page: AlphaShiftPage, title: 'アルファベットシフト' },
  { Page: GojuonPickPage, title: '五十音表の文字拾い' },
  { Page: GojuonSlidePage, title: '五十音表スライド' },
  { Page: MagicSquarePage, title: '3×3魔方陣' },
  { Page: NumberToAlphaPage, title: '数字→アルファベット' },
  { Page: PrefectureFillPage, title: '都道府県名の穴埋め' },
  { Page: PrefectureShapePage, title: '都道府県の形' },
]

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

function completeCountdown() {
  for (let second = 0; second < CHALLENGE_COUNTDOWN_SECONDS; second++) {
    advance(1000)
  }
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

describe('ドリルページの共通画面遷移', () => {
  it.each(pages)(
    '$titleは時間切れ・再挑戦・中断・再開を経てもタイマーと結果をリセットする',
    ({ Page, title }) => {
      render(
        <StrictMode>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </StrictMode>,
      )
      fireEvent.click(screen.getByRole('button', { name: /実力テスト/ }))
      completeCountdown()
      advance(CHALLENGE_TIME_LIMIT * 1000)
      expect(
        screen.getByRole('heading', { name: '結果発表' }),
      ).toBeInTheDocument()
      expect(screen.queryByText('解答履歴')).not.toBeInTheDocument()

      fireEvent.click(
        screen.getByRole('button', { name: 'もう一度チャレンジ' }),
      )
      expect(
        screen.queryByRole('heading', { name: '結果発表' }),
      ).not.toBeInTheDocument()
      completeCountdown()
      expect(screen.getByText(String(CHALLENGE_TIME_LIMIT))).toBeInTheDocument()
      expect(screen.getByText('正解数').parentElement).toHaveTextContent(
        /^正解数\s*0$/,
      )
      advance(1000)
      fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
      advance(CHALLENGE_TIME_LIMIT * 1000)
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /実力テスト/ }))
      completeCountdown()
      expect(screen.getByText(String(CHALLENGE_TIME_LIMIT))).toBeInTheDocument()
      advance(CHALLENGE_TIME_LIMIT * 1000)
      fireEvent.click(screen.getByRole('button', { name: 'モード選択に戻る' }))
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    },
  )

  it.each([
    { Page: NumberToAlphaPage, title: '数字→アルファベット' },
    { Page: PrefectureFillPage, title: '都道府県名の穴埋め' },
  ])('$titleの暗記ノートを開いて開始画面へ戻れる', ({ Page, title }) => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /暗記ノート/ }))
    expect(screen.getByText('暗記ノート')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: title }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })
})
