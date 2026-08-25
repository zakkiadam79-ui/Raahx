<?php
declare(strict_types=1);

function api_creators_list(PDO $pdo, array $filters = [], bool $publishedOnly = true): array
{
    $where = [];
    $params = [];

    if ($publishedOnly) {
        $where[] = "c.status = 'published'";
    }

    $search = isset($filters['search']) && is_string($filters['search'])
        ? trim($filters['search'])
        : '';
    if ($search !== '') {
        if (mb_strlen($search) > 200) {
            throw new ApiException(400, 'VALIDATION_ERROR', 'search is too long.');
        }
        $where[] = '(c.name LIKE :search OR c.short_bio LIKE :search OR c.about LIKE :search OR c.category LIKE :search OR c.city LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }

    foreach (['category', 'city', 'status'] as $field) {
        if (!isset($filters[$field]) || !is_string($filters[$field]) || trim($filters[$field]) === '') continue;
        if ($field === 'status' && $publishedOnly) continue;
        $value = trim($filters[$field]);
        if (mb_strlen($value) > 191) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is too long.', $field));
        }
        if ($field === 'status' && !in_array($value, ['published', 'hidden'], true)) {
            throw new ApiException(400, 'VALIDATION_ERROR', 'status must be published or hidden.');
        }
        $where[] = sprintf('c.%s = :%s', $field, $field);
        $params[$field] = $value;
    }

    if (isset($filters['platform']) && is_string($filters['platform']) && trim($filters['platform']) !== '') {
        $platform = trim($filters['platform']);
        if (mb_strlen($platform) > 100) {
            throw new ApiException(400, 'VALIDATION_ERROR', 'platform is too long.');
        }
        $where[] = 'EXISTS (
            SELECT 1 FROM creator_socials platform_social
            WHERE platform_social.creator_id = c.id AND platform_social.platform = :platform
        )';
        $params['platform'] = $platform;
    }

    $sort = isset($filters['sort']) && is_string($filters['sort']) ? $filters['sort'] : 'display_order';
    $orderBy = match ($sort) {
        'followers' => 'c.followers DESC, c.display_order ASC, c.created_at ASC',
        'engagement' => 'c.engagement_rate DESC, c.display_order ASC, c.created_at ASC',
        'name' => 'c.name ASC, c.display_order ASC',
        'newest' => 'c.created_at DESC, c.display_order ASC',
        'display_order' => 'c.display_order ASC, c.created_at ASC',
        default => throw new ApiException(400, 'VALIDATION_ERROR', 'sort must be display_order, followers, engagement, name, or newest.'),
    };

    $sql = 'SELECT c.* FROM creators c';
    if ($where !== []) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY ' . $orderBy;

    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    return array_map(
        static fn (array $row): array => api_creator_with_children($pdo, $row),
        $statement->fetchAll(),
    );
}

function api_creators_find(PDO $pdo, string $id, bool $publishedOnly = true): array
{
    $sql = 'SELECT * FROM creators WHERE id = :id';
    if ($publishedOnly) $sql .= " AND status = 'published'";
    $sql .= ' LIMIT 1';

    $statement = $pdo->prepare($sql);
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Creator not found.');
    }

    return api_creator_with_children($pdo, $row);
}

function api_creators_create(PDO $pdo, array $input): array
{
    $payload = api_creator_payload($input);
    Validation::uniqueSlug($pdo, 'creators', $payload['slug']);
    $id = Validation::id($input, 'id', false) ?? raahx_new_id('creator');

    $pdo->beginTransaction();
    try {
        api_creators_insert($pdo, $id, $payload);
        api_creators_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The Creator could not be created because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_creators_find($pdo, $id, false);
}

function api_creators_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_creators_find($pdo, $id, false);
    $payload = api_creator_payload($input, $existing);
    Validation::uniqueSlug($pdo, 'creators', $payload['slug'], $id);

    $pdo->beginTransaction();
    try {
        $statement = $pdo->prepare(
            'UPDATE creators SET
                name = :name,
                slug = :slug,
                profile_image_url = :profile_image_url,
                short_bio = :short_bio,
                about = :about,
                category = :category,
                city = :city,
                region = :region,
                followers = :followers,
                engagement_rate = :engagement_rate,
                compatibility_score = :compatibility_score,
                is_verified = :is_verified,
                status = :status,
                display_order = :display_order
             WHERE id = :id',
        );
        $statement->execute(array_merge(
            ['id' => $id],
            api_creator_parent_parameters($payload),
        ));
        api_creators_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The Creator could not be updated because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_creators_find($pdo, $id, false);
}

function api_creators_delete(PDO $pdo, string $id): void
{
    api_creators_find($pdo, $id, false);
    // The Creator migration defines cascading foreign keys for all three child tables.
    $statement = $pdo->prepare('DELETE FROM creators WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_creator_with_children(PDO $pdo, array $row): array
{
    $socials = $pdo->prepare(
        'SELECT platform, handle, profile_url, follower_count, display_order
         FROM creator_socials WHERE creator_id = :creator_id
         ORDER BY display_order ASC, id ASC',
    );
    $socials->execute(['creator_id' => $row['id']]);

    $expertise = $pdo->prepare(
        'SELECT expertise FROM creator_expertise WHERE creator_id = :creator_id
         ORDER BY display_order ASC, id ASC',
    );
    $expertise->execute(['creator_id' => $row['id']]);

    $collaborations = $pdo->prepare(
        'SELECT collaboration_type FROM creator_collaboration_types WHERE creator_id = :creator_id
         ORDER BY display_order ASC, id ASC',
    );
    $collaborations->execute(['creator_id' => $row['id']]);

    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'profile_image_url' => $row['profile_image_url'],
        'short_bio' => $row['short_bio'],
        'about' => $row['about'],
        'category' => $row['category'],
        'city' => $row['city'],
        'region' => $row['region'],
        'followers' => (int) $row['followers'],
        'engagement_rate' => (float) $row['engagement_rate'],
        'compatibility_score' => $row['compatibility_score'] === null ? null : (int) $row['compatibility_score'],
        'is_verified' => (bool) $row['is_verified'],
        'status' => $row['status'],
        'display_order' => (int) $row['display_order'],
        'socials' => array_map(
            static fn (array $social): array => [
                'platform' => $social['platform'],
                'handle' => $social['handle'],
                'profile_url' => $social['profile_url'],
                'follower_count' => (int) $social['follower_count'],
                'display_order' => (int) $social['display_order'],
            ],
            $socials->fetchAll(),
        ),
        'expertise' => array_column($expertise->fetchAll(), 'expertise'),
        'collaboration_types' => array_column($collaborations->fetchAll(), 'collaboration_type'),
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function api_creator_payload(array $input, ?array $existing = null): array
{
    if (!array_key_exists('profile_image_url', $input) && array_key_exists('image', $input)) {
        $input['profile_image_url'] = $input['image'];
    }
    if (!array_key_exists('short_bio', $input) && array_key_exists('shortBio', $input)) {
        $input['short_bio'] = $input['shortBio'];
    }
    if (!array_key_exists('engagement_rate', $input) && array_key_exists('engagement', $input)) {
        $input['engagement_rate'] = $input['engagement'];
    }
    if (!array_key_exists('compatibility_score', $input) && array_key_exists('compatibility', $input)) {
        $input['compatibility_score'] = $input['compatibility'];
    }
    if (!array_key_exists('is_verified', $input) && array_key_exists('verified', $input)) {
        $input['is_verified'] = $input['verified'];
    }
    if (!array_key_exists('collaboration_types', $input) && array_key_exists('availableFor', $input)) {
        $input['collaboration_types'] = $input['availableFor'];
    }

    $source = array_merge($existing ?? [], $input);
    $name = Validation::string($source, 'name', true, 255);
    $slug = Validation::slug(Validation::string($source, 'slug', true, 191) ?? '', 'slug');
    $status = Validation::string($source, 'status', false, 32) ?? 'published';
    if (!in_array($status, ['published', 'hidden'], true)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'status must be published or hidden.');
    }

    return [
        'name' => $name,
        'slug' => $slug,
        'profile_image_url' => Validation::url($source, 'profile_image_url', true),
        'short_bio' => Validation::nullableString($source, 'short_bio', 5000),
        'about' => Validation::nullableString($source, 'about', 100000),
        'category' => Validation::nullableString($source, 'category', 191),
        'city' => Validation::nullableString($source, 'city', 191),
        'region' => Validation::nullableString($source, 'region', 191),
        'followers' => api_creator_unsigned_integer($source, 'followers'),
        'engagement_rate' => api_creator_decimal($source, 'engagement_rate', 0.0, 100.0),
        'compatibility_score' => api_creator_nullable_score($source, 'compatibility_score'),
        'is_verified' => api_creator_boolean($source, 'is_verified', false),
        'status' => $status,
        'display_order' => api_creator_unsigned_integer($source, 'display_order'),
        'socials' => api_creator_socials($source['socials'] ?? []),
        'expertise' => api_creator_string_list($source['expertise'] ?? [], 'expertise'),
        'collaboration_types' => api_creator_string_list($source['collaboration_types'] ?? [], 'collaboration_types'),
    ];
}

function api_creator_unsigned_integer(array $data, string $key, int $default = 0): int
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (filter_var($data[$key], FILTER_VALIDATE_INT) === false || (int) $data[$key] < 0) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a non-negative integer.', $key));
    }
    return (int) $data[$key];
}

function api_creator_decimal(array $data, string $key, float $default, float $maximum): float
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (!is_int($data[$key]) && !is_float($data[$key]) && !is_string($data[$key])) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a number.', $key));
    }
    if (!is_numeric($data[$key])) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a number.', $key));
    }
    $value = (float) $data[$key];
    if (!is_finite($value) || $value < 0 || $value > $maximum) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be between 0 and %s.', $key, $maximum));
    }
    return round($value, 2);
}

function api_creator_nullable_score(array $data, string $key): ?int
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return null;
    if (filter_var($data[$key], FILTER_VALIDATE_INT) === false) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an integer.', $key));
    }
    $value = (int) $data[$key];
    if ($value < 0 || $value > 100) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be between 0 and 100.', $key));
    }
    return $value;
}

function api_creator_boolean(array $data, string $key, bool $default): bool
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (is_bool($data[$key])) return $data[$key];
    if ($data[$key] === 1 || $data[$key] === '1' || $data[$key] === 'true') return true;
    if ($data[$key] === 0 || $data[$key] === '0' || $data[$key] === 'false') return false;
    throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a boolean.', $key));
}

function api_creator_socials(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'socials must be an array.');
    }

    $result = [];
    $usedPlatforms = [];
    foreach ($value as $index => $social) {
        if (!is_array($social)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('socials[%d] must be an object.', $index));
        }
        $platform = Validation::string($social, 'platform', true, 100) ?? '';
        $platformKey = mb_strtolower($platform);
        if (isset($usedPlatforms[$platformKey])) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('socials contains duplicate platform "%s".', $platform));
        }
        $usedPlatforms[$platformKey] = true;
        $result[] = [
            'platform' => $platform,
            'handle' => Validation::nullableString($social, 'handle', 255),
            'profile_url' => Validation::url($social, 'profile_url'),
            'follower_count' => api_creator_unsigned_integer($social, 'follower_count'),
            'display_order' => api_creator_unsigned_integer($social, 'display_order', $index),
        ];
    }
    return $result;
}

function api_creator_string_list(mixed $value, string $field): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an array.', $field));
    }

    $result = [];
    $used = [];
    foreach ($value as $index => $item) {
        if (!is_string($item)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s[%d] must be a string.', $field, $index));
        }
        $normalized = trim($item);
        if ($normalized === '' || mb_strlen($normalized) > 191) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s[%d] must be between 1 and 191 characters.', $field, $index));
        }
        $key = mb_strtolower($normalized);
        if (isset($used[$key])) continue;
        $used[$key] = true;
        $result[] = $normalized;
    }
    return $result;
}

function api_creators_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare(
        'INSERT INTO creators
            (id, name, slug, profile_image_url, short_bio, about, category, city, region,
             followers, engagement_rate, compatibility_score, is_verified, status, display_order)
         VALUES
            (:id, :name, :slug, :profile_image_url, :short_bio, :about, :category, :city, :region,
             :followers, :engagement_rate, :compatibility_score, :is_verified, :status, :display_order)',
    );
    $statement->execute(array_merge(
        ['id' => $id],
        api_creator_parent_parameters($payload),
    ));
}

function api_creator_parent_parameters(array $payload): array
{
    return [
        'name' => $payload['name'],
        'slug' => $payload['slug'],
        'profile_image_url' => $payload['profile_image_url'],
        'short_bio' => $payload['short_bio'],
        'about' => $payload['about'],
        'category' => $payload['category'],
        'city' => $payload['city'],
        'region' => $payload['region'],
        'followers' => $payload['followers'],
        'engagement_rate' => $payload['engagement_rate'],
        'compatibility_score' => $payload['compatibility_score'],
        'is_verified' => $payload['is_verified'] ? 1 : 0,
        'status' => $payload['status'],
        'display_order' => $payload['display_order'],
    ];
}

function api_creators_replace_children(PDO $pdo, string $id, array $payload): void
{
    foreach (['creator_socials', 'creator_expertise', 'creator_collaboration_types'] as $table) {
        // The table names are fixed server-side constants, never request values.
        $delete = $pdo->prepare(sprintf('DELETE FROM %s WHERE creator_id = :creator_id', $table));
        $delete->execute(['creator_id' => $id]);
    }

    $socialStatement = $pdo->prepare(
        'INSERT INTO creator_socials
            (creator_id, platform, handle, profile_url, follower_count, display_order)
         VALUES
            (:creator_id, :platform, :handle, :profile_url, :follower_count, :display_order)',
    );
    foreach ($payload['socials'] as $social) {
        $socialStatement->execute(array_merge(['creator_id' => $id], $social));
    }

    $expertiseStatement = $pdo->prepare(
        'INSERT INTO creator_expertise (creator_id, expertise, display_order)
         VALUES (:creator_id, :expertise, :display_order)',
    );
    foreach ($payload['expertise'] as $index => $expertise) {
        $expertiseStatement->execute([
            'creator_id' => $id,
            'expertise' => $expertise,
            'display_order' => $index,
        ]);
    }

    $collaborationStatement = $pdo->prepare(
        'INSERT INTO creator_collaboration_types (creator_id, collaboration_type, display_order)
         VALUES (:creator_id, :collaboration_type, :display_order)',
    );
    foreach ($payload['collaboration_types'] as $index => $type) {
        $collaborationStatement->execute([
            'creator_id' => $id,
            'collaboration_type' => $type,
            'display_order' => $index,
        ]);
    }
}
