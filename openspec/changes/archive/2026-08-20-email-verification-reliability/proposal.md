## Why

Email verification currently waits synchronously for Temporal workflows, but a deliberately slow activity can exceed its one-second timeout and be retried indefinitely. The API request then remains open without a client timeout, while the UI provides no pending state and does not surface per-lead workflow errors clearly.

The Enrich menu also needs predictable operation lifecycle behavior so users cannot accidentally re-trigger the same operation while it is still running.

## What Changes

- Add an `email-verification` capability covering bounded Temporal execution and reliable result reporting.
- Add an application-configured concurrency limit so selected leads can be verified in parallel without unbounded load.
- Give activity/workflow execution finite timeout and retry behavior so failures eventually reach the API.
- Ensure workflow, activity, database, and API failures are converted into actionable verification errors.
- Close the Enrich dropdown immediately after an option is selected and track pending state per option; prevent re-invoking that option until it finishes.
- Add pending feedback and disable the relevant option while its operation is running.
- Display an error toast for HTTP failures, request timeouts, workflow/activity failures, and partial verification failures; retain success feedback for successful results.

## Capabilities

### New Capabilities

- `email-verification`: Bounded, parallelizable email verification with complete success, partial-failure, timeout, and UI feedback behavior.
- `enrich-operation-state`: Per-option dropdown visibility, pending-state locking, and completion/error feedback for Enrich operations.

### Modified Capabilities

<!-- No existing committed capability specs exist under openspec/specs/. -->

## Impact

- Frontend: `LeadsList` Enrich menu, React Query mutation state, toast handling, and API request timeout behavior.
- Backend: `/leads/verify-emails`, Temporal workflow/activity options, bounded parallel execution, error aggregation, and connection cleanup.
- Configuration: a backend application constant for the maximum number of concurrent email verifications, with a documented default.
- Tests: frontend behavior tests plus backend workflow/API tests for slow activities, retries, timeouts, parallel limits, partial failures, and surfaced errors.
