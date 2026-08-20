export const EMAIL_VERIFICATION_CONFIG = {
  concurrency: 5,
  connectionTimeout: '5 seconds',
  activityTimeout: '5 seconds',
  workflowTimeout: '30 seconds',
  requestTimeoutMs: 60_000,
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '4 seconds',
    maximumAttempts: 3,
  },
} as const
