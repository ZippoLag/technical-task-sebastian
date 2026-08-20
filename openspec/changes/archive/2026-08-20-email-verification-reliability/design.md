## Context

The current verification endpoint creates a Temporal client and executes one workflow at a time inside a `for...of` loop. The workflow proxies an activity with a one-second start-to-close timeout, while the activity contains a twenty-second slow path and no explicit finite retry policy. The endpoint waits for workflow completion before responding. On the frontend, `LeadsList` uses a React Query mutation but does not render its pending state or inspect the response error list; the Enrich menu is controlled independently from operation state.

See `proposal.md` and the two capability specs for the motivation and externally observable behavior.

## Goals / Non-Goals

**Goals:**

- Bound activity retries and workflow execution so a slow or failed verification reaches a terminal result.
- Run independent lead verifications concurrently while enforcing a checked-in application concurrency limit.
- Preserve per-lead success and failure information in the existing verification response shape.
- Make the Verify Email option visibly pending, prevent duplicate invocation of that option, close the menu after selection, and surface all verification failure classes through toast feedback.
- Ensure Temporal connections and other resources are closed on both success and failure.

**Non-Goals:**

- Replacing Temporal or changing the email verification provider contract.
- Adding a persistent verification-job model or background polling UI.
- Changing the semantics of the existing Generate Messages or Guess Gender features beyond the shared dropdown lifecycle and error-feedback hooks.
- Guaranteeing cancellation of already-started Temporal workflows when a browser request is abandoned.

## Decisions

### Use a bounded worker pool for verification

The backend will create a bounded set of verification workers from the selected leads. Each worker starts one lead workflow, captures that lead's success or error, and then takes the next lead until the batch is exhausted. The pool size will come from an application configuration constant, with an initial default of 5. The implementation will clamp invalid values to a safe positive limit rather than allowing zero or unbounded concurrency.

**Alternative considered:** `Promise.all` over every selected lead was rejected because it can overload Temporal and providers. Fully sequential processing was rejected because one slow lead delays all other leads.

### Configure finite Temporal execution

The workflow activity options will specify an execution timeout long enough for the supported verification operation, a finite maximum retry count, and bounded backoff. The workflow itself will also have a finite execution deadline so an unexpected workflow-level problem cannot leave the API waiting forever. The exact initial values will be documented alongside the configuration, with the deliberately slow test activity expected to resolve as a reported failure rather than an indefinite retry.

**Alternative considered:** relying on Temporal defaults was rejected because the current default retry behavior permits the one-second activity timeout to keep retrying indefinitely.

### Keep partial results and normalize failures at the API boundary

Each lead execution will be wrapped independently. Temporal failures, activity timeouts, database update failures, and unexpected exceptions will become the existing per-lead error shape. The endpoint will return successful results and errors together when the batch completes. A failure before batch processing can begin, such as an unavailable Temporal connection, will return a failed HTTP response. Temporal connection cleanup will run in a `finally` path.

**Alternative considered:** fail the entire batch on the first lead error was rejected because independent leads should not block one another or hide successful results.

### Use explicit client-side request timeout and settled mutation state

The verification request will have a bounded client timeout aligned with the backend's maximum expected batch duration. React Query mutation settlement (`success` or `error`) will be the single unlock point for Verify Email. A request timeout will use the same error-toast path as other API failures.

**Alternative considered:** relying only on server-side timeouts was rejected because a broken network or proxy can leave the browser request pending independently of backend behavior.

### Track Enrich state per option in the parent

`LeadsList` will own a small per-option state map or equivalent pending set. Selecting an option immediately closes the dropdown. The selected option is disabled while its operation is active and is removed from the pending set in a `finally`/settlement path. Other options remain independently selectable, matching the clarified per-option lock behavior.

For Generate Messages, opening the template modal closes the dropdown; the option becomes pending when the actual generation mutation starts and unlocks when that mutation settles. For synchronous/unimplemented options, the handler closes the menu, reports its outcome, and settles immediately.

**Alternative considered:** one global `isEnriching` lock was rejected because the requested behavior is per-option rather than blocking unrelated Enrich actions.

### Treat partial verification as an error-visible outcome

The frontend will inspect both the HTTP mutation state and the returned `errors` array. A response with errors will display an error toast, optionally alongside a success summary when some leads completed successfully. A response with no errors will display the existing success toast. This prevents a misleading “Verified 0 emails” success message when every lead failed.

## Risks / Trade-offs

- [Risk] A batch with many leads can still take longer than the client timeout even with bounded concurrency → align the client timeout with the maximum workflow budget and report a clear timeout; consider a job-based design if batch sizes grow.
- [Risk] Retrying an external verification can duplicate provider calls → use finite retries and document that provider activities must tolerate retries; do not claim exactly-once provider invocation.
- [Risk] A browser timeout does not automatically stop workflows already accepted by Temporal → keep workflow execution bounded and treat late database updates as a known limitation of this request/response design.
- [Risk] Per-option state crosses component boundaries for Generate Messages → use explicit parent callbacks or a shared operation-state contract rather than inferring state from dropdown visibility.
- [Risk] A too-small activity timeout can classify legitimate slow verification as failed → choose and document timeout values against the provider SLA and cover the boundary with tests.

## Migration Plan

1. Add the application concurrency constant and bounded Temporal execution settings.
2. Update the verification endpoint and frontend mutation handling behind the existing endpoint; no database migration is required.
3. Add tests for timeout, finite retry, concurrency, partial results, resource cleanup, pending locks, and toast behavior.
4. Deploy the backend and frontend together so the existing response shape and new error interpretation remain compatible.
5. Roll back by reverting the frontend and backend changes; persisted `emailVerified` values remain compatible because the schema is unchanged.
