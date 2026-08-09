<?php
declare(strict_types=1);

function api_migration_validate(PDO $pdo, array $payload): array
{
    $version = $payload['migration_version'] ?? null;
    if ($version !== 1 && $version !== '1') {
        throw new ApiException(400, 'INVALID_MIGRATION_VERSION', 'migration_version must be 1.');
    }
    if (!isset($payload['exported_at']) || !is_string($payload['exported_at']) || trim($payload['exported_at']) === '') {
        throw new ApiException(400, 'VALIDATION_ERROR', 'exported_at is required.');
    }

    api_migration_reject_sensitive_keys($payload);
    $prepared = api_migration_prepare_payload($pdo, $payload);

    $serviceSlugs = api_migration_check_records($prepared['services'], 'services', true);
    api_migration_check_records($prepared['team'], 'team_members', false);
    api_migration_check_records($prepared['blogs'], 'blogs', true);
    api_migration_check_records($prepared['case_studies'], 'case_studies', true);

    foreach ($prepared['blogs'] as $index => $blog) {
        if (!isset($serviceSlugs[$blog['service_slug']])) {
            throw new ApiException(409, 'INVALID_RELATIONSHIP', sprintf(
                'blogs[%d].service_slug "%s" does not exist in the migration services dataset.',
                $index,
                $blog['service_slug'],
            ));
        }
    }

    api_migration_check_database_conflicts($pdo, $prepared['services'], 'services');
    api_migration_check_database_conflicts($pdo, $prepared['blogs'], 'blogs');
    api_migration_check_database_conflicts($pdo, $prepared['case_studies'], 'case_studies');

    return [
        'prepared' => $prepared,
        'counts' => api_migration_counts($prepared),
    ];
}

function api_migration_import(PDO $pdo, array $payload, bool $dryRun = false): array
{
    $validated = api_migration_validate($pdo, $payload);
    if ($dryRun) {
        return [
            'dry_run' => true,
            'imported' => false,
            'counts' => $validated['counts'],
        ];
    }

    $data = $validated['prepared'];
    $created = [
        'services' => 0,
        'team_members' => 0,
        'blogs' => 0,
        'case_studies' => 0,
    ];
    $updated = [
        'services' => 0,
        'team_members' => 0,
        'blogs' => 0,
        'case_studies' => 0,
    ];

    $pdo->beginTransaction();
    try {
        foreach ($data['services'] as $service) {
            if (api_migration_upsert_service($pdo, $service)) $created['services']++;
            else $updated['services']++;
        }
        foreach ($data['team'] as $member) {
            if (api_migration_upsert_team_member($pdo, $member)) $created['team_members']++;
            else $updated['team_members']++;
        }
        foreach ($data['blogs'] as $blog) {
            if (api_migration_upsert_blog($pdo, $blog)) $created['blogs']++;
            else $updated['blogs']++;
        }
        foreach ($data['case_studies'] as $study) {
            if (api_migration_upsert_case_study($pdo, $study)) $created['case_studies']++;
            else $updated['case_studies']++;
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw new ApiException(500, 'MIGRATION_ROLLED_BACK', 'Migration failed and all changes were rolled back.', $exception);
    }

    return [
        'dry_run' => false,
        'imported' => true,
        'counts' => $validated['counts'],
        'created' => $created,
        'updated' => $updated,
    ];
}

function api_migration_prepare_payload(PDO $pdo, array $payload): array
{
    $services = Validation::arrayValue($payload, 'services');
    $team = Validation::arrayValue($payload, 'team');
    $blogs = Validation::arrayValue($payload, 'blogs');
    $caseStudies = Validation::arrayValue($payload, 'case_studies');

    $preparedServices = [];
    foreach ($services as $index => $service) {
        if (!is_array($service)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('services[%d] must be an object.', $index));
        }
        $id = Validation::id($service);
        $normalized = api_services_payload($pdo, $service);
        $normalized['id'] = $id;
        $preparedServices[] = $normalized;
    }

    $preparedTeam = [];
    foreach ($team as $index => $member) {
        if (!is_array($member)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('team[%d] must be an object.', $index));
        }
        $id = Validation::id($member);
        $normalized = api_team_payload($member);
        $normalized['id'] = $id;
        $preparedTeam[] = $normalized;
    }

    $preparedBlogs = [];
    foreach ($blogs as $index => $blog) {
        if (!is_array($blog)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('blogs[%d] must be an object.', $index));
        }
        $preparedBlogs[] = api_migration_blog_payload($blog, $index);
    }

    $preparedCaseStudies = [];
    foreach ($caseStudies as $index => $study) {
        if (!is_array($study)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('case_studies[%d] must be an object.', $index));
        }
        $id = Validation::id($study);
        $input = $study;
        if (!array_key_exists('client_name', $input) && array_key_exists('client', $input)) {
            $input['client_name'] = $input['client'];
        }
        $normalized = api_case_study_payload($input);
        $normalized['id'] = $id;
        $preparedCaseStudies[] = $normalized;
    }

    return [
        'services' => $preparedServices,
        'team' => $preparedTeam,
        'blogs' => $preparedBlogs,
        'case_studies' => $preparedCaseStudies,
    ];
}

function api_migration_blog_payload(array $blog, int $index): array
{
    $id = Validation::id($blog);
    $serviceSlug = $blog['service_slug'] ?? ($blog['serviceSlug'] ?? null);
    $publishedValue = $blog['published_at'] ?? ($blog['date'] ?? null);
    $imageValue = $blog['custom_image_url'] ?? ($blog['customImageUrl'] ?? ($blog['image'] ?? null));

    $publishedAt = api_migration_date($publishedValue, sprintf('blogs[%d].published_at', $index));
    if ($publishedAt === null) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('blogs[%d].published_at is required.', $index));
    }

    $input = [
        'title' => $blog['title'] ?? null,
        'slug' => $blog['slug'] ?? null,
        'service_slug' => $serviceSlug,
        'author' => $blog['author'] ?? null,
        'published_at' => $publishedAt,
        'read_time' => $blog['read_time'] ?? ($blog['readTime'] ?? null),
        'excerpt' => $blog['excerpt'] ?? null,
        'custom_image_url' => $imageValue,
        'display_order' => $blog['display_order'] ?? ($blog['displayOrder'] ?? $index),
        'content' => $blog['content'] ?? ($blog['content_blocks'] ?? null),
        'legacy_slugs' => $blog['legacy_slugs'] ?? ($blog['legacySlugs'] ?? []),
    ];

    $title = Validation::string($input, 'title', true, 500);
    $slug = Validation::slug(Validation::string($input, 'slug', true, 191) ?? '', 'slug');
    $service = Validation::string($input, 'service_slug', true, 191);
    $author = Validation::string($input, 'author', true, 255);
    $excerpt = Validation::string($input, 'excerpt', true, 100000);
    $customImage = Validation::url($input, 'custom_image_url', true);
    $content = api_blog_content_blocks($input['content'] ?? []);
    $legacy = api_blog_legacy_slugs($input['legacy_slugs']);

    return [
        'id' => $id,
        'title' => $title,
        'slug' => $slug,
        'service_slug' => $service,
        'author' => $author,
        'published_at' => $input['published_at'],
        'read_time' => Validation::string($input, 'read_time', false, 100) ?? '5 min read',
        'excerpt' => $excerpt,
        'custom_image_url' => $customImage,
        'display_order' => Validation::integer($input, 'display_order', $index),
        'content' => $content,
        'legacy_slugs' => $legacy,
    ];
}

function api_migration_date(mixed $value, string $field): ?string
{
    if ($value === null || $value === '') return null;
    if (!is_string($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a date string.', $field));
    }

    try {
        $date = new DateTimeImmutable($value);
    } catch (Throwable $exception) {
        throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s is not a valid date.', $field), $exception);
    }

    return $date->format('Y-m-d');
}

function api_migration_check_records(array $records, string $label, bool $checkSlugs): array
{
    $ids = [];
    $slugs = [];
    foreach ($records as $index => $record) {
        $id = $record['id'] ?? null;
        if (!is_string($id) || $id === '') {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s[%d].id is required.', $label, $index));
        }
        if (isset($ids[$id])) {
            throw new ApiException(409, 'DUPLICATE_ID', sprintf('%s contains duplicate id "%s".', $label, $id));
        }
        $ids[$id] = true;

        if ($checkSlugs) {
            $slug = (string) ($record['slug'] ?? '');
            if (isset($slugs[$slug])) {
                throw new ApiException(409, 'DUPLICATE_SLUG', sprintf('%s contains duplicate slug "%s".', $label, $slug));
            }
            $slugs[$slug] = true;
            foreach ($record['legacy_slugs'] ?? [] as $legacySlug) {
                if (isset($slugs[$legacySlug])) {
                    throw new ApiException(409, 'DUPLICATE_SLUG', sprintf('Slug "%s" is duplicated in %s.', $legacySlug, $label));
                }
                $slugs[$legacySlug] = true;
            }
        }
    }

    return $slugs;
}

function api_migration_check_database_conflicts(PDO $pdo, array $records, string $table): void
{
    foreach ($records as $record) {
        $idStatement = $pdo->prepare(sprintf('SELECT slug FROM %s WHERE id = :id LIMIT 1', $table));
        $idStatement->execute(['id' => $record['id']]);
        $existingSlug = $idStatement->fetchColumn();
        if ($existingSlug !== false && isset($record['slug']) && $existingSlug !== $record['slug']) {
            if (!in_array($existingSlug, $record['legacy_slugs'] ?? [], true)) {
                throw new ApiException(409, 'ID_SLUG_CONFLICT', sprintf(
                    '%s id "%s" already has a different slug.',
                    $table,
                    $record['id'],
                ));
            }
        }

        if (!isset($record['slug'])) continue;
        $slugStatement = $pdo->prepare(sprintf('SELECT id FROM %s WHERE slug = :slug LIMIT 1', $table));
        $slugStatement->execute(['slug' => $record['slug']]);
        $existingId = $slugStatement->fetchColumn();
        if ($existingId !== false && $existingId !== $record['id']) {
            throw new ApiException(409, 'DUPLICATE_SLUG', sprintf(
                '%s slug "%s" belongs to another record.',
                $table,
                $record['slug'],
            ));
        }
    }
}

function api_migration_counts(array $data): array
{
    return [
        'services' => count($data['services']),
        'service_stats' => array_sum(array_map(static fn (array $service): int => count($service['stats']), $data['services'])),
        'service_process_steps' => array_sum(array_map(static fn (array $service): int => count($service['process']), $data['services'])),
        'service_benefits' => array_sum(array_map(static fn (array $service): int => count($service['benefits']), $data['services'])),
        'team_members' => count($data['team']),
        'blogs' => count($data['blogs']),
        'blog_content_blocks' => array_sum(array_map(static fn (array $blog): int => count($blog['content']), $data['blogs'])),
        'blog_legacy_slugs' => array_sum(array_map(static fn (array $blog): int => count($blog['legacy_slugs']), $data['blogs'])),
        'case_studies' => count($data['case_studies']),
        'case_study_approach_steps' => array_sum(array_map(static fn (array $study): int => count($study['approach']), $data['case_studies'])),
        'case_study_metrics' => array_sum(array_map(static fn (array $study): int => count($study['metrics']), $data['case_studies'])),
        'case_study_legacy_slugs' => array_sum(array_map(static fn (array $study): int => count($study['legacy_slugs']), $data['case_studies'])),
    ];
}

function api_migration_reject_sensitive_keys(mixed $value, string $path = 'payload'): void
{
    if (is_array($value)) {
        foreach ($value as $key => $child) {
            $normalizedKey = strtolower((string) $key);
            if (preg_match('/password|secret|cookie|session_token|api_key|access_token/', $normalizedKey)) {
                throw new ApiException(400, 'SENSITIVE_DATA', sprintf('Sensitive field %s is not allowed in a migration payload.', $path . '.' . $key));
            }
            api_migration_reject_sensitive_keys($child, $path . '.' . $key);
        }
    }
}

function api_migration_upsert_service(PDO $pdo, array $service): bool
{
    $exists = api_migration_row_exists($pdo, 'services', $service['id']);
    $payload = $service;
    if (!$exists) {
        api_services_insert($pdo, $service['id'], $payload);
    } else {
        $statement = $pdo->prepare(
            'UPDATE services SET name = :name, slug = :slug, icon_identifier = :icon_identifier,
             hero_title = :hero_title, hero_subtitle = :hero_subtitle, overview = :overview,
             why_choose_title = :why_choose_title, why_choose_text = :why_choose_text,
             testimonial_quote = :testimonial_quote, testimonial_author = :testimonial_author,
             display_order = :display_order WHERE id = :id',
        );
        $statement->execute([
            'id' => $service['id'], 'name' => $service['name'], 'slug' => $service['slug'],
            'icon_identifier' => $service['icon_identifier'], 'hero_title' => $service['hero_title'],
            'hero_subtitle' => $service['hero_subtitle'], 'overview' => $service['overview'],
            'why_choose_title' => $service['why_choose_title'], 'why_choose_text' => $service['why_choose_text'],
            'testimonial_quote' => $service['testimonial_quote'], 'testimonial_author' => $service['testimonial_author'],
            'display_order' => $service['display_order'],
        ]);
    }
    api_services_replace_children($pdo, $service['id'], $payload);
    return !$exists;
}

function api_migration_upsert_team_member(PDO $pdo, array $member): bool
{
    $exists = api_migration_row_exists($pdo, 'team_members', $member['id']);
    if (!$exists) {
        $statement = $pdo->prepare(
            'INSERT INTO team_members (id, name, role, image_url, linkedin_url, display_order)
             VALUES (:id, :name, :role, :image_url, :linkedin_url, :display_order)',
        );
    } else {
        $statement = $pdo->prepare(
            'UPDATE team_members SET name = :name, role = :role, image_url = :image_url,
             linkedin_url = :linkedin_url, display_order = :display_order WHERE id = :id',
        );
    }
    $statement->execute([
        'id' => $member['id'], 'name' => $member['name'], 'role' => $member['role'],
        'image_url' => $member['image_url'], 'linkedin_url' => $member['linkedin_url'],
        'display_order' => $member['display_order'],
    ]);
    return !$exists;
}

function api_migration_upsert_blog(PDO $pdo, array $blog): bool
{
    $exists = api_migration_row_exists($pdo, 'blogs', $blog['id']);
    $existingLegacy = [];
    if ($exists) {
        $legacy = $pdo->prepare('SELECT legacy_slug FROM blog_legacy_slugs WHERE blog_id = :blog_id');
        $legacy->execute(['blog_id' => $blog['id']]);
        $existingLegacy = array_column($legacy->fetchAll(), 'legacy_slug');
    }
    $legacySlugs = array_values(array_unique(array_merge($existingLegacy, $blog['legacy_slugs'])));

    if (!$exists) {
        $statement = $pdo->prepare(
            'INSERT INTO blogs (id, title, slug, service_slug, author, published_at, read_time, excerpt, custom_image_url, display_order)
             VALUES (:id, :title, :slug, :service_slug, :author, :published_at, :read_time, :excerpt, :custom_image_url, :display_order)',
        );
    } else {
        $statement = $pdo->prepare(
            'UPDATE blogs SET title = :title, slug = :slug, service_slug = :service_slug,
             author = :author, published_at = :published_at, read_time = :read_time,
             excerpt = :excerpt, custom_image_url = :custom_image_url, display_order = :display_order
             WHERE id = :id',
        );
    }
    $statement->execute([
        'id' => $blog['id'], 'title' => $blog['title'], 'slug' => $blog['slug'],
        'service_slug' => $blog['service_slug'], 'author' => $blog['author'],
        'published_at' => $blog['published_at'], 'read_time' => $blog['read_time'],
        'excerpt' => $blog['excerpt'], 'custom_image_url' => $blog['custom_image_url'],
        'display_order' => $blog['display_order'],
    ]);
    api_blogs_replace_children($pdo, $blog['id'], $blog['content'], $legacySlugs);
    return !$exists;
}

function api_migration_upsert_case_study(PDO $pdo, array $study): bool
{
    $exists = api_migration_row_exists($pdo, 'case_studies', $study['id']);
    $existingLegacy = [];
    if ($exists) {
        $legacy = $pdo->prepare('SELECT legacy_slug FROM case_study_legacy_slugs WHERE case_study_id = :case_study_id');
        $legacy->execute(['case_study_id' => $study['id']]);
        $existingLegacy = array_column($legacy->fetchAll(), 'legacy_slug');
    }
    $legacySlugs = array_values(array_unique(array_merge($existingLegacy, $study['legacy_slugs'])));

    if (!$exists) {
        $statement = $pdo->prepare(
            'INSERT INTO case_studies (id, client_name, slug, industry, overview, challenge, solution,
             testimonial_quote, testimonial_author, display_order)
             VALUES (:id, :client_name, :slug, :industry, :overview, :challenge, :solution,
             :testimonial_quote, :testimonial_author, :display_order)',
        );
    } else {
        $statement = $pdo->prepare(
            'UPDATE case_studies SET client_name = :client_name, slug = :slug, industry = :industry,
             overview = :overview, challenge = :challenge, solution = :solution,
             testimonial_quote = :testimonial_quote, testimonial_author = :testimonial_author,
             display_order = :display_order WHERE id = :id',
        );
    }
    $statement->execute([
        'id' => $study['id'], 'client_name' => $study['client_name'], 'slug' => $study['slug'],
        'industry' => $study['industry'], 'overview' => $study['overview'],
        'challenge' => $study['challenge'], 'solution' => $study['solution'],
        'testimonial_quote' => $study['testimonial_quote'], 'testimonial_author' => $study['testimonial_author'],
        'display_order' => $study['display_order'],
    ]);
    api_case_studies_replace_children($pdo, $study['id'], $study['approach'], $study['metrics'], $legacySlugs);
    return !$exists;
}

function api_migration_row_exists(PDO $pdo, string $table, string $id): bool
{
    $statement = $pdo->prepare(sprintf('SELECT id FROM %s WHERE id = :id LIMIT 1', $table));
    $statement->execute(['id' => $id]);
    return $statement->fetchColumn() !== false;
}
