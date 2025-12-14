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

  it('ポイントが0の場合は「0 pt」と表示される', () => {
    render(
      <ModeButton
        label="1文字モード"
        mode="single"
        drillName="123-abc"
        onClick={() => {}}
      />,
    )
    expect(screen.getByText('0 pt')).toBeDefined()
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
    expect(screen.getByText('42 pt')).toBeDefined()
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
    expect(screen.queryByText(/pt/)).toBeNull()
  })
})
