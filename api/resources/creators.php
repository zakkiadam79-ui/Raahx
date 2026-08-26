<?php
declare(strict_types=1);

function api_creators_list(PDO $pdo, array $filters = [], bool $publishedOnly = true): array
{
    $where = $publishedOnly ? ["c.status = 'published'"] : [];
    $params = [];
    $search = isset($filters['search']) && is_string($filters['search']) ? trim($filters['search']) : '';
    if ($search !== '') {
        if (mb_strlen($search) > 200) throw new ApiException(400, 'VALIDATION_ERROR', 'search is too long.');
        $where[] = '(c.display_name LIKE :search OR c.full_name LIKE :search OR c.short_bio LIKE :search OR c.about LIKE :search OR c.city LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }
    foreach (['city', 'status'] as $field) {
        if (!isset($filters[$field]) || !is_string($filters[$field]) || trim($filters[$field]) === '') continue;
        if ($field === 'status' && $publishedOnly) continue;
        $value = trim($filters[$field]);
        if ($field === 'status' && !in_array($value, ['published', 'hidden'], true)) {
            throw new ApiException(400, 'VALIDATION_ERROR', 'status must be published or hidden.');
        }
        if (mb_strlen($value) > 191) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is too long.', $field));
        $where[] = sprintf('c.%s = :%s', $field, $field);
        $params[$field] = $value;
    }
    foreach (['category' => 'creator_categories', 'platform' => 'creator_socials'] as $field => $table) {
        if (!isset($filters[$field]) || !is_string($filters[$field]) || trim($filters[$field]) === '') continue;
        $value = trim($filters[$field]);
        if (mb_strlen($value) > 191) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is too long.', $field));
        $column = $field === 'category' ? 'category' : 'platform';
        $where[] = sprintf('EXISTS (SELECT 1 FROM %s f WHERE f.creator_id = c.id AND f.%s = :%s)', $table, $column, $field);
        $params[$field] = $value;
    }
    $sort = isset($filters['sort']) && is_string($filters['sort']) ? $filters['sort'] : 'display_order';
    $effectiveFollowers = 'COALESCE(c.followers_override, c.followers)';
    $orderBy = match ($sort) {
        'newest' => 'c.approved_at DESC, c.created_at DESC',
        'followers' => $effectiveFollowers . ' DESC, c.display_order ASC',
        'engagement' => 'c.engagement_rate DESC, c.display_order ASC',
        'name' => 'c.display_name ASC, c.id ASC',
        'display_order' => 'c.display_order ASC, c.approved_at ASC, c.created_at ASC',
        default => throw new ApiException(400, 'VALIDATION_ERROR', 'sort must be newest, display_order, followers, engagement, or name.'),
    };
    $sql = 'SELECT c.* FROM creators c' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY ' . $orderBy;
    $statement = $pdo->prepare($sql);
    $statement->execute($params);
    return array_map(static fn (array $row): array => api_creator_with_children($pdo, $row, !$publishedOnly), $statement->fetchAll());
}

function api_creators_find(PDO $pdo, string $id, bool $publishedOnly = true): array
{
    $statement = $pdo->prepare('SELECT * FROM creators WHERE id = :id' . ($publishedOnly ? " AND status = 'published'" : '') . ' LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) throw new ApiException(404, 'NOT_FOUND', 'Creator not found.');
    return api_creator_with_children($pdo, $row, !$publishedOnly);
}

function api_creator_row(PDO $pdo, string $id): array
{
    $statement = $pdo->prepare('SELECT * FROM creators WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) throw new ApiException(404, 'NOT_FOUND', 'Creator not found.');
    return $row;
}

function api_creator_with_children(PDO $pdo, array $row, bool $includePrivate): array
{
    $id = (string) $row['id'];
    $socials = api_creator_child_rows($pdo, 'creator_socials', $id, 'platform, handle, profile_url, follower_count, follower_count_updated_at, display_order');
    $categories = api_creator_child_rows($pdo, 'creator_categories', $id, 'category, display_order');
    $expertise = api_creator_child_rows($pdo, 'creator_expertise', $id, 'expertise, display_order');
    $collaborations = api_creator_child_rows($pdo, 'creator_collaboration_types', $id, 'collaboration_type, display_order');
    $work = api_creator_child_rows($pdo, 'creator_featured_work', $id, 'title, work_url, platform, thumbnail_url, display_order');
    $brandLove = api_creator_child_rows($pdo, 'creator_brand_love_points', $id, 'heading, detail, icon_key, display_order');
    $result = [
        'id' => $id,
        'display_name' => $row['display_name'],
        'name' => $row['display_name'],
        'slug' => $row['slug'],
        'profile_image_url' => $row['profile_image_url'],
        'portfolio_url' => $row['portfolio_url'],
        'short_bio' => $row['short_bio'],
        'about' => $row['about'],
        'city' => $row['city'],
        'region' => $row['region'],
        'followers' => $row['followers_override'] === null ? (int) $row['followers'] : (int) $row['followers_override'],
        'followers_calculated' => (int) $row['followers'],
        'engagement_rate' => (float) $row['engagement_rate'],
        'compatibility_score' => $row['compatibility_score'] === null ? null : (int) $row['compatibility_score'],
        'is_verified' => (bool) $row['is_verified'],
        'status' => $row['status'],
        'display_order' => (int) $row['display_order'],
        'approved_at' => $row['approved_at'],
        'socials' => array_map(static fn (array $item): array => [
            'platform' => $item['platform'], 'handle' => $item['handle'], 'profile_url' => $item['profile_url'],
            'follower_count' => (int) $item['follower_count'], 'follower_count_updated_at' => $item['follower_count_updated_at'], 'display_order' => (int) $item['display_order'],
        ], $socials),
        'categories' => array_column($categories, 'category'),
        'expertise' => array_column($expertise, 'expertise'),
        'collaboration_types' => array_column($collaborations, 'collaboration_type'),
        'featured_work' => array_map(static fn (array $item): array => [
            'title' => $item['title'], 'work_url' => $item['work_url'], 'platform' => $item['platform'],
            'thumbnail_url' => $item['thumbnail_url'], 'display_order' => (int) $item['display_order'],
        ], $work),
        'brand_love_points' => array_map(static fn (array $item): array => [
            'heading'=>$item['heading'], 'detail'=>$item['detail'], 'icon_key'=>$item['icon_key'],
            'display_order'=>(int) $item['display_order'],
        ], $brandLove),
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
    if ($includePrivate) {
        $result['full_name'] = $row['full_name'];
        $result['email'] = $row['email'];
        $result['whatsapp'] = $row['whatsapp'];
        $result['followers_override'] = $row['followers_override'] === null ? null : (int) $row['followers_override'];
    }
    return $result;
}

function api_creator_child_rows(PDO $pdo, string $table, string $creatorId, string $columns): array
{
    $allowed = ['creator_socials', 'creator_categories', 'creator_expertise', 'creator_collaboration_types', 'creator_featured_work', 'creator_brand_love_points'];
    if (!in_array($table, $allowed, true)) throw new LogicException('Invalid Creator child table.');
    $statement = $pdo->prepare(sprintf('SELECT %s FROM %s WHERE creator_id = :creator_id ORDER BY display_order ASC, id ASC', $columns, $table));
    $statement->execute(['creator_id' => $creatorId]);
    return $statement->fetchAll();
}

function api_creators_create(PDO $pdo, array $input): array
{
    $payload = api_creator_payload($input, null, true);
    $id = Validation::id($input, 'id', false) ?? raahx_new_id('creator');
    Validation::uniqueSlug($pdo, 'creators', $payload['slug']);
    api_creator_assert_email_available($pdo, $payload['email']);
    $pdo->beginTransaction();
    try {
        api_creators_insert($pdo, $id, $payload);
        api_creators_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw api_creator_storage_exception($exception);
    }
    return api_creators_find($pdo, $id, false);
}

function api_creators_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_creators_find($pdo, $id, false);
    $payload = api_creator_payload($input, $existing, true);
    Validation::uniqueSlug($pdo, 'creators', $payload['slug'], $id);
    api_creator_assert_email_available($pdo, $payload['email'], $id);
    $pdo->beginTransaction();
    try {
        api_creators_update_parent($pdo, $id, $payload);
        api_creators_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw api_creator_storage_exception($exception);
    }
    return api_creators_find($pdo, $id, false);
}

function api_creators_self_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_creators_find($pdo, $id, false);
    $allowed = ['display_name', 'email', 'whatsapp', 'profile_image_url', 'portfolio_url', 'short_bio', 'about', 'city', 'region', 'socials', 'categories', 'expertise', 'collaboration_types', 'featured_work', 'brand_love_points'];
    $safe = array_intersect_key($input, array_flip($allowed));
    $payload = api_creator_payload($safe, $existing, false);
    api_creator_assert_email_available($pdo, $payload['email'], $id);
    $pdo->beginTransaction();
    try {
        api_creators_update_parent($pdo, $id, $payload);
        api_creators_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw api_creator_storage_exception($exception);
    }
    return api_creators_find($pdo, $id, false);
}

function api_creators_delete(PDO $pdo, string $id): void
{
    api_creator_row($pdo, $id);
    $statement = $pdo->prepare('DELETE FROM creators WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_creator_payload(array $input, ?array $existing = null, bool $adminControlled = true): array
{
    $source = array_merge($existing ?? [], $input);
    if (!isset($source['display_name']) && isset($source['name'])) $source['display_name'] = $source['name'];
    if (!isset($source['full_name']) && isset($source['display_name'])) $source['full_name'] = $source['display_name'];
    $displayName = Validation::string($source, 'display_name', true, 255) ?? '';
    $slugValue = Validation::string($source, 'slug', false, 191) ?? api_creator_slug_seed($displayName);
    $status = $adminControlled ? (Validation::string($source, 'status', false, 32) ?? 'hidden') : (string) ($existing['status'] ?? 'hidden');
    if (!in_array($status, ['published', 'hidden'], true)) throw new ApiException(400, 'VALIDATION_ERROR', 'status must be published or hidden.');
    return [
        'full_name' => Validation::string($source, 'full_name', true, 255),
        'display_name' => $displayName,
        'email' => Validation::email($source, 'email'),
        'whatsapp' => Validation::nullableString($source, 'whatsapp', 100),
        'slug' => Validation::slug($slugValue, 'slug'),
        'profile_image_url' => Validation::url($source, 'profile_image_url', true),
        'portfolio_url' => Validation::url($source, 'portfolio_url'),
        'short_bio' => Validation::nullableString($source, 'short_bio', 5000),
        'about' => Validation::nullableString($source, 'about', 100000),
        'city' => Validation::nullableString($source, 'city', 191),
        'region' => Validation::nullableString($source, 'region', 191),
        'followers_override' => $adminControlled ? api_creator_nullable_unsigned($source, 'followers_override') : ($existing['followers_override'] ?? null),
        'engagement_rate' => $adminControlled ? api_creator_decimal($source, 'engagement_rate', 0, 100) : (float) ($existing['engagement_rate'] ?? 0),
        'compatibility_score' => $adminControlled ? api_creator_nullable_score($source, 'compatibility_score') : ($existing['compatibility_score'] ?? null),
        'is_verified' => $adminControlled ? api_creator_boolean($source, 'is_verified', false) : (bool) ($existing['is_verified'] ?? false),
        'status' => $status,
        'display_order' => $adminControlled ? api_creator_unsigned_integer($source, 'display_order') : (int) ($existing['display_order'] ?? 0),
        'approved_at' => $source['approved_at'] ?? ($existing['approved_at'] ?? null),
        'socials' => api_creator_socials($source['socials'] ?? []),
        'categories' => api_creator_string_list($source['categories'] ?? [], 'categories'),
        'expertise' => api_creator_string_list($source['expertise'] ?? [], 'expertise'),
        'collaboration_types' => api_creator_string_list($source['collaboration_types'] ?? [], 'collaboration_types'),
        'featured_work' => api_creator_featured_work($source['featured_work'] ?? []),
        'brand_love_points' => api_creator_brand_love_points($source['brand_love_points'] ?? []),
    ];
}

function api_creator_socials(mixed $value): array
{
    if (!is_array($value)) throw new ApiException(400, 'VALIDATION_ERROR', 'socials must be an array.');
    $result = [];
    foreach ($value as $index => $item) {
        if (!is_array($item)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('socials[%d] must be an object.', $index));
        $result[] = [
            'platform' => Validation::string($item, 'platform', true, 100),
            'handle' => Validation::nullableString($item, 'handle', 255),
            'profile_url' => api_creator_required_url($item, 'profile_url'),
            'follower_count' => api_creator_unsigned_integer($item, 'follower_count'),
            'display_order' => api_creator_unsigned_integer($item, 'display_order', $index),
        ];
    }
    return $result;
}

function api_creator_featured_work(mixed $value): array
{
    if (!is_array($value)) throw new ApiException(400, 'VALIDATION_ERROR', 'featured_work must be an array.');
    $result = [];
    foreach ($value as $index => $item) {
        if (!is_array($item)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('featured_work[%d] must be an object.', $index));
        $result[] = [
            'title' => Validation::string($item, 'title', true, 255),
            'work_url' => api_creator_required_url($item, 'work_url'),
            'platform' => Validation::nullableString($item, 'platform', 100),
            'thumbnail_url' => Validation::url($item, 'thumbnail_url', true),
            'display_order' => api_creator_unsigned_integer($item, 'display_order', $index),
        ];
    }
    return $result;
}

function api_creator_required_url(array $data, string $key): string
{
    $url = Validation::url($data, $key);
    if ($url === null) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is required.', $key));
    return $url;
}

function api_creator_string_list(mixed $value, string $field): array
{
    if (!is_array($value)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be an array.', $field));
    $result = [];
    $used = [];
    foreach ($value as $index => $item) {
        if (!is_string($item)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s[%d] must be a string.', $field, $index));
        $item = trim($item);
        if ($item === '' || mb_strlen($item) > 191) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s[%d] must be 1-191 characters.', $field, $index));
        $key = mb_strtolower($item);
        if (isset($used[$key])) continue;
        $used[$key] = true;
        $result[] = $item;
    }
    return $result;
}

function api_creator_unsigned_integer(array $data, string $key, int $default = 0): int
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (filter_var($data[$key], FILTER_VALIDATE_INT) === false || (int) $data[$key] < 0) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a non-negative integer.', $key));
    return (int) $data[$key];
}

function api_creator_nullable_unsigned(array $data, string $key): ?int
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return null;
    return api_creator_unsigned_integer($data, $key);
}

function api_creator_decimal(array $data, string $key, float $default, float $maximum): float
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (!is_numeric($data[$key])) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a number.', $key));
    $value = (float) $data[$key];
    if (!is_finite($value) || $value < 0 || $value > $maximum) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be between 0 and %s.', $key, $maximum));
    return round($value, 2);
}

function api_creator_nullable_score(array $data, string $key): ?int
{
    $value = api_creator_nullable_unsigned($data, $key);
    if ($value !== null && $value > 100) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be between 0 and 100.', $key));
    return $value;
}

function api_creator_boolean(array $data, string $key, bool $default): bool
{
    if (!array_key_exists($key, $data) || $data[$key] === null || $data[$key] === '') return $default;
    if (is_bool($data[$key])) return $data[$key];
    if (in_array($data[$key], [1, '1', 'true'], true)) return true;
    if (in_array($data[$key], [0, '0', 'false'], true)) return false;
    throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a boolean.', $key));
}

function api_creator_slug_seed(string $value): string
{
    $slug = strtolower(trim((string) preg_replace('/[^a-z0-9]+/i', '-', $value), '-'));
    return $slug !== '' ? $slug : 'creator';
}

function api_creator_available_slug(PDO $pdo, string $seed): string
{
    $base = api_creator_slug_seed($seed);
    $slug = $base;
    $suffix = 2;
    while (true) {
        $statement = $pdo->prepare('SELECT id FROM creators WHERE slug = :slug LIMIT 1');
        $statement->execute(['slug' => $slug]);
        if ($statement->fetchColumn() === false) return $slug;
        $slug = $base . '-' . $suffix++;
    }
}

function api_creator_next_display_order(PDO $pdo): int
{
    $statement = $pdo->prepare('SELECT COALESCE(MAX(display_order), -1) + 1 FROM creators');
    $statement->execute();
    return (int) $statement->fetchColumn();
}

function api_creator_assert_email_available(PDO $pdo, string $email, ?string $ignoreId = null): void
{
    $sql = 'SELECT id FROM creators WHERE email = :email' . ($ignoreId !== null ? ' AND id <> :id' : '') . ' LIMIT 1';
    $statement = $pdo->prepare($sql);
    $params = ['email' => $email];
    if ($ignoreId !== null) $params['id'] = $ignoreId;
    $statement->execute($params);
    if ($statement->fetchColumn() !== false) throw new ApiException(409, 'DUPLICATE_EMAIL', 'That Creator email is already in use.');
}

function api_creators_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare('INSERT INTO creators
        (id, full_name, display_name, email, whatsapp, slug, profile_image_url, portfolio_url, short_bio, about, city, region,
         followers, followers_override, engagement_rate, compatibility_score, is_verified, status, display_order, approved_at)
        VALUES
        (:id, :full_name, :display_name, :email, :whatsapp, :slug, :profile_image_url, :portfolio_url, :short_bio, :about, :city, :region,
         0, :followers_override, :engagement_rate, :compatibility_score, :is_verified, :status, :display_order, :approved_at)');
    $statement->execute(array_merge(['id' => $id], api_creator_parent_parameters($payload)));
}

function api_creators_update_parent(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare('UPDATE creators SET full_name=:full_name, display_name=:display_name, email=:email,
        whatsapp=:whatsapp, slug=:slug, profile_image_url=:profile_image_url, portfolio_url=:portfolio_url, short_bio=:short_bio, about=:about,
        city=:city, region=:region, followers_override=:followers_override, engagement_rate=:engagement_rate,
        compatibility_score=:compatibility_score, is_verified=:is_verified, status=:status,
        display_order=:display_order, approved_at=:approved_at WHERE id=:id');
    $statement->execute(array_merge(['id' => $id], api_creator_parent_parameters($payload)));
}

function api_creator_parent_parameters(array $payload): array
{
    return [
        'full_name'=>$payload['full_name'], 'display_name'=>$payload['display_name'], 'email'=>$payload['email'],
        'whatsapp'=>$payload['whatsapp'], 'slug'=>$payload['slug'], 'profile_image_url'=>$payload['profile_image_url'],
        'portfolio_url'=>$payload['portfolio_url'], 'short_bio'=>$payload['short_bio'], 'about'=>$payload['about'], 'city'=>$payload['city'], 'region'=>$payload['region'],
        'followers_override'=>$payload['followers_override'], 'engagement_rate'=>$payload['engagement_rate'],
        'compatibility_score'=>$payload['compatibility_score'], 'is_verified'=>$payload['is_verified'] ? 1 : 0,
        'status'=>$payload['status'], 'display_order'=>$payload['display_order'], 'approved_at'=>$payload['approved_at'],
    ];
}

function api_creators_replace_children(PDO $pdo, string $creatorId, array $payload): void
{
    foreach (['creator_socials', 'creator_categories', 'creator_expertise', 'creator_collaboration_types', 'creator_featured_work', 'creator_brand_love_points'] as $table) {
        $delete = $pdo->prepare(sprintf('DELETE FROM %s WHERE creator_id = :creator_id', $table));
        $delete->execute(['creator_id' => $creatorId]);
    }
    api_creator_insert_rows($pdo, 'creator_socials', $creatorId, $payload['socials']);
    api_creator_insert_values($pdo, 'creator_categories', 'category', $creatorId, $payload['categories']);
    api_creator_insert_values($pdo, 'creator_expertise', 'expertise', $creatorId, $payload['expertise']);
    api_creator_insert_values($pdo, 'creator_collaboration_types', 'collaboration_type', $creatorId, $payload['collaboration_types']);
    api_creator_insert_rows($pdo, 'creator_featured_work', $creatorId, $payload['featured_work']);
    api_creator_insert_rows($pdo, 'creator_brand_love_points', $creatorId, $payload['brand_love_points']);
    api_creator_recalculate_followers($pdo, $creatorId);
}

function api_creator_insert_rows(PDO $pdo, string $table, string $creatorId, array $rows): void
{
    if ($table === 'creator_socials') {
        $statement = $pdo->prepare('INSERT INTO creator_socials (creator_id, platform, handle, profile_url, follower_count, display_order) VALUES (:creator_id,:platform,:handle,:profile_url,:follower_count,:display_order)');
    } elseif ($table === 'creator_featured_work') {
        $statement = $pdo->prepare('INSERT INTO creator_featured_work (creator_id, title, work_url, platform, thumbnail_url, display_order) VALUES (:creator_id,:title,:work_url,:platform,:thumbnail_url,:display_order)');
    } elseif ($table === 'creator_brand_love_points') {
        $statement = $pdo->prepare('INSERT INTO creator_brand_love_points (creator_id, heading, detail, icon_key, display_order) VALUES (:creator_id,:heading,:detail,:icon_key,:display_order)');
    } else throw new LogicException('Invalid Creator row table.');
    foreach ($rows as $row) $statement->execute(array_merge(['creator_id' => $creatorId], $row));
}

function api_creator_insert_values(PDO $pdo, string $table, string $column, string $creatorId, array $values): void
{
    $allowed = ['creator_categories'=>'category', 'creator_expertise'=>'expertise', 'creator_collaboration_types'=>'collaboration_type'];
    if (($allowed[$table] ?? null) !== $column) throw new LogicException('Invalid Creator value table.');
    $statement = $pdo->prepare(sprintf('INSERT INTO %s (creator_id, %s, display_order) VALUES (:creator_id, :value, :display_order)', $table, $column));
    foreach ($values as $index => $value) $statement->execute(['creator_id'=>$creatorId, 'value'=>$value, 'display_order'=>$index]);
}

function api_creator_recalculate_followers(PDO $pdo, string $creatorId): int
{
    $sum = $pdo->prepare('SELECT COALESCE(SUM(follower_count), 0) FROM creator_socials WHERE creator_id = :creator_id');
    $sum->execute(['creator_id' => $creatorId]);
    $followers = (int) $sum->fetchColumn();
    $update = $pdo->prepare('UPDATE creators SET followers = :followers WHERE id = :id');
    $update->execute(['followers' => $followers, 'id' => $creatorId]);
    return $followers;
}

function api_creator_storage_exception(Throwable $exception): Throwable
{
    if ($exception instanceof ApiException) return $exception;
    if ($exception instanceof PDOException && $exception->getCode() === '23000') return new ApiException(409, 'CREATOR_CONFLICT', 'The Creator conflicts with an existing unique value.', $exception);
    return $exception;
}
