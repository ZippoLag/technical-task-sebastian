import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyEmail } from './utils'

describe('verifyEmail', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false for the known invalid email fixture', async () => {
    await expect(verifyEmail('john.doe@example.com')).resolves.toBe(false)
  })

  it('returns false for addresses containing a plus sign', async () => {
    await expect(verifyEmail('person+tag@example.com')).resolves.toBe(false)
  })

  it('resolves the slow path when its work completes', async () => {
    vi.useFakeTimers()
    const result = verifyEmail('jane.smith@example.com')

    await vi.advanceTimersByTimeAsync(20_000)

    await expect(result).resolves.toBe(true)
  })
})
