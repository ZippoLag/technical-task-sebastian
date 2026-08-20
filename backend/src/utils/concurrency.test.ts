import { describe, expect, it } from 'vitest'
import { mapWithConcurrency, normalizeConcurrency } from './concurrency'

describe('normalizeConcurrency', () => {
  it('uses the fallback for invalid values', () => {
    expect(normalizeConcurrency(0, 5)).toBe(5)
    expect(normalizeConcurrency(-1, 5)).toBe(5)
    expect(normalizeConcurrency(Number.NaN, 5)).toBe(5)
    expect(normalizeConcurrency(Number.POSITIVE_INFINITY, 5)).toBe(5)
  })

  it('floors valid fractional values', () => {
    expect(normalizeConcurrency(2.9, 5)).toBe(2)
  })
})

describe('mapWithConcurrency', () => {
  it('does not exceed the configured worker count and preserves result order', async () => {
    let active = 0
    let peak = 0

    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1
      peak = Math.max(peak, active)
      await new Promise((resolve) => setTimeout(resolve, value === 1 ? 15 : 5))
      active -= 1
      return value * 2
    })

    expect(peak).toBe(2)
    expect(results).toEqual([2, 4, 6, 8, 10])
  })

  it('returns an empty list without invoking the mapper', async () => {
    let invoked = false

    const results = await mapWithConcurrency([], 2, async () => {
      invoked = true
      return true
    })

    expect(results).toEqual([])
    expect(invoked).toBe(false)
  })
})
