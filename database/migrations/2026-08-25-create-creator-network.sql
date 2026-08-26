-- RaahX Creator Network: final replacement schema
--
-- REVIEW BEFORE EXECUTION. DO NOT run this file against production until the
-- final Creator API and UI have been updated for this schema and a Creator-only
-- backup has been taken.
--
-- This migration intentionally replaces development-stage Creator Network
-- tables. It does not create/select a database and does not reference, alter,
-- truncate, or delete from any unrelated RaahX table.
--
-- Existing RaahX conventions retained from database/schema.sql:
--   - InnoDB storage engine
--   - utf8mb4 character set with utf8mb4_unicode_ci collation
--   - VARCHAR(191) IDs for primary CMS records
--   - BIGINT UNSIGNED AUTO_INCREMENT IDs for owned child records
--   - CURRENT_TIMESTAMP created/updated columns
--
-- IMPORTANT: the following DROP statements are deliberately limited to the
-- Creator Network tables and are ordered child-first for foreign-key safety.

DROP TABLE IF EXISTS creator_collaboration_requests;
DROP TABLE IF EXISTS creator_access_tokens;
DROP TABLE IF EXISTS creator_featured_work;
DROP TABLE IF EXISTS creator_categories;
DROP TABLE IF EXISTS creator_socials;
DROP TABLE IF EXISTS creator_expertise;
DROP TABLE IF EXISTS creator_collaboration_types;
DROP TABLE IF EXISTS creator_applications;
DROP TABLE IF EXISTS creators;

-- ---------------------------------------------------------------------------
-- APPROVED CREATOR PROFILES
-- ---------------------------------------------------------------------------
-- followers is the cached sum of creator_socials.follower_count. The API must
-- recalculate it whenever social accounts change. When followers_override is
-- not NULL, public reads use that deliberate admin override instead.

CREATE TABLE creators (
  id                    VARCHAR(191) NOT NULL,
  full_name             VARCHAR(255) NOT NULL,
  display_name          VARCHAR(255) NOT NULL,
  email                 VARCHAR(254) NOT NULL,
  whatsapp              VARCHAR(100) NULL,
  slug                  VARCHAR(191) NOT NULL,
  profile_image_url     VARCHAR(2048) NULL,
  short_bio             TEXT NULL,
  about                 LONGTEXT NULL,
  city                  VARCHAR(191) NULL,
  region                VARCHAR(191) NULL,
  followers             BIGINT UNSIGNED NOT NULL DEFAULT 0,
  followers_override    BIGINT UNSIGNED NULL,
  engagement_rate       DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  compatibility_score   TINYINT UNSIGNED NULL,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  status                VARCHAR(32) NOT NULL DEFAULT 'hidden',
  display_order         INT NOT NULL DEFAULT 0,
  approved_at           TIMESTAMP NULL DEFAULT NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creators_email (email),
  UNIQUE KEY uq_creators_slug (slug),
  KEY idx_creators_status_order (status, display_order),
  KEY idx_creators_city (city),
  KEY idx_creators_verified (is_verified),
  KEY idx_creators_followers (followers),
  KEY idx_creators_engagement (engagement_rate),
  KEY idx_creators_approved_at (approved_at),
  FULLTEXT KEY ft_creators_search (display_name, full_name, short_bio, about)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR SOCIAL ACCOUNTS
-- ---------------------------------------------------------------------------
-- Multiple records for the same platform are allowed so a Creator can manage
-- more than one account on Instagram, TikTok, YouTube, or any other platform.

CREATE TABLE creator_socials (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  platform          VARCHAR(100) NOT NULL,
  handle            VARCHAR(255) NULL,
  profile_url       VARCHAR(2048) NOT NULL,
  follower_count    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_socials_creator_order (creator_id, display_order),
  KEY idx_creator_socials_platform (platform),
  KEY idx_creator_socials_platform_followers (platform, follower_count),
  CONSTRAINT fk_creator_socials_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- DYNAMIC CREATOR CATEGORIES
-- ---------------------------------------------------------------------------
-- Categories are Creator-owned free-text values rather than a fixed enum or
-- hard-coded global list. The API should trim and deduplicate values.

CREATE TABLE creator_categories (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  category          VARCHAR(191) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creator_categories_creator_value (creator_id, category),
  KEY idx_creator_categories_creator_order (creator_id, display_order),
  KEY idx_creator_categories_value (category),
  CONSTRAINT fk_creator_categories_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR EXPERTISE
-- ---------------------------------------------------------------------------

CREATE TABLE creator_expertise (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  expertise         VARCHAR(191) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creator_expertise_creator_value (creator_id, expertise),
  KEY idx_creator_expertise_creator_order (creator_id, display_order),
  KEY idx_creator_expertise_value (expertise),
  CONSTRAINT fk_creator_expertise_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR COLLABORATION TYPES
-- ---------------------------------------------------------------------------

CREATE TABLE creator_collaboration_types (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id            VARCHAR(191) NOT NULL,
  collaboration_type    VARCHAR(191) NOT NULL,
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creator_collaborations_creator_value (creator_id, collaboration_type),
  KEY idx_creator_collaborations_creator_order (creator_id, display_order),
  KEY idx_creator_collaborations_type (collaboration_type),
  CONSTRAINT fk_creator_collaborations_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR FEATURED WORK
-- ---------------------------------------------------------------------------
-- thumbnail_url is optional. Later application code may perform a controlled,
-- best-effort OG image lookup with SSRF protections and strict time/size limits.
-- If no safe thumbnail is available, public UI must use a local fallback. The
-- original work_url remains authoritative and clickable.

CREATE TABLE creator_featured_work (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  title             VARCHAR(255) NOT NULL,
  work_url          VARCHAR(2048) NOT NULL,
  platform          VARCHAR(100) NULL,
  thumbnail_url     VARCHAR(2048) NULL,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_work_creator_order (creator_id, display_order),
  KEY idx_creator_work_platform (platform),
  CONSTRAINT fk_creator_work_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR APPLICATIONS
-- ---------------------------------------------------------------------------
-- submitted_payload preserves repeatable application data (social accounts,
-- categories, expertise, collaboration types, and work links) exactly as
-- reviewed. Approval is an explicit admin action; applications never publish
-- a Creator automatically. reviewed_by is an audit label because the current
-- RaahX authentication system does not have an admin-users table.

CREATE TABLE creator_applications (
  id                    VARCHAR(191) NOT NULL,
  full_name             VARCHAR(255) NOT NULL,
  display_name          VARCHAR(255) NOT NULL,
  email                 VARCHAR(254) NOT NULL,
  whatsapp              VARCHAR(100) NULL,
  profile_image_url     VARCHAR(2048) NULL,
  short_bio             TEXT NULL,
  about                 LONGTEXT NULL,
  city                  VARCHAR(191) NULL,
  region                VARCHAR(191) NULL,
  submitted_payload     JSON NOT NULL,
  status                VARCHAR(32) NOT NULL DEFAULT 'pending',
  admin_notes           LONGTEXT NULL,
  reviewed_by           VARCHAR(191) NULL,
  reviewed_at           TIMESTAMP NULL DEFAULT NULL,
  approved_creator_id   VARCHAR(191) NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_applications_status_created (status, created_at),
  KEY idx_creator_applications_email (email),
  KEY idx_creator_applications_reviewed_at (reviewed_at),
  KEY idx_creator_applications_approved_creator (approved_creator_id),
  CONSTRAINT fk_creator_applications_approved_creator
    FOREIGN KEY (approved_creator_id) REFERENCES creators (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- SECURE CREATOR MAGIC-LINK TOKENS
-- ---------------------------------------------------------------------------
-- Only a SHA-256 (or stronger fixed-length) token hash is stored. Raw tokens
-- must be generated with a cryptographically secure RNG, emailed once, and
-- never logged or persisted. expires_at, revoked_at, and last_used_at support
-- expiration, revocation, and audit. These tokens never grant Admin access.

CREATE TABLE creator_access_tokens (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  token_hash        CHAR(64) NOT NULL,
  purpose           VARCHAR(32) NOT NULL DEFAULT 'profile_edit',
  expires_at        TIMESTAMP NOT NULL,
  last_used_at      TIMESTAMP NULL DEFAULT NULL,
  revoked_at        TIMESTAMP NULL DEFAULT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creator_access_tokens_hash (token_hash),
  KEY idx_creator_access_tokens_creator_expiry (creator_id, expires_at),
  KEY idx_creator_access_tokens_expiry (expires_at),
  KEY idx_creator_access_tokens_revoked (revoked_at),
  CONSTRAINT fk_creator_access_tokens_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR-SPECIFIC COLLABORATION REQUESTS
-- ---------------------------------------------------------------------------
-- Requests are business records submitted by third parties, not Creator-owned
-- profile configuration. They are retained if a Creator is removed, so the
-- foreign key uses SET NULL and creator_display_name preserves context.

CREATE TABLE creator_collaboration_requests (
  id                      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id              VARCHAR(191) NULL,
  creator_display_name    VARCHAR(255) NOT NULL,
  requester_name          VARCHAR(255) NOT NULL,
  company_name            VARCHAR(255) NULL,
  email                   VARCHAR(254) NOT NULL,
  whatsapp                VARCHAR(100) NULL,
  campaign_type           VARCHAR(191) NULL,
  campaign_budget         VARCHAR(255) NULL,
  campaign_details        LONGTEXT NOT NULL,
  portfolio_url           VARCHAR(2048) NULL,
  status                  VARCHAR(32) NOT NULL DEFAULT 'new',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_requests_creator_created (creator_id, created_at),
  KEY idx_creator_requests_status_created (status, created_at),
  KEY idx_creator_requests_email (email),
  CONSTRAINT fk_creator_requests_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
