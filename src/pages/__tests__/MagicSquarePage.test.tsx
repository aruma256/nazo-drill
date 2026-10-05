import { StrictMode } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MagicSquarePage } from '../MagicSquarePage'

function renderPage() {
  return render(
    <StrictMode>
      <MemoryRouter>
        <MagicSquarePage />
      </MemoryRouter>
    </StrictMode>,
  )
}

function cell(index: number) {
  return within(screen.getByRole('group', { name: '3×3魔方陣' })).getByRole(
    'button',
    {
      name: new RegExp(`^${Math.floor(index / 3) + 1}行${(index % 3) + 1}列、`),
    },
  )
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

function startChallenge() {
  fireEvent.click(screen.getByRole('button', { name: /魔方陣の実力テスト/ }))
  for (let i = 0; i < 3; i++) advance(1000)
}

// 最初の完成形は 8 1 6 / 3 5 7 / 4 9 2。見えている数字は飛ばす。
function completeFirstBoard(givenNumbers: readonly number[]) {
  const solution = [8, 1, 6, 3, 5, 7, 4, 9, 2]
  for (let number = 1; number <= 9; number++) {
    if (!givenNumbers.includes(number)) {
      expect(screen.getByRole('status')).toHaveTextContent(`${number}を置こう`)
      fireEvent.click(cell(solution.indexOf(number)))
    }
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

describe('3×3魔方陣の画面', () => {
  it('実力テストと練習3パターンを表示し、それぞれの記録を読み込む', () => {
    localStorage.setItem('magic-square-first-three-correctCount', '2')
    localStorage.setItem('magic-square-three-clues-correctCount', '3')
    localStorage.setItem('magic-square-two-clues-correctCount', '4')
    localStorage.setItem('magic-square-two-clues-challenge-highScore', '5')
    renderPage()
    expect(
      screen.getByRole('heading', { name: '3×3魔方陣' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(
      screen.getByRole('button', { name: /1・2・3が埋まっている/ }),
    ).toHaveTextContent('累計2問')
    expect(
      screen.getByRole('button', { name: /3マス埋まっている魔方陣の練習/ }),
    ).toHaveTextContent('累計3問')
    expect(
      screen.getByRole('button', { name: /2マス埋まっている魔方陣の練習/ }),
    ).toHaveTextContent('累計4問')
    expect(
      screen.getByRole('button', { name: /魔方陣の実力テスト/ }),
    ).toHaveTextContent('最高5問')
  })

  it.each([
    ['1・2・3が埋まっている', 'first-three', [1, 2, 3]],
    ['3マス埋まっている', 'three-clues', [8, 1, 6]],
    ['2マス埋まっている', 'two-clues', [8, 1]],
  ] as const)(
    '%s練習では数字を飛ばしながら昇順に置き、完成時だけ1問加算する',
    (label, mode, givens) => {
      renderPage()
      fireEvent.click(
        screen.getByRole('button', { name: `${label}魔方陣の練習` }),
      )
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(
        within(screen.getByRole('group'))
          .getAllByRole('button')
          .filter((button) => button.hasAttribute('disabled')),
      ).toHaveLength(givens.length)
      expect(
        localStorage.getItem(`magic-square-${mode}-correctCount`),
      ).toBeNull()
      completeFirstBoard(givens)
      expect(screen.getByRole('status')).toHaveTextContent('正解！')
      expect(localStorage.getItem(`magic-square-${mode}-correctCount`)).toBe(
        '1',
      )
      fireEvent.click(cell(7))
      expect(localStorage.getItem(`magic-square-${mode}-correctCount`)).toBe(
        '1',
      )
      advance(600)
      expect(screen.getByRole('status')).toHaveTextContent('を置こう')
      expect(cell(7)).not.toHaveTextContent('9')
      fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
      expect(
        screen.getByRole('button', { name: `${label}魔方陣の練習` }),
      ).toHaveTextContent('累計1問')
    },
  )

  it('間違えたマスに×を表示し、盤面と置く数字を維持して再回答できる', () => {
    renderPage()
    fireEvent.click(
      screen.getByRole('button', { name: /1・2・3が埋まっている/ }),
    )
    fireEvent.click(cell(2))
    expect(cell(2)).toHaveTextContent('×')
    expect(cell(2)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('4を置こう')
    expect(cell(6)).toBeDisabled()
    expect(
      localStorage.getItem('magic-square-first-three-correctCount'),
    ).toBeNull()
    advance(350)
    expect(cell(2)).not.toHaveTextContent('×')
    fireEvent.click(cell(6))
    expect(cell(6)).toHaveTextContent('4')
    expect(screen.getByRole('status')).toHaveTextContent('5を置こう')
    expect(
      localStorage.getItem('magic-square-first-three-correctCount'),
    ).toBeNull()
  })

  it('答えを見ると完成形を表示して停止し、ポイントは加算しない', () => {
    renderPage()
    fireEvent.click(
      screen.getByRole('button', { name: /1・2・3が埋まっている/ }),
    )
    fireEvent.click(cell(6))
    fireEvent.click(
      screen.getByRole('button', { name: 'わからないので答えを見る' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent('答えを確認しよう')
    expect(cell(0)).toHaveTextContent('8')
    expect(cell(7)).toHaveTextContent('9')
    advance(1000)
    expect(screen.getByRole('status')).toHaveTextContent('答えを確認しよう')
    expect(
      localStorage.getItem('magic-square-first-three-correctCount'),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '次の問題へ' }))
    expect(screen.getByRole('status')).toHaveTextContent('4を置こう')
    expect(cell(0)).toHaveAccessibleName('1行1列、空欄')
  })

  it('実力テストは2マス提示で、ペナルティ表示中も同じ盤面に再回答できる', () => {
    renderPage()
    startChallenge()
    expect(cell(0)).toHaveTextContent('8')
    expect(cell(1)).toHaveTextContent('1')
    expect(screen.getByRole('status')).toHaveTextContent('2を置こう')
    expect(
      screen.queryByRole('button', { name: /答えを見る/ }),
    ).not.toBeInTheDocument()
    fireEvent.click(cell(2))
    expect(screen.getByText('-5秒')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(cell(8)).toBeEnabled()
    expect(cell(0)).toHaveTextContent('8')
    expect(screen.getByRole('status')).toHaveTextContent('2を置こう')
    fireEvent.click(cell(8))
    expect(screen.getByRole('status')).toHaveTextContent('3を置こう')
    expect(cell(2)).not.toHaveTextContent('×')
    expect(screen.getByText('-5秒')).toBeInTheDocument()
    advance(40000)
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(screen.getByText('時間切れ')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /^1問目の回答/ }),
    ).toHaveAccessibleName(
      '1問目の回答：8、1、空欄、空欄、空欄、空欄、空欄、空欄、2',
    )
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-correctCount'),
    ).toBeNull()
  })

  it('ペナルティ表示中の連続誤答でも残り時間を5秒ずつ減らし、すぐに盤面を完成できる', () => {
    renderPage()
    startChallenge()
    fireEvent.click(cell(2))
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(cell(2)).toBeEnabled()
    fireEvent.click(cell(2))
    expect(screen.getByText('35')).toBeInTheDocument()
    completeFirstBoard([8, 1])
    expect(screen.getByRole('status')).toHaveTextContent('正解！')
    expect(screen.getByText('-5秒')).toBeInTheDocument()
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-correctCount'),
    ).toBe('1')
    advance(35000)
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-highScore'),
    ).toBe('1')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('○ 完成')).toBeInTheDocument()
  })

  it('連続誤答のペナルティで時間切れになったら操作を終了する', () => {
    renderPage()
    startChallenge()
    for (let i = 0; i < 9; i++) fireEvent.click(cell(2))
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-correctCount'),
    ).toBeNull()
  })

  it('完成した盤面数を記録し、結果・再挑戦・最高記録の表示が動く', () => {
    renderPage()
    startChallenge()
    completeFirstBoard([8, 1])
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-correctCount'),
    ).toBe('1')
    advance(600)
    fireEvent.click(cell(5)) // 次の盤面の1を置き、途中までの回答も記録する。
    expect(screen.getByRole('status')).toHaveTextContent('2を置こう')
    advance(45000)
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-highScore'),
    ).toBe('1')
    expect(screen.getByText('○ 完成')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(
      screen.getByRole('img', { name: /^2問目の回答/ }),
    ).toHaveAccessibleName(
      '2問目の回答：4、3、空欄、空欄、空欄、1、空欄、空欄、空欄',
    )
    fireEvent.click(screen.getByRole('button', { name: 'もう一度チャレンジ' }))
    for (let i = 0; i < 3; i++) advance(1000)
    expect(screen.getByRole('status')).toHaveTextContent('2を置こう')
    expect(cell(8)).toHaveAccessibleName('3行3列、空欄')
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
    expect(
      screen.getByRole('button', { name: /魔方陣の実力テスト/ }),
    ).toHaveTextContent('最高1問')
  })

  it('完成直後の正解表示中に時間切れになっても、その盤面を二重記録しない', () => {
    renderPage()
    startChallenge()
    advance(44500)
    completeFirstBoard([8, 1])
    advance(500)
    expect(
      screen.getByRole('heading', { name: '結果発表' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.queryByText('時間切れ')).not.toBeInTheDocument()
    expect(
      localStorage.getItem('magic-square-two-clues-challenge-highScore'),
    ).toBe('1')
  })

  it('やめた後に正解表示のタイマーが動いても開始画面を維持する', () => {
    renderPage()
    fireEvent.click(
      screen.getByRole('button', { name: /1・2・3が埋まっている/ }),
    )
    completeFirstBoard([1, 2, 3])
    fireEvent.click(screen.getByRole('button', { name: 'やめる' }))
    advance(1000)
    expect(
      screen.getByRole('heading', { name: '3×3魔方陣' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })
})
