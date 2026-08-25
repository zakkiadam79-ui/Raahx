-- RaahX Creator Network: additive schema migration
--
-- Review this file before applying it to the existing RaahX database.
-- It creates Creator Network tables only and does not select or create a database.
--
-- Compatibility conventions inherited from database/schema.sql:
--   - InnoDB storage engine
--   - utf8mb4 character set with utf8mb4_unicode_ci collation
--   - VARCHAR(191) parent IDs
--   - CURRENT_TIMESTAMP created/updated columns

-- ---------------------------------------------------------------------------
-- CREATORS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creators (
  id                    VARCHAR(191) NOT NULL,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(191) NOT NULL,
  profile_image_url     VARCHAR(2048) NULL,
  short_bio             TEXT NULL,
  about                 LONGTEXT NULL,
  category              VARCHAR(191) NULL,
  city                  VARCHAR(191) NULL,
  region                VARCHAR(191) NULL,
  followers             BIGINT UNSIGNED NOT NULL DEFAULT 0,
  engagement_rate       DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  compatibility_score   TINYINT UNSIGNED NULL,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  status                VARCHAR(32) NOT NULL DEFAULT 'published',
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creators_slug (slug),
  KEY idx_creators_status_order (status, display_order),
  KEY idx_creators_category (category),
  KEY idx_creators_city (city),
  KEY idx_creators_verified (is_verified),
  KEY idx_creators_followers (followers),
  KEY idx_creators_engagement (engagement_rate),
  FULLTEXT KEY ft_creators_search (name, short_bio, about)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR SOCIAL ACCOUNTS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creator_socials (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  platform          VARCHAR(100) NOT NULL,
  handle            VARCHAR(255) NULL,
  profile_url       VARCHAR(2048) NULL,
  follower_count    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_creator_socials_creator_platform (creator_id, platform),
  KEY idx_creator_socials_platform_followers (platform, follower_count),
  KEY idx_creator_socials_creator_order (creator_id, display_order),
  CONSTRAINT fk_creator_socials_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CREATOR EXPERTISE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS creator_expertise (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id        VARCHAR(191) NOT NULL,
  expertise         VARCHAR(191) NOT NULL,
  display_order     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
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

CREATE TABLE IF NOT EXISTS creator_collaboration_types (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  creator_id            VARCHAR(191) NOT NULL,
  collaboration_type    VARCHAR(191) NOT NULL,
  display_order         INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_creator_collaborations_creator_order (creator_id, display_order),
  KEY idx_creator_collaborations_type (collaboration_type),
  CONSTRAINT fk_creator_collaborations_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
