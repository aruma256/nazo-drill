import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { PrefectureShape } from '../PrefectureShape'

it('複数の県を表示しても、それぞれの湖が自分の県の輪郭で切り抜かれる', () => {
  render(
    <>
      <PrefectureShape prefectureId={25} label="滋賀県の地図" />
      <PrefectureShape prefectureId={8} label="茨城県の地図" />
    </>,
  )
  const ids = []
  for (const label of ['滋賀県の地図', '茨城県の地図']) {
    const svg = screen.getByRole('img', { name: label })
    const clip = svg.querySelector('clipPath')!
    const lake = svg.querySelector('path[clip-path]')!
    expect(lake.getAttribute('d')).toBeTruthy()
    expect(lake).toHaveAttribute('clip-path', `url(#${clip.id})`)
    expect(lake).toHaveAttribute('fill-rule', 'evenodd')
    expect(clip.querySelector('path')).toHaveAttribute('clip-rule', 'evenodd')
    ids.push(clip.id)
  }
  expect(new Set(ids).size).toBe(2)
})
