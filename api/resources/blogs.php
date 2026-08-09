<?php
declare(strict_types=1);

function api_blogs_list(PDO $pdo): array
{
    $statement = $pdo->query(
        'SELECT * FROM blogs ORDER BY display_order ASC, published_at DESC, created_at DESC',
    );
    return array_map(
        static fn (array $row): array => api_blog_with_children($pdo, $row),
        $statement->fetchAll(),
    );
}

function api_blogs_find(PDO $pdo, string $id): array
{
    $statement = $pdo->prepare('SELECT * FROM blogs WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Blog not found.');
    }

    return api_blog_with_children($pdo, $row);
}

function api_blogs_find_by_slug(PDO $pdo, string $slug): array
{
    $statement = $pdo->prepare(
        'SELECT b.* FROM blogs b
         LEFT JOIN blog_legacy_slugs legacy ON legacy.blog_id = b.id
         WHERE b.slug = :current_slug OR legacy.legacy_slug = :legacy_slug
         LIMIT 1',
    );
    $statement->execute([
        'current_slug' => $slug,
        'legacy_slug' => $slug,
    ]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Blog not found.');
    }

    return api_blog_with_children($pdo, $row);
}

function api_blogs_create(PDO $pdo, array $input): array
{
    $payload = api_blogs_payload($pdo, $input);
    Validation::uniqueSlug($pdo, 'blogs', $payload['slug']);
    api_blogs_assert_legacy_slugs_available($pdo, $payload['legacy_slugs']);

    $id = Validation::id($input, 'id', false) ?? raahx_new_id('blog');
    $pdo->beginTransaction();
    try {
        api_blogs_insert($pdo, $id, $payload);
        api_blogs_replace_children($pdo, $id, $payload['content'], $payload['legacy_slugs']);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The blog could not be created because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_blogs_find($pdo, $id);
}

function api_blogs_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_blogs_find($pdo, $id);
    $payload = api_blogs_payload($pdo, $input, $existing);
    Validation::uniqueSlug($pdo, 'blogs', $payload['slug'], $id);

    $legacySlugs = $payload['legacy_slugs'];
    if ($existing['slug'] !== $payload['slug']) {
        $legacySlugs[] = $existing['slug'];
    }
    $legacySlugs = array_values(array_unique(array_filter($legacySlugs)));
    api_blogs_assert_legacy_slugs_available($pdo, $legacySlugs, $id);

    $pdo->beginTransaction();
    try {
        $statement = $pdo->prepare(
            'UPDATE blogs SET
                title = :title,
                slug = :slug,
                service_slug = :service_slug,
                author = :author,
                published_at = :published_at,
                read_time = :read_time,
                excerpt = :excerpt,
                custom_image_url = :custom_image_url,
                display_order = :display_order
             WHERE id = :id',
        );
        $statement->execute([
            'id' => $id,
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'service_slug' => $payload['service_slug'],
            'author' => $payload['author'],
            'published_at' => $payload['published_at'],
            'read_time' => $payload['read_time'],
            'excerpt' => $payload['excerpt'],
            'custom_image_url' => $payload['custom_image_url'],
            'display_order' => $payload['display_order'],
        ]);
        api_blogs_replace_children($pdo, $id, $payload['content'], $legacySlugs);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The blog could not be updated because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_blogs_find($pdo, $id);
}

function api_blogs_delete(PDO $pdo, string $id): void
{
    api_blogs_find($pdo, $id);
    $statement = $pdo->prepare('DELETE FROM blogs WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_blog_with_children(PDO $pdo, array $row): array
{
    $blocks = $pdo->prepare(
        'SELECT block_type, display_order, content_text, items_json
         FROM blog_content_blocks WHERE blog_id = :blog_id ORDER BY display_order ASC, id ASC',
    );
    $blocks->execute(['blog_id' => $row['id']]);
    $content = [];
    foreach ($blocks->fetchAll() as $block) {
        $item = [
            'type' => $block['block_type'],
            'display_order' => (int) $block['display_order'],
        ];
        if ($block['content_text'] !== null) {
            $item['text'] = $block['content_text'];
        }
        if ($block['items_json'] !== null) {
            $decoded = json_decode((string) $block['items_json'], true);
            $item['items'] = is_array($decoded) ? $decoded : [];
        }
        $content[] = $item;
    }

    $legacyStatement = $pdo->prepare(
        'SELECT legacy_slug FROM blog_legacy_slugs WHERE blog_id = :blog_id ORDER BY id ASC',
    );
    $legacyStatement->execute(['blog_id' => $row['id']]);

    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'service_slug' => $row['service_slug'],
        'author' => $row['author'],
        'published_at' => $row['published_at'],
        'read_time' => $row['read_time'],
        'excerpt' => $row['excerpt'],
        'custom_image_url' => $row['custom_image_url'],
        'display_order' => (int) $row['display_order'],
        'content' => $content,
        'legacy_slugs' => array_column($legacyStatement->fetchAll(), 'legacy_slug'),
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function api_blogs_payload(PDO $pdo, array $input, ?array $existing = null): array
{
    $aliases = [
        'serviceSlug' => 'service_slug',
        'publishedAt' => 'published_at',
        'readTime' => 'read_time',
        'displayOrder' => 'display_order',
        'legacySlugs' => 'legacy_slugs',
    ];
    foreach ($aliases as $alias => $canonical) {
        if (!array_key_exists($canonical, $input) && array_key_exists($alias, $input)) {
            $input[$canonical] = $input[$alias];
        }
    }
    if (!array_key_exists('custom_image_url', $input)) {
        if (array_key_exists('customImageUrl', $input)) {
            $input['custom_image_url'] = $input['customImageUrl'];
        } elseif (array_key_exists('image', $input)) {
            $input['custom_image_url'] = $input['image'];
        }
    }

    $source = array_merge($existing ?? [], $input);
    $title = Validation::string($source, 'title', true, 500);
    $rawSlug = Validation::string($source, 'slug', true, 191);
    $slug = Validation::slug($rawSlug ?? '', 'slug');
    $serviceSlug = Validation::string($source, 'service_slug', true, 191);
    api_blogs_assert_service_exists($pdo, $serviceSlug ?? '');

    $customImage = array_key_exists('custom_image_url', $source)
        ? Validation::url($source, 'custom_image_url')
        : Validation::url(['custom_image_url' => $source['image'] ?? null], 'custom_image_url');
    $content = $source['content'] ?? ($source['content_blocks'] ?? []);

    return [
        'title' => $title,
        'slug' => $slug,
        'service_slug' => $serviceSlug,
        'author' => Validation::string($source, 'author', true, 255),
        'published_at' => Validation::date($source, 'published_at', true),
        'read_time' => Validation::string($source, 'read_time', false, 100) ?? '5 min read',
        'excerpt' => Validation::string($source, 'excerpt', true, 100000),
        'custom_image_url' => $customImage,
        'display_order' => Validation::integer($source, 'display_order'),
        'content' => api_blog_content_blocks($content),
        'legacy_slugs' => api_blog_legacy_slugs($source['legacy_slugs'] ?? []),
    ];
}

function api_blogs_assert_service_exists(PDO $pdo, string $serviceSlug): void
{
    $statement = $pdo->prepare('SELECT id FROM services WHERE slug = :slug LIMIT 1');
    $statement->execute(['slug' => $serviceSlug]);
    if ($statement->fetchColumn() === false) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'service_slug must reference an existing service.');
    }
}

function api_blog_content_blocks(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'content must be an array of content blocks.');
    }

    $allowedTypes = ['paragraph', 'heading', 'quote', 'list'];
    $result = [];
    foreach ($value as $index => $block) {
        if (!is_array($block)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content[%d] must be an object.', $index));
        }
        $type = Validation::string($block, 'type', true, 32);
        if (!in_array($type, $allowedTypes, true)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content[%d].type is invalid.', $index));
        }

        if ($type === 'list') {
            $items = Validation::arrayValue($block, 'items');
            $cleanItems = [];
            foreach ($items as $itemIndex => $item) {
                if (!is_string($item) || trim($item) === '') {
                    throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content[%d].items[%d] must be a non-empty string.', $index, $itemIndex));
                }
                $cleanItems[] = trim($item);
            }
            if ($cleanItems === []) {
                throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content[%d].items cannot be empty.', $index));
            }
            $result[] = [
                'type' => $type,
                'items' => $cleanItems,
                'display_order' => Validation::integer($block, 'display_order', $index),
            ];
            continue;
        }

        $text = Validation::string($block, 'text', true, 100000);
        $result[] = [
            'type' => $type,
            'text' => $text,
            'display_order' => Validation::integer($block, 'display_order', $index),
        ];
    }

    if ($result === []) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'At least one content block is required.');
    }

    return $result;
}

function api_blog_legacy_slugs(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'legacy_slugs must be an array.');
    }

    $result = [];
    foreach ($value as $index => $legacySlug) {
        if (!is_string($legacySlug)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('legacy_slugs[%d] must be a string.', $index));
        }
        $normalized = Validation::slug($legacySlug, sprintf('legacy_slugs[%d]', $index));
        if (!in_array($normalized, $result, true)) {
            $result[] = $normalized;
        }
    }
    return $result;
}

function api_blogs_assert_legacy_slugs_available(PDO $pdo, array $legacySlugs, ?string $ignoreId = null): void
{
    foreach ($legacySlugs as $legacySlug) {
        $sql = 'SELECT b.id FROM blogs b LEFT JOIN blog_legacy_slugs legacy ON legacy.blog_id = b.id
                WHERE (b.slug = :current_slug OR legacy.legacy_slug = :legacy_slug)';
        if ($ignoreId !== null) $sql .= ' AND b.id <> :ignore_id';
        $sql .= ' LIMIT 1';
        $statement = $pdo->prepare($sql);
        $params = ['current_slug' => $legacySlug, 'legacy_slug' => $legacySlug];
        if ($ignoreId !== null) $params['ignore_id'] = $ignoreId;
        $statement->execute($params);
        if ($statement->fetchColumn() !== false) {
            throw new ApiException(409, 'DUPLICATE_SLUG', sprintf('Legacy slug "%s" is already in use.', $legacySlug));
        }
    }
}

function api_blogs_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare(
        'INSERT INTO blogs
            (id, title, slug, service_slug, author, published_at, read_time, excerpt, custom_image_url, display_order)
         VALUES
            (:id, :title, :slug, :service_slug, :author, :published_at, :read_time, :excerpt, :custom_image_url, :display_order)',
    );
    $statement->execute([
        'id' => $id,
        'title' => $payload['title'],
        'slug' => $payload['slug'],
        'service_slug' => $payload['service_slug'],
        'author' => $payload['author'],
        'published_at' => $payload['published_at'],
        'read_time' => $payload['read_time'],
        'excerpt' => $payload['excerpt'],
        'custom_image_url' => $payload['custom_image_url'],
        'display_order' => $payload['display_order'],
    ]);
}

function api_blogs_replace_children(PDO $pdo, string $id, array $content, array $legacySlugs): void
{
    $deleteBlocks = $pdo->prepare('DELETE FROM blog_content_blocks WHERE blog_id = :blog_id');
    $deleteBlocks->execute(['blog_id' => $id]);
    $deleteLegacy = $pdo->prepare('DELETE FROM blog_legacy_slugs WHERE blog_id = :blog_id');
    $deleteLegacy->execute(['blog_id' => $id]);

    $blockStatement = $pdo->prepare(
        'INSERT INTO blog_content_blocks (blog_id, block_type, display_order, content_text, items_json)
         VALUES (:blog_id, :block_type, :display_order, :content_text, :items_json)',
    );
    foreach ($content as $block) {
        $blockStatement->execute([
            'blog_id' => $id,
            'block_type' => $block['type'],
            'display_order' => $block['display_order'],
            'content_text' => $block['text'] ?? null,
            'items_json' => isset($block['items']) ? json_encode($block['items'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
        ]);
    }

    $legacyStatement = $pdo->prepare(
        'INSERT INTO blog_legacy_slugs (blog_id, legacy_slug) VALUES (:blog_id, :legacy_slug)',
    );
    foreach ($legacySlugs as $legacySlug) {
        $legacyStatement->execute(['blog_id' => $id, 'legacy_slug' => $legacySlug]);
    }
}
