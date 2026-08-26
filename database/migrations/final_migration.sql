-- RaahX Creator Network: consolidated remaining additive changes
--
-- Prerequisite: database/migrations/2026-08-25-create-creator-network.sql has
-- already been applied. This file contains only the remaining changes from:
--   - 2026-08-27-add-creator-profile-enhancements.sql
--   - 2026-08-28-add-creator-brand-love-heading.sql
--
-- This migration is additive and preserves all existing Creator and unrelated
-- CMS records. It does not recreate any original Creator Network table.

-- 1. Track when each manually/officially refreshed social follower count was
-- last stored. Use an information_schema guard for safe review/re-execution.
SET @creator_social_timestamp_sql = (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'creator_socials'
        AND COLUMN_NAME = 'follower_count_updated_at'
    ),
    'SELECT 1',
    'ALTER TABLE creator_socials ADD COLUMN follower_count_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER follower_count'
  )
);
PREPARE creator_social_timestamp_statement FROM @creator_social_timestamp_sql;
EXECUTE creator_social_timestamp_statement;
DEALLOCATE PREPARE creator_social_timestamp_statement;

-- 2. Store up to four normalized Why Brands Love cards. The API enforces the
-- maximum and validates icon_key against its fixed allowlist.
CREATE TABLE IF NOT EXISTS creator_brand_love_points (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  heading           VARCHAR(255) NOT NULL,
  detail            TEXT NOT NULL,
  icon_key          VARCHAR(64) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_brand_love_creator_order (creator_id, display_order),
  CONSTRAINT fk_creator_brand_love_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3. Store the complete Admin-configured public section heading. This field is
-- separate from each card's own heading and contains no generated gender text.
SET @creator_brand_love_heading_sql = (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'creators'
        AND COLUMN_NAME = 'brand_love_heading'
    ),
    'SELECT 1',
    'ALTER TABLE creators ADD COLUMN brand_love_heading VARCHAR(255) NULL AFTER about'
  )
);
PREPARE creator_brand_love_heading_statement FROM @creator_brand_love_heading_sql;
EXECUTE creator_brand_love_heading_statement;
DEALLOCATE PREPARE creator_brand_love_heading_statement;
