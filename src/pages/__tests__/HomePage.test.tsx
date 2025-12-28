import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '../HomePage'

describe('HomePage', () => {
  const renderHomePage = () =>
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

  it('タイトル「ナゾドリル」が表示される', () => {
    renderHomePage()
    expect(
      screen.getByRole('heading', { name: /ナゾドリル/, level: 1 }),
    ).toBeInTheDocument()
  })

  it('サブタイトルが表示される', () => {
    renderHomePage()
    expect(screen.getByText(/謎解きの定番変換パターン/)).toBeInTheDocument()
  })

  it('開発中の警告メッセージが表示される', () => {
    renderHomePage()
    expect(screen.getByText(/開発中のサイトです/)).toBeInTheDocument()
  })

  describe('ドリルカード', () => {
    it('五十音表の文字拾いへのリンクがある', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /五十音表の文字拾い/ })
      expect(link).toHaveAttribute('href', '/drill/50on-pick')
    })

    it('数字toアルファベットへのリンクがある', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /数字toアルファベット/ })
      expect(link).toHaveAttribute('href', '/drill/123-abc')
    })

    it('アルファベットシフトへのリンクがある', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /アルファベットシフト/ })
      expect(link).toHaveAttribute('href', '/drill/abc-shift')
    })

    it('都道府県名の穴埋めへのリンクがある', () => {
      renderHomePage()
      const link = screen.getByRole('link', { name: /都道府県名の穴埋め/ })
      expect(link).toHaveAttribute('href', '/drill/prefecture-fill')
    })
  })

  it('フッターのコピーライトが表示される', () => {
    renderHomePage()
    expect(screen.getByText(/© 2025 ナゾドリル/)).toBeInTheDocument()
  })
})
