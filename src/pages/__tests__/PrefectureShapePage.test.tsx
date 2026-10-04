import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrefectureShapePage } from '../PrefectureShapePage'
import { CHALLENGE_TIME_LIMIT } from '../../constants/challenge'

function renderPage() {
  return render(
    <StrictMode>
      <MemoryRouter>
        <PrefectureShapePage />
      </MemoryRouter>
    </StrictMode>,
  )
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

describe('都道府県の形の画面', () => {
  it('都道府県名の練習・実力テストだけを選べ、保存済みの記録を表示する', () => {
    localStorage.setItem('prefecture-shape-prefecture-correctCount', '7')
    localStorage.setItem('prefecture-shape-prefecture-challenge-highScore', '3')
    renderPage()
    expect(
      screen.getByRole('heading', { name: '都道府県の形' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: /都道府県名の練習/ }),
    ).toHaveTextContent('累計7問')
    expect(
      screen.getByRole('button', { name: /都道府県名の実力テスト/ }),
    ).toHaveTextContent('最高3問')
    expect(document.body).not.toHaveTextContent('県庁所在地')
    expect(
      screen.getByRole('link', { name: '国土地理院「地球地図日本」' }),
    ).toHaveAttribute('href', 'https://www.gsi.go.jp/kankyochiri/gm_jpn.html')
  })

  it('不正解時は形を維持し、正解してから次の問題へ進む', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    const path = () =>
      screen.getByRole('img').querySelector('path')!.getAttribute('d')
    const firstShape = path()
    expect(screen.queryByText('北海道')).not.toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAccessibleName('出題中の都道府県の形')
    answer('青森')
    expect(screen.getByText('もう一度！')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('feedback-modal'))
    expect(path()).toBe(firstShape)
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBeNull()
    answer('ホッカイドウ')
    expect(screen.getByText('正解！')).toBeInTheDocument()
    expect(screen.getByTestId('modal-hint')).toHaveTextContent(/^北海道$/)
    expect(document.body).not.toHaveTextContent('県庁所在地')
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBe('1')
    fireEvent.click(screen.getByTestId('feedback-modal'))
    expect(path()).not.toBe(firstShape)
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
    expect(
      screen.getByRole('button', { name: /都道府県名の練習/ }),
    ).toHaveTextContent('累計1問')
  })

  it('答えを見ると都道府県名を表示し、ポイントを加算しない', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'わからないので答えを見る' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(/^北海道$/)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '次の問題へ' }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'わからないので答えを見る' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent('青森県')
  })

  it('日本語変換中のEnterでは送信しない', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '北海道' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false })
    expect(screen.getByText('正解！')).toBeInTheDocument()
  })

  it('実力テストの記録・履歴・再挑戦が動く', () => {
    vi.useFakeTimers()
    renderPage()
    fireEvent.click(
      screen.getByRole('button', {
        name: /都道府県名の実力テスト/,
      }),
    )
    for (let i = 0; i < 3; i++)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    answer('ホッカイドウ')
    expect(
      localStorage.getItem(
        'prefecture-shape-prefecture-challenge-correctCount',
      ),
    ).toBe('1')
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
    answer('間違い')
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: '回答する' })).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime((CHALLENGE_TIME_LIMIT - 5) * 1000)
    })
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(
      localStorage.getItem('prefecture-shape-prefecture-challenge-highScore'),
    ).toBe('1')
    const rows = screen.getAllByRole('row')
    expect(
      within(rows[1]).getByRole('img', { name: '北海道の形' }),
    ).toBeInTheDocument()
    expect(within(rows[1]).getByText('ホッカイドウ')).toBeInTheDocument()
    expect(rows).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'もう一度チャレンジ' }))
    for (let i = 0; i < 3; i++)
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(
      screen.queryByRole('heading', { name: '結果発表' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
    expect(
      screen.getByRole('button', {
        name: /都道府県名の実力テスト/,
      }),
    ).toHaveTextContent('最高1問')
  })
})
