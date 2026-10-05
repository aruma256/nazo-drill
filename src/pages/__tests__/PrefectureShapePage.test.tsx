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

  it('地方名、読みの頭文字の順にヒントを表示し、入力と出題を維持する', () => {
    vi.mocked(Math.random).mockReturnValue(12.5 / 47)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    const firstShape = screen
      .getByRole('img')
      .querySelector('path')!
      .getAttribute('d')
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'とう' },
    })
    expect(screen.queryByText('関東地方')).not.toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'ヒント2を見る' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ヒント1を見る' }))
    expect(screen.getByText('関東地方')).toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ヒント2を見る' }))
    expect(screen.getByText('関東地方')).toBeInTheDocument()
    expect(screen.getByText(/頭文字は「と」/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /ヒント.*を見る/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('東京都')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('とう')
    expect(
      screen.getByRole('img').querySelector('path')!.getAttribute('d'),
    ).toBe(firstShape)
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBeNull()
  })

  it('不正解時はヒントを維持し、正解して次の問題に進むとリセットする', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    fireEvent.click(screen.getByRole('button', { name: 'ヒント1を見る' }))
    answer('間違い')
    expect(screen.getByRole('button', { name: 'ヒント2を見る' })).toBeDisabled()
    fireEvent.click(screen.getByTestId('feedback-modal'))
    expect(screen.getByText('北海道地方')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ヒント2を見る' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'ヒント2を見る' }))
    expect(screen.getByText(/頭文字は「ほ」/)).toBeInTheDocument()

    answer('北海道')
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBe('1')
    fireEvent.click(screen.getByTestId('feedback-modal'))
    expect(screen.getByRole('button', { name: 'ヒント1を見る' })).toBeEnabled()
    expect(screen.queryByText(/ヒント1：/)).not.toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ヒント1を見る' }))
    expect(screen.getByText('東北地方')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ヒント2を見る' }))
    expect(screen.getByText(/頭文字は「あ」/)).toBeInTheDocument()
  })

  it('答えを見ると都道府県名を表示し、ポイントを加算しない', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /都道府県名の練習/ }))
    fireEvent.click(screen.getByRole('button', { name: 'ヒント1を見る' }))
    fireEvent.click(screen.getByRole('button', { name: 'ヒント2を見る' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'わからないので答えを見る' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(/^北海道$/)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByText(/ヒント1：/)).not.toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
    expect(
      localStorage.getItem('prefecture-shape-prefecture-correctCount'),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '次の問題へ' }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ヒント1を見る' })).toBeEnabled()
    expect(screen.queryByText(/ヒント1：/)).not.toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
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
    expect(
      screen.queryByRole('button', { name: /ヒント.*を見る/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/ヒント1：/)).not.toBeInTheDocument()
    expect(screen.queryByText(/頭文字は/)).not.toBeInTheDocument()
    answer('ホッカイドウ')
    expect(
      localStorage.getItem(
        'prefecture-shape-prefecture-challenge-correctCount',
      ),
    ).toBe('1')
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
    answer('間違い')
    expect(screen.getByRole('textbox')).toBeEnabled()
    expect(screen.getByRole('button', { name: '回答する' })).toBeDisabled()
    expect(screen.getByText('-5秒')).toBeInTheDocument()
    // ペナルティ表示が終わる前に、次の問題に正答できる。
    answer('北海道')
    expect(
      localStorage.getItem(
        'prefecture-shape-prefecture-challenge-correctCount',
      ),
    ).toBe('2')
    expect(screen.getByText('-5秒')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime((CHALLENGE_TIME_LIMIT - 5) * 1000)
    })
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(
      localStorage.getItem('prefecture-shape-prefecture-challenge-highScore'),
    ).toBe('2')
    const rows = screen.getAllByRole('row')
    expect(
      within(rows[1]).getByRole('img', { name: '北海道の形' }),
    ).toBeInTheDocument()
    expect(within(rows[1]).getByText('ホッカイドウ')).toBeInTheDocument()
    expect(within(rows[3]).getByText('✓')).toBeInTheDocument()
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
    ).toHaveTextContent('最高2問')
  })
})
