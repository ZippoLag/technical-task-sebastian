export type EnrichOption = 'messages' | 'verify' | 'gender'

export type PendingEnrichOptions = Record<EnrichOption, boolean>

export const createPendingEnrichOptions = (): PendingEnrichOptions => ({
  messages: false,
  verify: false,
  gender: false,
})

export const setEnrichOptionPending = (
  current: PendingEnrichOptions,
  option: EnrichOption,
  pending: boolean
): PendingEnrichOptions => ({
  ...current,
  [option]: pending,
})

export const canInvokeEnrichOption = (pending: PendingEnrichOptions, option: EnrichOption): boolean =>
  !pending[option]
