# Spec Delta

## Purpose

This capability lets authorized daycare staff connect existing family accounts with children so family-facing content can be scoped to valid relationships without widening access to child-management records.

## ADDED Requirements

### Requirement: Staff manages family-child links within its daycare
The system MUST allow active staff and admins to create and remove links only between children and family accounts belonging to the same daycare.

#### Scenario: Staff links a family account
- **WHEN** active staff links an eligible family account to a child in the staff member's daycare
- **THEN** the system records the relationship and makes it available for family-feed authorization

#### Scenario: Staff attempts a cross-daycare link
- **WHEN** staff attempts to link an account or child from another daycare
- **THEN** the system rejects the operation and leaves existing relationships unchanged

### Requirement: Links use eligible existing family accounts
The system MUST restrict link creation to existing, active accounts whose verified profile role is `parent`; it MUST NOT create or invite accounts as part of linking.

#### Scenario: No eligible family accounts exist
- **WHEN** staff opens the family-linking flow and no eligible accounts exist
- **THEN** the system explains that no accounts are available and offers no invitation or account-creation action

### Requirement: Support multiple family and child relationships
The system MUST allow a child to be linked to multiple family accounts and a family account to be linked to multiple children, with the relationship type recorded per link.

#### Scenario: Add distinct relationships
- **WHEN** staff links multiple eligible family accounts to a child or multiple children to a family account
- **THEN** each distinct pair is retained with its own relationship type and duplicate pairs are rejected

### Requirement: Family accounts can read only their own links
The system MUST let an active family account read only its own family-child relationships and MUST NOT grant access to medical notes, allergy details, or other staff-only child-management data through a link.

#### Scenario: Family requests another account's links or child records
- **WHEN** a family account requests relationships for another family account or staff-only child details
- **THEN** the system denies access to those records

### Requirement: Removing a link revokes derived family-feed access
The system MUST stop authorizing room publications through a family-child link after that link is removed.

#### Scenario: Family link is removed
- **WHEN** authorized staff removes a family-child link
- **THEN** subsequent feed and media requests no longer grant access to rooms solely through that link
