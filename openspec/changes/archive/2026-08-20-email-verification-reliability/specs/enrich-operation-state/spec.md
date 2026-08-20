## Purpose

Make Enrich actions predictable by closing the menu after selection, preventing duplicate invocation of an active option, and giving users clear completion or failure feedback.

## ADDED Requirements

### Requirement: Selecting an Enrich option SHALL close the dropdown

The system SHALL hide the Enrich dropdown immediately after a user selects any option.

#### Scenario: An option is selected

- **WHEN** a user clicks any Enrich option
- **THEN** the dropdown SHALL close before or as the selected operation begins

### Requirement: The active option SHALL be locked while it runs

The system SHALL track operation state per Enrich option. An option with an operation in progress SHALL NOT be invokable again until that operation reaches success, failure, or cancellation. Other options MAY be invoked according to their own pending state.

#### Scenario: The user attempts to repeat a pending option

- **WHEN** an Enrich option is still running and the user attempts to select that same option again
- **THEN** the system SHALL prevent a second invocation and SHALL preserve the existing operation

#### Scenario: A pending option completes

- **WHEN** an Enrich option succeeds, fails, or is cancelled
- **THEN** that option SHALL become available for a new invocation

### Requirement: Pending Enrich operations SHALL provide visible feedback

The system SHALL indicate that the selected option is running and SHALL prevent interaction that would create duplicate work for that option.

#### Scenario: Verify Email is running

- **WHEN** email verification is pending
- **THEN** the Verify Email option SHALL show a pending state and SHALL be disabled until the request settles

### Requirement: Enrich failures SHALL produce an error toast

The system SHALL display an error toast when an Enrich operation encounters an API error, request timeout, workflow failure, activity failure, or partial failure. A successful portion of a partial operation MAY also display success feedback, but it SHALL NOT suppress the error notification.

#### Scenario: Verification returns per-lead errors

- **WHEN** the verification API completes with one or more failed leads
- **THEN** the UI SHALL display an error toast summarizing the failure and SHALL not present the operation as wholly successful

#### Scenario: Verification request fails or times out

- **WHEN** the verification API request rejects or exceeds its client-side timeout
- **THEN** the UI SHALL display an error toast and SHALL unlock the Verify Email option

#### Scenario: A non-verification Enrich option fails

- **WHEN** another Enrich operation rejects or reports a failure
- **THEN** the UI SHALL display an error toast and SHALL unlock that option
