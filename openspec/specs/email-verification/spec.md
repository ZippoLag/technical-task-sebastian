## Purpose

Provide dependable email verification that completes with a bounded result, processes independent leads in parallel within a safe configured limit, and clearly distinguishes successful, failed, and partially completed verification outcomes.

## Requirements

### Requirement: Verification SHALL use bounded parallelism

The system SHALL process multiple selected leads concurrently up to an application-configured maximum and SHALL NOT exceed that maximum during one verification request. The configured limit SHALL be applied consistently regardless of the number of selected leads.

#### Scenario: Multiple leads are verified within the configured limit

- **WHEN** a user verifies more leads than the configured concurrency limit
- **THEN** the system SHALL process leads in parallel while keeping the number of active verifications at or below that limit

#### Scenario: A single lead is verified

- **WHEN** a user verifies one lead
- **THEN** the system SHALL verify that lead without requiring other leads to be queued

### Requirement: Verification failures SHALL be bounded and reported

Each lead verification SHALL eventually resolve as verified, not verified, or failed. A workflow, activity, or verification timeout SHALL NOT cause the request to wait indefinitely, and the failure SHALL be associated with the affected lead.

#### Scenario: A verification activity exceeds its timeout

- **WHEN** an activity does not complete within its allowed execution time
- **THEN** the system SHALL stop retrying after the configured retry policy is exhausted and SHALL report a failure for that lead

#### Scenario: A workflow or activity raises an error

- **WHEN** a workflow or activity fails for one lead
- **THEN** the system SHALL record an error for that lead and SHALL continue processing other selected leads

### Requirement: The verification API SHALL return complete outcomes

The verification endpoint SHALL return successful results and per-lead errors when processing completes, including partial failures. A request-level failure SHALL return an error response rather than leaving the request open indefinitely.

#### Scenario: Verification partially succeeds

- **WHEN** some selected leads verify successfully and others fail or time out
- **THEN** the response SHALL include the successful results, the verified count, and an error entry for every failed lead

#### Scenario: All selected leads fail

- **WHEN** every selected lead fails verification
- **THEN** the response SHALL complete with zero successful results and the corresponding per-lead errors

#### Scenario: The verification request cannot be completed

- **WHEN** the API, Temporal connection, or request-level timeout prevents verification from completing
- **THEN** the caller SHALL receive a failed request outcome within a bounded time
