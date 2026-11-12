# Spec Delta

## Purpose

This capability gives staff and families distinct role-appropriate OpenDayCare experiences while preserving one sign-in flow and protecting every route and action according to the verified account profile.

## ADDED Requirements

### Requirement: Route authenticated users by verified role
After authentication, the system MUST select the user's panel from the active profile role stored by the service, never from a client-supplied role value.

#### Scenario: Active staff signs in
- **WHEN** an authenticated user has an active `staff` or `admin` profile
- **THEN** the system opens the staff panel

#### Scenario: Active family signs in
- **WHEN** an authenticated user has an active `parent` profile
- **THEN** the system opens the family panel

### Requirement: Separate staff and family capabilities
The system MUST present role-specific navigation and MUST deny access to routes and actions that are not permitted for the verified role.

#### Scenario: Family opens a staff-only page or submits a staff action
- **WHEN** a family account requests child-management data or submits a publication-management action
- **THEN** the system denies the request without disclosing staff-only data or performing the action

#### Scenario: Staff opens the family panel
- **WHEN** an active staff or admin account requests the family panel
- **THEN** the system does not expose family-specific access as a substitute for staff permissions and presents the staff experience

### Requirement: Deny accounts without an eligible profile
The system MUST deny panel access when the authenticated account has no profile, an inactive profile, or a role outside the supported staff, admin, and parent roles.

#### Scenario: Missing or ineligible profile
- **WHEN** an authenticated account has no active supported profile
- **THEN** the system denies access to protected panel data and actions
