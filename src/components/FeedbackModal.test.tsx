import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { FeedbackModal } from './FeedbackModal'

describe('FeedbackModal', () => {
  describe('正解時', () => {
    it('「正解！」と表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.getByText('正解！')).toBeInTheDocument()
    })

    it('緑色のテキストで表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      const message = screen.getByText('正解！')
      expect(message).toHaveClass('text-emerald-600')
    })

    it('「タップして次へ」が表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.getByText('タップして次へ')).toBeInTheDocument()
    })
  })

  describe('リトライ時', () => {
    it('「もう一度！」と表示される', () => {
      render(<FeedbackModal isOpen={true} type="retry" onNext={vi.fn()} />)
      expect(screen.getByText('もう一度！')).toBeInTheDocument()
    })

    it('オレンジ色のテキストで表示される', () => {
      render(<FeedbackModal isOpen={true} type="retry" onNext={vi.fn()} />)
      const message = screen.getByText('もう一度！')
      expect(message).toHaveClass('text-amber-600')
    })

    it('「タップしてもう一度」が表示される', () => {
      render(<FeedbackModal isOpen={true} type="retry" onNext={vi.fn()} />)
      expect(screen.getByText('タップしてもう一度')).toBeInTheDocument()
    })
  })

  describe('補助情報（hintContent）', () => {
    it('hintContentが指定されている場合、補助情報が表示される', () => {
      render(
        <FeedbackModal
          isOpen={true}
          type="correct"
          hintContent="A = 1"
          onNext={vi.fn()}
        />,
      )
      expect(screen.getByText('A = 1')).toBeInTheDocument()
    })

    it('hintContentが未指定の場合、補助情報は表示されない', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.queryByTestId('modal-hint')).not.toBeInTheDocument()
    })
  })

  describe('次の問題への遷移', () => {
    it('モーダルをクリックするとonNextが呼ばれる', () => {
      const onNext = vi.fn()
      render(<FeedbackModal isOpen={true} type="correct" onNext={onNext} />)
      const modal = screen.getByTestId('feedback-modal')
      fireEvent.click(modal)
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('Enterキーを押すとonNextが呼ばれる', async () => {
      const onNext = vi.fn()
      render(<FeedbackModal isOpen={true} type="correct" onNext={onNext} />)
      // requestAnimationFrameコールバックが実行されるのを待つ
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      })
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('Spaceキーを押すとonNextが呼ばれる', async () => {
      const onNext = vi.fn()
      render(<FeedbackModal isOpen={true} type="correct" onNext={onNext} />)
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      })
      fireEvent.keyDown(document, { key: ' ' })
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('Escapeキーを押すとonNextが呼ばれる', async () => {
      const onNext = vi.fn()
      render(<FeedbackModal isOpen={true} type="correct" onNext={onNext} />)
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      })
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('モーダルの表示状態', () => {
    it('isOpen=falseの場合、モーダルは表示されない', () => {
      render(<FeedbackModal isOpen={false} type="correct" onNext={vi.fn()} />)
      expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
    })

    it('isOpen=trueの場合、モーダルが表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.getByTestId('feedback-modal')).toBeInTheDocument()
    })
  })
})
