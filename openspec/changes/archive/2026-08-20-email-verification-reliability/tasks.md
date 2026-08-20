## 1. Bound Temporal verification

- [x] 1.1 Add a backend application configuration constant for email verification concurrency with a safe default of 5 and validation for invalid values.
- [x] 1.2 Replace the unbounded activity retry behavior with explicit activity timeout, finite retry attempts, and bounded backoff settings.
- [x] 1.3 Add a finite workflow execution deadline aligned with the activity and retry budget.
- [x] 1.4 Ensure slow, timed-out, and thrown activity/workflow failures resolve as terminal per-lead errors.

## 2. Parallelize and harden the verification API

- [x] 2.1 Replace the sequential verification loop with a bounded worker pool that never exceeds the configured concurrency limit.
- [x] 2.2 Preserve independent successes and failures when processing a batch, including database update failures, and return the existing response shape with complete error entries.
- [x] 2.3 Ensure Temporal connections and other resources are closed on both successful and failed requests.
- [x] 2.4 Add or align request-level server behavior so an unavailable Temporal service or batch-level failure returns a bounded HTTP error.
- [x] 2.5 Add backend tests for concurrency limits, independent progress, partial results, slow activity timeouts, finite retries, and cleanup on failure.

## 3. Add frontend operation lifecycle handling

- [x] 3.1 Add per-option Enrich operation state in the parent component and close the dropdown immediately when an option is selected.
- [x] 3.2 Prevent a pending option from being invoked again, show its pending state, and unlock it on success, failure, or cancellation without locking unrelated options.
- [x] 3.3 Connect Generate Messages operation settlement to the parent option state while preserving the modal's existing submit and cancel behavior.
- [x] 3.4 Ensure synchronous or unimplemented Enrich options close the menu and settle their per-option state immediately after reporting their outcome.

## 4. Surface verification outcomes to users

- [x] 4.1 Add an explicit client timeout for the verification request and route timeout/rejection errors through the existing error-toast mechanism.
- [x] 4.2 Update Verify Email success handling to inspect per-lead errors and show an error toast for partial or complete failures instead of reporting misleading success.
- [x] 4.3 Show pending feedback for Verify Email and unlock the option from one settled mutation path regardless of success or error.
- [x] 4.4 Add frontend tests for dropdown closure, per-option locking, pending feedback, success, partial failure, API rejection, and request timeout toasts.

## 5. Verify the change

- [x] 5.1 Run frontend and backend typechecks/builds.
- [x] 5.2 Run focused frontend and backend tests for verification and Enrich operation state.
- [x] 5.3 Run the full project test suites and confirm no unrelated behavior regresses.
