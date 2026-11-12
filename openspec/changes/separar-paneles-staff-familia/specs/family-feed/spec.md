# Spec Delta

## Purpose

This capability provides persistent daycare updates for staff and a family feed that exposes only general announcements and room publications authorized by current family-child links.

## ADDED Requirements

### Requirement: Staff publishes persistent daycare or room updates
The system MUST allow active staff and admins to publish persistent updates for their daycare, addressed either to the whole daycare or to a room in that daycare.

#### Scenario: Staff publishes to a room or the whole daycare
- **WHEN** active staff publishes a valid update with a daycare-wide or same-daycare room audience
- **THEN** the system persists the update and makes it available to authorized readers after reload

#### Scenario: Staff selects a room from another daycare
- **WHEN** staff submits an update addressed to a room outside the staff member's daycare
- **THEN** the system rejects the publication

### Requirement: Staff manages publications with role-appropriate permissions
The system MUST allow an author to edit or delete their own publications and an active admin to manage any publication in the same daycare; it MUST reject unauthorized changes.

#### Scenario: Staff manages a publication
- **WHEN** an author updates or deletes their own publication, or an active admin manages a publication in their daycare
- **THEN** the system performs the requested operation

#### Scenario: Staff attempts to manage another author's publication
- **WHEN** non-admin staff attempts to edit or delete another staff member's publication
- **THEN** the system rejects the operation and preserves the publication

### Requirement: Family feed is limited to general and linked-room publications
The system MUST show an active family account daycare-wide announcements and room publications only for rooms containing children currently linked to that account.

#### Scenario: Family has a child linked to a room
- **WHEN** the family account loads its feed
- **THEN** the feed includes daycare-wide announcements and publications for each currently linked child's room

#### Scenario: Family has no link to a publication's room
- **WHEN** the family account requests a publication for a room with no currently linked child
- **THEN** the system does not disclose the publication

#### Scenario: Family opens the feed
- **WHEN** an active family account opens the family panel
- **THEN** it receives a read-only feed with no create, edit, or delete controls

### Requirement: Family media follows publication authorization
The system MUST authorize each family media request using the same current daycare, audience, and relationship rules as the associated publication.

#### Scenario: Family requests an authorized publication image
- **WHEN** a family account requests media attached to a currently authorized publication
- **THEN** the system serves the media through an access-controlled mechanism

#### Scenario: Family requests unauthorized or newly revoked media
- **WHEN** a family account requests media for an unauthorized publication or after its only qualifying link is removed
- **THEN** the system denies access to the media

### Requirement: Feed states distinguish empty results from failures
The system MUST provide an accessible empty state when no authorized publications exist and an accessible error when the feed cannot be loaded.

#### Scenario: Family has no visible publications
- **WHEN** the feed query succeeds and returns no authorized publications
- **THEN** the family panel presents an empty-feed state

#### Scenario: Feed query fails
- **WHEN** the system cannot load the feed
- **THEN** the family panel communicates the failure and does not present it as a successful empty feed
