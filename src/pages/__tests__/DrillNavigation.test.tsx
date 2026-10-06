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
  {
    Page: AlphaShiftPage,
    title: 'アルファベットシフト',
    drillName: 'abc-shift',
    challengeMode: 'challenge',
    modes: [
      { mode: 'plus-training', label: '+1～+3 特訓' },
      { mode: 'minus-training', label: '-1～-3 特訓' },
    ],
    hasNote: false,
  },
  {
    Page: GojuonPickPage,
    title: '五十音表の文字拾い',
    drillName: '50on-pick',
    challengeMode: 'challenge',
    modes: [
      { mode: 'ta-mo', label: '「た」〜「も」特訓モード' },
      { mode: 'single', label: '1文字モード' },
      { mode: 'word', label: '単語モード' },
    ],
    hasNote: false,
  },
  {
    Page: GojuonSlidePage,
    title: '五十音表スライド',
    drillName: '50on-slide',
    challengeMode: 'challenge',
    modes: [{ mode: 'practice', label: '練習モード' }],
    hasNote: false,
  },
  {
    Page: MagicSquarePage,
    title: '3×3魔方陣',
    drillName: 'magic-square',
    challengeMode: 'two-clues-challenge',
    modes: [
      { mode: 'first-three', label: '1・2・3が埋まっている' },
      { mode: 'three-clues', label: '3マス埋まっている' },
      { mode: 'two-clues', label: '2マス埋まっている' },
    ],
    hasNote: false,
  },
  {
    Page: NumberToAlphaPage,
    title: '数字→アルファベット',
    drillName: '123-abc',
    challengeMode: 'challenge',
    modes: [
      { mode: 'ejoty', label: '"EJOTY"特訓モード' },
      { mode: 'single', label: '1文字モード' },
      { mode: 'word', label: '単語モード' },
    ],
    hasNote: true,
  },
  {
    Page: PrefectureFillPage,
    title: '都道府県名の穴埋め',
    drillName: 'prefecture-fill',
    challengeMode: 'challenge',
    modes: [
      { mode: 'normal', label: '穴埋めモード' },
      { mode: 'one-prefecture', label: '1県確定特訓' },
      { mode: 'two-prefectures', label: '2県確定特訓' },
    ],
    hasNote: true,
  },
  {
    Page: PrefectureShapePage,
    title: '都道府県の形',
    drillName: 'prefecture-shape',
    challengeMode: 'prefecture-challenge',
    modes: [{ mode: 'prefecture', label: '練習モード' }],
    hasNote: false,
  },
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
    '$titleの開始画面はモード順と読み上げ名を揃え、保存済み記録を引き継ぐ',
    ({ Page, title, drillName, challengeMode, modes, hasNote }) => {
      localStorage.setItem(`${drillName}-${challengeMode}-highScore`, '11')
      localStorage.setItem(`${drillName}-note-correctCount`, '99')
      modes.forEach(({ mode }, index) => {
        localStorage.setItem(
          `${drillName}-${mode}-correctCount`,
          String(index + 2),
        )
      })
      render(
        <MemoryRouter>
          <Page />
        </MemoryRouter>,
      )

      expect(
        screen.getByRole('heading', { name: 'ルール' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'モードを選択' }),
      ).toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1 + modes.length + (hasNote ? 1 : 0))
      expect(buttons[0]).toHaveAccessibleName(
        `${title}：実力テスト（${CHALLENGE_TIME_LIMIT}秒）`,
      )
      expect(buttons[0]).toHaveTextContent('最高11問')
      modes.forEach(({ label }, index) => {
        expect(buttons[index + 1]).toHaveAccessibleName(`${title}：${label}`)
        expect(buttons[index + 1]).toHaveTextContent(`累計${index + 2}問`)
      })
      if (hasNote) {
        const noteButton = buttons.at(-1)!
        expect(noteButton).toHaveAccessibleName(`${title}：暗記ノート`)
        expect(noteButton).not.toHaveTextContent('累計')
        expect(noteButton).not.toHaveTextContent('最高')
      }
    },
  )

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
      expect(
        screen.queryByRole('button', { name: '答えを見る' }),
      ).not.toBeInTheDocument()
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
