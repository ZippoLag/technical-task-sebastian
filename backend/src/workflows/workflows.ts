import { proxyActivities } from '@temporalio/workflow'
import { EMAIL_VERIFICATION_CONFIG } from '../config'
import type * as activities from './activities'

const { verifyEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: EMAIL_VERIFICATION_CONFIG.activityTimeout,
  retry: EMAIL_VERIFICATION_CONFIG.retry,
})

export async function verifyEmailWorkflow(email: string): Promise<boolean> {
  return await verifyEmail(email)
}
