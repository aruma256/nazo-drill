import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AlphaShiftPage } from '../AlphaShiftPage'
import { GojuonPickPage } from '../GojuonPickPage'
import { GojuonSlidePage } from '../GojuonSlidePage'
import { NumberToAlphaPage } from '../NumberToAlphaPage'
import { PrefectureFillPage } from '../PrefectureFillPage'
import { PrefectureShapePage } from '../PrefectureShapePage'
import { generateAlphaShiftQuestion } from '../../drills/alphaShift'
import {
  generateSingleQuestion as generateGojuonSingle,
  generateTaMoQuestion,
  generateWordQuestion as generateGojuonWord,
} from '../../drills/gojuonPick'
import { generateSlideQuestion } from '../../drills/gojuonSlide'
import {
  generateEjotyQuestion,
  generateSingleQuestion as generateNumberSingle,
  generateWordQuestion as generateNumberWord,
} from '../../drills/numberToAlpha'
import {
  generateNormalQuestion,
  generateOnePrefectureQuestion,
  generateTwoPrefecturesQuestion,
} from '../../drills/prefectureFill'
import { numberToAlpha } from '../../utils/conversion'

const cases = [
  {
    Page: AlphaShiftPage,
    drillName: 'abc-shift',
    modes: [
      {
        mode: 'plus-training',
        label: '+1～+3 特訓',
        answer: () =>
          generateAlphaShiftQuestion(null, 'plus-training').question.answer,
      },
      {
        mode: 'minus-training',
        label: '-1～-3 特訓',
        answer: () =>
          generateAlphaShiftQuestion(null, 'minus-training').question.answer,
      },
    ],
  },
  {
    Page: GojuonPickPage,
    drillName: '50on-pick',
    modes: [
      {
        mode: 'ta-mo',
        label: '「た」〜「も」特訓モード',
        answer: () => generateTaMoQuestion(null).question.answer,
      },
      {
        mode: 'single',
        label: '1文字モード',
        answer: () => generateGojuonSingle(null).question.answer,
      },
      {
        mode: 'word',
        label: '単語モード',
        answer: () => generateGojuonWord(null).question.answer,
      },
    ],
  },
  {
    Page: GojuonSlidePage,
    drillName: '50on-slide',
    modes: [
      {
        mode: 'practice',
        label: '練習モード',
        answer: () => generateSlideQuestion(null).question.answer,
      },
    ],
  },
  {
    Page: NumberToAlphaPage,
    drillName: '123-abc',
    modes: [
      {
        mode: 'ejoty',
        label: '"EJOTY"特訓モード',
        answer: () => generateEjotyQuestion(null).question.answer,
      },
      {
        mode: 'single',
        label: '1文字モード',
        answer: () => generateNumberSingle(null).question.answer,
      },
      {
        mode: 'word',
        label: '単語モード',
        answer: () => generateNumberWord(null).question.answer,
      },
    ],
  },
  {
    Page: PrefectureFillPage,
    drillName: 'prefecture-fill',
    modes: [
      {
        mode: 'normal',
        label: '穴埋めモード',
        answer: () => generateNormalQuestion(null).question.answer,
      },
      {
        mode: 'one-prefecture',
        label: '1県確定特訓',
        answer: () => generateOnePrefectureQuestion(null).question.answer,
      },
      {
        mode: 'two-prefectures',
        label: '2県確定特訓',
        answer: () => generateTwoPrefecturesQuestion(null).question.answer,
      },
    ],
  },
  {
    Page: PrefectureShapePage,
    drillName: 'prefecture-shape',
    modes: [
      {
        mode: 'prefecture',
        label: '都道府県の形：練習モード',
        answer: () => '北海道',
      },
    ],
  },
].flatMap(({ Page, drillName, modes }) =>
  modes.map((mode) => ({ Page, drillName, ...mode })),
)

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

describe('練習モードの共通進行', () => {
  it.each(cases)(
    '$drillName / $mode は答えを見た問題を加点せず、次問から回答を再開できる',
    ({ Page, drillName, mode, label, answer: correctAnswer }) => {
      const key = `${drillName}-${mode}-correctCount`
      localStorage.setItem(key, '3')
      render(
        <StrictMode>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </StrictMode>,
      )
      fireEvent.click(
        screen.getByRole('button', { name: (name) => name.includes(label) }),
      )
      const value = correctAnswer()

      answer('?')
      expect(screen.getByRole('button', { name: '答えを見る' })).toBeDisabled()
      fireEvent.click(screen.getByTestId('feedback-modal'))
      fireEvent.change(screen.getByRole('textbox'), { target: { value } })
      fireEvent.click(screen.getByRole('button', { name: '答えを見る' }))
      expect(screen.getByRole('status')).toHaveTextContent(value)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '回答する' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '答えを見る' }),
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '次の問題へ' })).toHaveFocus()
      expect(localStorage.getItem(key)).toBe('3')

      vi.mocked(Math.random).mockReturnValue(0.5)
      fireEvent.click(screen.getByRole('button', { name: '次の問題へ' }))
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveValue('')
      expect(screen.getByRole('textbox')).toHaveFocus()
      expect(screen.getByRole('button', { name: '答えを見る' })).toBeEnabled()
      answer(value)
      expect(screen.getByText('もう一度！')).toBeInTheDocument()
      expect(localStorage.getItem(key)).toBe('3')
      fireEvent.click(screen.getByTestId('feedback-modal'))
      fireEvent.click(screen.getByRole('button', { name: '答えを見る' }))
      const nextAnswer = screen.getByRole('status').textContent
      vi.mocked(Math.random).mockReturnValue(0)
      fireEvent.click(screen.getByRole('button', { name: '次の問題へ' }))
      answer(value)
      expect(screen.getByText('正解！')).toBeInTheDocument()
      expect(nextAnswer).not.toBe(value)
      expect(localStorage.getItem(key)).toBe('4')
    },
  )

  it('EJOTYのヒントは5問目まで維持し、6問目からフェードする', () => {
    render(
      <StrictMode>
        <MemoryRouter>
          <NumberToAlphaPage />
        </MemoryRouter>
      </StrictMode>,
    )
    fireEvent.click(screen.getByRole('button', { name: /EJOTY/ }))
    const hint = screen.getByText('E, J, O, T, Y = 5, 10, 15, 20, 25')
    for (let question = 1; question <= 5; question++) {
      expect(hint).not.toHaveClass('opacity-0')
      const number = Number(screen.getByText(/^(5|10|15|20|25)$/).textContent)
      answer(numberToAlpha(number))
      fireEvent.click(screen.getByTestId('feedback-modal'))
    }
    expect(hint).toHaveClass('opacity-0')
    expect(localStorage.getItem('123-abc-ejoty-correctCount')).toBe('5')
  })

  it.each(cases)(
    '$drillName / $mode は誤答後に同じ問題を続け、正答後に次問へ進む',
    ({ Page, drillName, mode, label, answer: correctAnswer }) => {
      render(
        <StrictMode>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </StrictMode>,
      )
      fireEvent.click(
        screen.getByRole('button', { name: (name) => name.includes(label) }),
      )
      const key = `${drillName}-${mode}-correctCount`
      const value = correctAnswer()

      fireEvent.change(screen.getByRole('textbox'), { target: { value: ' ' } })
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
      expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
      expect(localStorage.getItem(key)).toBeNull()

      answer('?')
      expect(screen.getByText('もう一度！')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeDisabled()
      expect(localStorage.getItem(key)).toBeNull()
      fireEvent.click(screen.getByTestId('feedback-modal'))
      expect(screen.getByRole('textbox')).toHaveValue('')
      expect(screen.getByRole('textbox')).toHaveFocus()

      answer(value)
      expect(screen.getByText('正解！')).toBeInTheDocument()
      expect(localStorage.getItem(key)).toBe('1')
      vi.mocked(Math.random).mockReturnValue(0.5)
      fireEvent.click(screen.getByTestId('feedback-modal'))

      // 同じ答えで再度正解してしまわないことから、次問への切り替えも確認する。
      answer(value)
      expect(screen.getByText('もう一度！')).toBeInTheDocument()
      expect(localStorage.getItem(key)).toBe('1')
      fireEvent.click(screen.getByTestId('feedback-modal'))
      fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
      expect(
        screen.getByRole('button', { name: (name) => name.includes(label) }),
      ).toHaveTextContent('累計1問')
    },
  )
})
