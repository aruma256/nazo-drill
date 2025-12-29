import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeButton } from './ModeButton'

describe('ModeButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('ボタンにモード名が表示される', () => {
    render(
      <ModeButton
        label="1文字モード"
        mode="single"
        drillName="123-abc"
        onClick={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: /1文字モード/ })).toBeDefined()
  })

  it('クリックするとonClickが呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <ModeButton
        label="1文字モード"
        mode="single"
        drillName="123-abc"
        onClick={onClick}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('ポイントが0の場合は「累計」「0」「問」が表示される', () => {
    render(
      <ModeButton
        label="1文字モード"
        mode="single"
        drillName="123-abc"
        onClick={() => {}}
      />,
    )
    // 新しいUIでは「累計」「0」「問」が別の要素に分かれている
    expect(screen.getByText('累計')).toBeDefined()
    expect(screen.getByText('0')).toBeDefined()
    expect(screen.getByText('問')).toBeDefined()
  })

  it('localStorageにポイントがある場合はその値が表示される', () => {
    localStorage.setItem('123-abc-single-correctCount', '42')
    render(
      <ModeButton
        label="1文字モード"
        mode="single"
        drillName="123-abc"
        onClick={() => {}}
      />,
    )
    // 新しいUIでは「累計」「42」「問」が別の要素に分かれている
    expect(screen.getByText('累計')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('問')).toBeDefined()
  })

  it('disabledの場合はクリックしてもonClickが呼ばれない', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <ModeButton
        label="中級（準備中）"
        mode="intermediate"
        drillName="abc-shift"
        onClick={onClick}
        disabled
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('disabledの場合はポイントが表示されない', () => {
    localStorage.setItem('abc-shift-intermediate-correctCount', '10')
    render(
      <ModeButton
        label="中級（準備中）"
        mode="intermediate"
        drillName="abc-shift"
        onClick={() => {}}
        disabled
      />,
    )
    expect(screen.queryByText(/累計/)).toBeNull()
  })

  describe('variant="challenge"（実力テスト）の場合', () => {
    it('最高記録が0の場合は「最高 0 問」が表示される', () => {
      render(
        <ModeButton
          label="実力テスト（45秒）"
          mode="challenge"
          drillName="123-abc"
          onClick={() => {}}
          variant="challenge"
        />,
      )
      expect(screen.getByText('最高')).toBeDefined()
      expect(screen.getByText('0')).toBeDefined()
      expect(screen.getByText('問')).toBeDefined()
      expect(screen.queryByText('pt')).toBeNull()
    })

    it('localStorageに最高記録がある場合はその値が表示される', () => {
      localStorage.setItem('123-abc-challenge-highScore', '8')
      render(
        <ModeButton
          label="実力テスト（45秒）"
          mode="challenge"
          drillName="123-abc"
          onClick={() => {}}
          variant="challenge"
        />,
      )
      expect(screen.getByText('最高')).toBeDefined()
      expect(screen.getByText('8')).toBeDefined()
      expect(screen.getByText('問')).toBeDefined()
    })
  })

  it('hidePointsがtrueの場合はポイント/最高記録が表示されない', () => {
    localStorage.setItem('123-abc-note-correctCount', '5')
    render(
      <ModeButton
        label="暗記ノート"
        mode="note"
        drillName="123-abc"
        onClick={() => {}}
        hidePoints
      />,
    )
    expect(screen.queryByText('累計')).toBeNull()
    expect(screen.queryByText('最高')).toBeNull()
  })
})
