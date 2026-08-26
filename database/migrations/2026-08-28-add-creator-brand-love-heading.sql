-- RaahX Creator Network: additive brand-love section heading
--
-- Adds one nullable Creator-specific presentation field. Existing Creator and
-- unrelated CMS records are preserved. No existing migration is modified.

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
