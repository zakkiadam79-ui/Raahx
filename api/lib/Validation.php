<?php
declare(strict_types=1);

final class Validation
{
    public static function string(array $data, string $key, bool $required = true, int $maxLength = 10000): ?string
    {
        if (!array_key_exists($key, $data) || $data[$key] === null) {
            if ($required) {
                throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is required.', $key));
            }
            return null;
        }

        if (!is_string($data[$key])) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a string.', $key));
        }

        $value = trim($data[$key]);
        if ($required && $value === '') {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is required.', $key));
        }
        if (mb_strlen($value) > $maxLength) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is too long.', $key));
        }

        return $value;
    }

    public static function nullableString(array $data, string $key, int $maxLength = 10000): ?string
    {
        $value = self::string($data, $key, false, $maxLength);
        return $value === '' ? null : $value;
    }

    public static function email(array $data, string $key = 'email', bool $required = true): ?string
    {
        $value = self::string($data, $key, $required, 254);
        if ($value === null) return null;
        if (preg_match('/[\\r\\n]/', $value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a valid email address.', $key));
        }

        return strtolower($value);
    }

    public static function slug(string $value, string $field = 'slug'): string
    {
        $value = strtolower(trim($value));
        if ($value === '' || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be URL-safe lowercase text separated by hyphens.', $field));
        }
        if (mb_strlen($value) > 191) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is too long.', $field));
        }

        return $value;
    }

    public static function id(array $data, string $key = 'id', bool $required = true): ?string
    {
        $value = self::string($data, $key, $required, 191);
        if ($value !== null && !preg_match('/^[A-Za-z0-9._-]+$/', $value)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is invalid.', $key));
        }

        return $value;
    }

    public static function integer(array $data, string $key, int $default = 0): int
    {
        if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') {
            return $default;
        }
        if (filter_var($data[$key], FILTER_VALIDATE_INT) === false) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an integer.', $key));
        }

        return max(0, (int) $data[$key]);
    }

    public static function arrayValue(array $data, string $key): array
    {
        if (!array_key_exists($key, $data) || $data[$key] === null) {
            return [];
        }
        if (!is_array($data[$key])) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an array.', $key));
        }

        return $data[$key];
    }

    public static function url(array $data, string $key, bool $allowRelative = false): ?string
    {
        $value = self::nullableString($data, $key, 2048);
        if ($value === null) return null;
        if ($allowRelative && preg_match('/^\/(?!\/)/', $value)) {
            return $value;
        }
        if (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $value)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an http(s) URL.', $key));
        }

        return $value;
    }

    public static function date(array $data, string $key, bool $required = true): ?string
    {
        $value = self::string($data, $key, $required, 10);
        if ($value === null) return null;

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = DateTimeImmutable::getLastErrors();
        if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must use YYYY-MM-DD format.', $key));
        }

        return $date->format('Y-m-d');
    }

    public static function uniqueSlug(PDO $pdo, string $table, string $slug, ?string $ignoreId = null): void
    {
        // $table is always selected by server-side code, never user input.
        $sql = sprintf('SELECT id FROM %s WHERE slug = :slug', $table);
        if ($ignoreId !== null) {
            $sql .= ' AND id <> :id';
        }
        $sql .= ' LIMIT 1';

        $statement = $pdo->prepare($sql);
        $statement->bindValue(':slug', $slug, PDO::PARAM_STR);
        if ($ignoreId !== null) {
            $statement->bindValue(':id', $ignoreId, PDO::PARAM_STR);
        }
        $statement->execute();

        if ($statement->fetchColumn() !== false) {
            throw new ApiException(409, 'DUPLICATE_SLUG', 'That URL slug is already in use.');
        }
    }
}
