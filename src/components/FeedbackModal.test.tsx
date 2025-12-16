import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { FeedbackModal } from './FeedbackModal'

describe('FeedbackModal', () => {
  describe('正解時', () => {
    it('「✓ 正解！」と表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.getByText('✓ 正解！')).toBeInTheDocument()
    })

    it('緑色のテキストで表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      const message = screen.getByText('✓ 正解！')
      expect(message).toHaveClass('text-green-600')
    })
  })

  describe('不正解時', () => {
    it('「✗ 不正解」と正解が表示される', () => {
      render(
        <FeedbackModal
          isOpen={true}
          type="incorrect"
          correctAnswer="A"
          onNext={vi.fn()}
        />,
      )
      expect(screen.getByText('✗ 不正解')).toBeInTheDocument()
      expect(screen.getByText(/正解は「A」/)).toBeInTheDocument()
    })

    it('赤色のテキストで表示される', () => {
      render(
        <FeedbackModal
          isOpen={true}
          type="incorrect"
          correctAnswer="A"
          onNext={vi.fn()}
        />,
      )
      const message = screen.getByText('✗ 不正解')
      expect(message).toHaveClass('text-red-600')
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

  describe('「タップして次へ」', () => {
    it('「タップして次へ」が表示される', () => {
      render(<FeedbackModal isOpen={true} type="correct" onNext={vi.fn()} />)
      expect(screen.getByText('タップして次へ')).toBeInTheDocument()
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

  describe('不正解時の待機機能（delayOnIncorrect）', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('delayOnIncorrectが指定されている場合', () => {
      it('不正解時、待機中は「タップして次へ」が非表示', () => {
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={vi.fn()}
          />,
        )
        expect(screen.queryByText('タップして次へ')).not.toBeInTheDocument()
      })

      it('不正解時、プログレスバーが表示される', () => {
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={vi.fn()}
          />,
        )
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
      })

      it('待機中はクリックしてもonNextが呼ばれない', () => {
        const onNext = vi.fn()
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={onNext}
          />,
        )
        fireEvent.click(screen.getByTestId('feedback-modal'))
        expect(onNext).not.toHaveBeenCalled()
      })

      it('待機中はEnterキーを押してもonNextが呼ばれない', () => {
        const onNext = vi.fn()
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={onNext}
          />,
        )
        // requestAnimationFrameコールバックが実行されるのを待つ
        act(() => {
          vi.advanceTimersByTime(16) // 1フレーム分
        })
        fireEvent.keyDown(document, { key: 'Enter' })
        expect(onNext).not.toHaveBeenCalled()
      })

      it('待機時間経過後、クリックでonNextが呼ばれる', () => {
        const onNext = vi.fn()
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={onNext}
          />,
        )

        // 3秒経過
        act(() => {
          vi.advanceTimersByTime(3000)
        })

        // 経過後は呼ばれる
        fireEvent.click(screen.getByTestId('feedback-modal'))
        expect(onNext).toHaveBeenCalledTimes(1)
      })

      it('待機時間経過後、「タップして次へ」が再表示される', () => {
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            delayOnIncorrect={3000}
            onNext={vi.fn()}
          />,
        )

        // 待機中は非表示
        expect(screen.queryByText('タップして次へ')).not.toBeInTheDocument()

        // 3秒経過
        act(() => {
          vi.advanceTimersByTime(3000)
        })

        // 経過後は表示
        expect(screen.getByText('タップして次へ')).toBeInTheDocument()
      })

      it('正解時は待機せず即座にonNextが呼べる', () => {
        const onNext = vi.fn()
        render(
          <FeedbackModal
            isOpen={true}
            type="correct"
            delayOnIncorrect={3000}
            onNext={onNext}
          />,
        )

        // 正解時は「タップして次へ」がすぐに表示される
        expect(screen.getByText('タップして次へ')).toBeInTheDocument()

        // クリックで即座に呼ばれる
        fireEvent.click(screen.getByTestId('feedback-modal'))
        expect(onNext).toHaveBeenCalledTimes(1)
      })
    })

    describe('delayOnIncorrectが未指定の場合（後方互換性）', () => {
      it('不正解時も即座にonNextが呼べる', () => {
        const onNext = vi.fn()
        render(
          <FeedbackModal
            isOpen={true}
            type="incorrect"
            correctAnswer="A"
            onNext={onNext}
          />,
        )

        // 「タップして次へ」が表示されている
        expect(screen.getByText('タップして次へ')).toBeInTheDocument()

        // クリックで即座に呼ばれる
        fireEvent.click(screen.getByTestId('feedback-modal'))
        expect(onNext).toHaveBeenCalledTimes(1)
      })
    })
  })
})
