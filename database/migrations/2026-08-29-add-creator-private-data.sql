-- RaahX Creator Network: additive private identity and pricing storage
--
-- Adds isolated one-to-one private records for approved Creators and pending
-- applications. Existing Creator and unrelated CMS data is preserved.

CREATE TABLE IF NOT EXISTS creator_private_data (
  creator_id          VARCHAR(191) NOT NULL,
  cnic_ciphertext     TEXT NULL,
  cnic_last4          CHAR(4) NULL,
  pricing_min         DECIMAL(12,2) UNSIGNED NULL,
  pricing_max         DECIMAL(12,2) UNSIGNED NULL,
  pricing_currency    CHAR(3) NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (creator_id),
  CONSTRAINT fk_creator_private_data_creator
    FOREIGN KEY (creator_id) REFERENCES creators (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS creator_application_private_data (
  application_id      VARCHAR(191) NOT NULL,
  cnic_ciphertext     TEXT NULL,
  cnic_last4          CHAR(4) NULL,
  pricing_min         DECIMAL(12,2) UNSIGNED NULL,
  pricing_max         DECIMAL(12,2) UNSIGNED NULL,
  pricing_currency    CHAR(3) NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (application_id),
  CONSTRAINT fk_creator_application_private_data_application
    FOREIGN KEY (application_id) REFERENCES creator_applications (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
