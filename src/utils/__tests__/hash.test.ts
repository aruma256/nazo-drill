import { describe, expect, it } from 'vitest'
import { sha256 } from '../hash'

describe('sha256', () => {
  it('should hash "example" correctly', async () => {
    const hash = await sha256('example')
    expect(hash).toBe(
      '50d858e0985ecc7f60418aaf0cc5ab587f42c2570a884095a9e8ccacd0f6545c',
    )
  })
})
