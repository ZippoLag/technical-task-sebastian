export const normalizeConcurrency = (value: number, fallback: number): number => {
  if (!Number.isFinite(value) || value < 1) {
    return fallback
  }

  return Math.floor(value)
}

export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  if (items.length === 0) {
    return []
  }

  const results = new Array<R>(items.length)
  let nextIndex = 0
  const workerCount = Math.min(normalizeConcurrency(concurrency, 1), items.length)

  const worker = async () => {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) {
        return
      }

      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker))
  return results
}
