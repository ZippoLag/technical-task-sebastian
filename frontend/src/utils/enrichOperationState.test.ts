import { describe, expect, it } from 'vitest'
import {
  canInvokeEnrichOption,
  createPendingEnrichOptions,
  setEnrichOptionPending,
} from './enrichOperationState'

describe('Enrich operation state', () => {
  it('locks only the option whose operation is pending', () => {
    const pending = setEnrichOptionPending(createPendingEnrichOptions(), 'verify', true)

    expect(canInvokeEnrichOption(pending, 'verify')).toBe(false)
    expect(canInvokeEnrichOption(pending, 'messages')).toBe(true)
    expect(canInvokeEnrichOption(pending, 'gender')).toBe(true)
  })

  it('unlocks an option after it settles without changing other options', () => {
    const running = setEnrichOptionPending(createPendingEnrichOptions(), 'verify', true)
    const settled = setEnrichOptionPending(running, 'verify', false)

    expect(settled).toEqual(createPendingEnrichOptions())
    expect(canInvokeEnrichOption(settled, 'verify')).toBe(true)
  })
})
