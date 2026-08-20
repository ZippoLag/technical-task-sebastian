import { beforeEach, describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('../../utils/axios', () => ({
  axiosInstance: { post },
}))

import { leadsApi } from './leads'

describe('leadsApi.verifyEmails', () => {
  beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({
      data: {
        success: true,
        verifiedCount: 1,
        results: [{ leadId: 1, emailVerified: true }],
        errors: [],
      },
    })
  })

  it('sets a bounded request timeout', async () => {
    await leadsApi.verifyEmails({ leadIds: [1] })

    expect(post).toHaveBeenCalledWith(
      '/leads/verify-emails',
      { leadIds: [1] },
      { timeout: 60_000 }
    )
  })

  it('propagates request failures to the mutation layer', async () => {
    const error = new Error('request timed out')
    post.mockRejectedValue(error)

    await expect(leadsApi.verifyEmails({ leadIds: [1] })).rejects.toBe(error)
  })
})
