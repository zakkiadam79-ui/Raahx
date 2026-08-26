-- RaahX Creator Network: additive profile enhancements
--
-- Apply only after review. This migration preserves all existing Creator and
-- unrelated CMS records. It does not drop, truncate, rename, or recreate any
-- existing table.

-- Add the social-count timestamp only when it is not already present, making a
-- controlled re-run safe on MySQL installations without ADD COLUMN IF NOT EXISTS.
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
