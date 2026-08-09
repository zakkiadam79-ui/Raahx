-- RaahX Step 5A: MySQL CMS schema
--
-- This migration creates tables only. It does not insert production data and it
-- does not alter the current React/localStorage data flow.
--
-- Select the database supplied by the deployment environment before running:
--   CREATE DATABASE IF NOT EXISTS `raahx` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   USE `raahx`;
--
-- Production database names and credentials must be supplied by the PHP API
-- environment/configuration and must never be committed to this repository.

-- ---------------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------------
-- ServiceData currently contains scalar detail fields plus stats, process, and
-- benefits arrays. Icons are identifiers such as "Search", never React values.

CREATE TABLE IF NOT EXISTS services (
  id                  VARCHAR(191) NOT NULL,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(191) NOT NULL,
  icon_identifier     VARCHAR(100) NOT NULL,
  hero_title          VARCHAR(500) NOT NULL,
  hero_subtitle       VARCHAR(1000) NOT NULL,
  overview            LONGTEXT NOT NULL,
  why_choose_title    VARCHAR(500) NOT NULL,
  why_choose_text     LONGTEXT NOT NULL,
  testimonial_quote   TEXT NULL,
  testimonial_author  VARCHAR(255) NULL,
  display_order       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_slug (slug),
  KEY idx_services_display_order (display_order),
  KEY idx_services_updated_at (updated_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_stats (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id      VARCHAR(191) NOT NULL,
  label           VARCHAR(255) NOT NULL,
  value           VARCHAR(255) NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_stats_service_order (service_id, display_order),
  CONSTRAINT fk_service_stats_service
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_process_steps (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id      VARCHAR(191) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_process_service_order (service_id, display_order),
  CONSTRAINT fk_service_process_service
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_benefits (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id      VARCHAR(191) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_benefits_service_order (service_id, display_order),
  CONSTRAINT fk_service_benefits_service
    FOREIGN KEY (service_id) REFERENCES services (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- TEAM MEMBERS
-- ---------------------------------------------------------------------------
-- TeamMember currently contains id, name, role, image, and optional LinkedIn.
-- The image is a URL/path or a future API-managed media URL, never a File object.

CREATE TABLE IF NOT EXISTS team_members (
  id              VARCHAR(191) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  role            VARCHAR(255) NOT NULL,
  image_url       VARCHAR(2048) NULL,
  linkedin_url    VARCHAR(2048) NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_team_members_display_order (display_order),
  KEY idx_team_members_updated_at (updated_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- BLOGS
-- ---------------------------------------------------------------------------
-- BlogPost currently contains title, slug, excerpt, serviceSlug, date,
-- readTime, author, structured content blocks, optional custom image, and
-- optional legacy slugs. The default/service-based cover art remains an
-- application-level fallback when custom_image_url is NULL.
--
-- published_at is a real date for the current public date field. The PHP API
-- can format it back to the existing public format (for example, Jul 22, 2026).

CREATE TABLE IF NOT EXISTS blogs (
  id                  VARCHAR(191) NOT NULL,
  title               VARCHAR(500) NOT NULL,
  slug                VARCHAR(191) NOT NULL,
  service_slug        VARCHAR(191) NULL,
  author              VARCHAR(255) NOT NULL,
  published_at        DATE NULL,
  read_time           VARCHAR(100) NOT NULL DEFAULT '5 min read',
  excerpt             TEXT NOT NULL,
  custom_image_url    VARCHAR(2048) NULL,
  display_order       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blogs_slug (slug),
  KEY idx_blogs_service_slug (service_slug),
  KEY idx_blogs_published_at (published_at),
  KEY idx_blogs_display_order (display_order),
  KEY idx_blogs_updated_at (updated_at),
  CONSTRAINT fk_blogs_service_slug
    FOREIGN KEY (service_slug) REFERENCES services (slug)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_content_blocks (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blog_id         VARCHAR(191) NOT NULL,
  block_type      VARCHAR(32) NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  content_text    LONGTEXT NULL,
  items_json      JSON NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blog_blocks_blog_order (blog_id, display_order),
  CONSTRAINT fk_blog_blocks_blog
    FOREIGN KEY (blog_id) REFERENCES blogs (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_legacy_slugs (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  blog_id         VARCHAR(191) NOT NULL,
  legacy_slug     VARCHAR(191) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_legacy_slug (legacy_slug),
  UNIQUE KEY uq_blog_legacy_slug_pair (blog_id, legacy_slug),
  KEY idx_blog_legacy_slugs_blog (blog_id),
  CONSTRAINT fk_blog_legacy_slugs_blog
    FOREIGN KEY (blog_id) REFERENCES blogs (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- CASE STUDIES
-- ---------------------------------------------------------------------------
-- CaseStudyData currently contains client, industry, overview, challenge,
-- solution, approach[], metrics[], and testimonial. There is currently no
-- stored image, technology list, featured flag, or separate CTA field.

CREATE TABLE IF NOT EXISTS case_studies (
  id                  VARCHAR(191) NOT NULL,
  client_name         VARCHAR(255) NOT NULL,
  slug                VARCHAR(191) NOT NULL,
  industry            VARCHAR(255) NOT NULL,
  overview            LONGTEXT NOT NULL,
  challenge           LONGTEXT NOT NULL,
  solution            LONGTEXT NOT NULL,
  testimonial_quote   TEXT NULL,
  testimonial_author  VARCHAR(255) NULL,
  display_order       INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_case_studies_slug (slug),
  KEY idx_case_studies_display_order (display_order),
  KEY idx_case_studies_updated_at (updated_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_approach_steps (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id   VARCHAR(191) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_case_approach_study_order (case_study_id, display_order),
  CONSTRAINT fk_case_approach_case_study
    FOREIGN KEY (case_study_id) REFERENCES case_studies (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_metrics (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id   VARCHAR(191) NOT NULL,
  value           VARCHAR(255) NOT NULL,
  label           VARCHAR(255) NOT NULL,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_case_metrics_study_order (case_study_id, display_order),
  CONSTRAINT fk_case_metrics_case_study
    FOREIGN KEY (case_study_id) REFERENCES case_studies (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS case_study_legacy_slugs (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  case_study_id   VARCHAR(191) NOT NULL,
  legacy_slug     VARCHAR(191) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_case_legacy_slug (legacy_slug),
  UNIQUE KEY uq_case_legacy_slug_pair (case_study_id, legacy_slug),
  KEY idx_case_legacy_slugs_case_study (case_study_id),
  CONSTRAINT fk_case_legacy_slugs_case_study
    FOREIGN KEY (case_study_id) REFERENCES case_studies (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- ADMIN SESSIONS
-- ---------------------------------------------------------------------------
-- The current React/Express authentication remains unchanged in Step 5A.
-- This optional table is ready for a future PHP API session implementation.
-- Store only a SHA-256 hash of an opaque session token, never ADMIN_SECRET.

CREATE TABLE IF NOT EXISTS admin_sessions (
  session_token_hash  CHAR(64) NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at          TIMESTAMP NOT NULL,
  ip_address          VARCHAR(45) NULL,
  user_agent          VARCHAR(512) NULL,
  PRIMARY KEY (session_token_hash),
  KEY idx_admin_sessions_expires_at (expires_at),
  KEY idx_admin_sessions_last_seen_at (last_seen_at)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
