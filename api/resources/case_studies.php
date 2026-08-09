<?php
declare(strict_types=1);

function api_case_studies_list(PDO $pdo): array
{
    $statement = $pdo->query('SELECT * FROM case_studies ORDER BY display_order ASC, created_at ASC');
    return array_map(
        static fn (array $row): array => api_case_study_with_children($pdo, $row),
        $statement->fetchAll(),
    );
}

function api_case_studies_find(PDO $pdo, string $id): array
{
    $statement = $pdo->prepare('SELECT * FROM case_studies WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Case Study not found.');
    }

    return api_case_study_with_children($pdo, $row);
}

function api_case_studies_find_by_slug(PDO $pdo, string $slug): array
{
    $statement = $pdo->prepare(
        'SELECT c.* FROM case_studies c
         LEFT JOIN case_study_legacy_slugs legacy ON legacy.case_study_id = c.id
         WHERE c.slug = :current_slug OR legacy.legacy_slug = :legacy_slug
         LIMIT 1',
    );
    $statement->execute([
        'current_slug' => $slug,
        'legacy_slug' => $slug,
    ]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Case Study not found.');
    }

    return api_case_study_with_children($pdo, $row);
}

function api_case_studies_create(PDO $pdo, array $input): array
{
    $payload = api_case_study_payload($input);
    Validation::uniqueSlug($pdo, 'case_studies', $payload['slug']);
    api_case_studies_assert_legacy_slugs_available($pdo, $payload['legacy_slugs']);

    $id = Validation::id($input, 'id', false) ?? raahx_new_id('case-study');
    $pdo->beginTransaction();
    try {
        api_case_studies_insert($pdo, $id, $payload);
        api_case_studies_replace_children($pdo, $id, $payload['approach'], $payload['metrics'], $payload['legacy_slugs']);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The Case Study could not be created because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_case_studies_find($pdo, $id);
}

function api_case_studies_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_case_studies_find($pdo, $id);
    $payload = api_case_study_payload($input, $existing);
    Validation::uniqueSlug($pdo, 'case_studies', $payload['slug'], $id);

    $legacySlugs = $payload['legacy_slugs'];
    if ($existing['slug'] !== $payload['slug']) {
        $legacySlugs[] = $existing['slug'];
    }
    $legacySlugs = array_values(array_unique(array_filter($legacySlugs)));
    api_case_studies_assert_legacy_slugs_available($pdo, $legacySlugs, $id);

    $pdo->beginTransaction();
    try {
        $statement = $pdo->prepare(
            'UPDATE case_studies SET
                client_name = :client_name,
                slug = :slug,
                industry = :industry,
                overview = :overview,
                challenge = :challenge,
                solution = :solution,
                testimonial_quote = :testimonial_quote,
                testimonial_author = :testimonial_author,
                display_order = :display_order
             WHERE id = :id',
        );
        $statement->execute([
            'id' => $id,
            'client_name' => $payload['client_name'],
            'slug' => $payload['slug'],
            'industry' => $payload['industry'],
            'overview' => $payload['overview'],
            'challenge' => $payload['challenge'],
            'solution' => $payload['solution'],
            'testimonial_quote' => $payload['testimonial_quote'],
            'testimonial_author' => $payload['testimonial_author'],
            'display_order' => $payload['display_order'],
        ]);
        api_case_studies_replace_children($pdo, $id, $payload['approach'], $payload['metrics'], $legacySlugs);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The Case Study could not be updated because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_case_studies_find($pdo, $id);
}

function api_case_studies_delete(PDO $pdo, string $id): void
{
    api_case_studies_find($pdo, $id);
    $statement = $pdo->prepare('DELETE FROM case_studies WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_case_study_with_children(PDO $pdo, array $row): array
{
    $approach = $pdo->prepare(
        'SELECT title, description, display_order FROM case_study_approach_steps
         WHERE case_study_id = :case_study_id ORDER BY display_order ASC, id ASC',
    );
    $approach->execute(['case_study_id' => $row['id']]);
    $metrics = $pdo->prepare(
        'SELECT value, label, display_order FROM case_study_metrics
         WHERE case_study_id = :case_study_id ORDER BY display_order ASC, id ASC',
    );
    $metrics->execute(['case_study_id' => $row['id']]);
    $legacy = $pdo->prepare(
        'SELECT legacy_slug FROM case_study_legacy_slugs
         WHERE case_study_id = :case_study_id ORDER BY id ASC',
    );
    $legacy->execute(['case_study_id' => $row['id']]);

    return [
        'id' => $row['id'],
        'client_name' => $row['client_name'],
        'client' => $row['client_name'],
        'slug' => $row['slug'],
        'industry' => $row['industry'],
        'overview' => $row['overview'],
        'challenge' => $row['challenge'],
        'solution' => $row['solution'],
        'approach' => $approach->fetchAll(),
        'metrics' => $metrics->fetchAll(),
        'testimonial' => [
            'quote' => $row['testimonial_quote'],
            'author' => $row['testimonial_author'],
        ],
        'legacy_slugs' => array_column($legacy->fetchAll(), 'legacy_slug'),
        'display_order' => (int) $row['display_order'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function api_case_study_payload(array $input, ?array $existing = null): array
{
    if (!array_key_exists('client_name', $input) && array_key_exists('client', $input)) {
        $input['client_name'] = $input['client'];
    }
    if (!array_key_exists('legacy_slugs', $input) && array_key_exists('legacySlugs', $input)) {
        $input['legacy_slugs'] = $input['legacySlugs'];
    }

    $source = array_merge($existing ?? [], $input);
    $client = $source['client_name'] ?? ($source['client'] ?? null);
    $slug = Validation::slug(Validation::string($source, 'slug', true, 191) ?? '', 'slug');

    $approach = api_case_approach($source['approach'] ?? []);
    $metrics = api_case_metrics($source['metrics'] ?? []);
    $testimonial = is_array($source['testimonial'] ?? null) ? $source['testimonial'] : [];

    return [
        'client_name' => Validation::string(['client_name' => $client], 'client_name', true, 255),
        'slug' => $slug,
        'industry' => Validation::string($source, 'industry', true, 255),
        'overview' => Validation::string($source, 'overview', true, 100000),
        'challenge' => Validation::string($source, 'challenge', true, 100000),
        'solution' => Validation::string($source, 'solution', true, 100000),
        'testimonial_quote' => Validation::nullableString(['value' => $testimonial['quote'] ?? null], 'value', 10000),
        'testimonial_author' => Validation::nullableString(['value' => $testimonial['author'] ?? null], 'value', 255),
        'display_order' => Validation::integer($source, 'display_order'),
        'approach' => $approach,
        'metrics' => $metrics,
        'legacy_slugs' => api_case_legacy_slugs($source['legacy_slugs'] ?? []),
    ];
}

function api_case_approach(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'approach must be an array.');
    }

    $result = [];
    foreach ($value as $index => $step) {
        if (!is_array($step)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('approach[%d] must be an object.', $index));
        }
        $result[] = [
            'title' => Validation::string($step, 'title', true, 255),
            'description' => Validation::string($step, 'description', true, 10000),
            'display_order' => Validation::integer($step, 'display_order', $index),
        ];
    }

    return $result;
}

function api_case_metrics(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'metrics must be an array.');
    }

    $result = [];
    foreach ($value as $index => $metric) {
        if (!is_array($metric)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('metrics[%d] must be an object.', $index));
        }
        $result[] = [
            'value' => Validation::string($metric, 'value', true, 255),
            'label' => Validation::string($metric, 'label', true, 255),
            'display_order' => Validation::integer($metric, 'display_order', $index),
        ];
    }

    return $result;
}

function api_case_legacy_slugs(mixed $value): array
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
        if (!in_array($normalized, $result, true)) $result[] = $normalized;
    }
    return $result;
}

function api_case_studies_assert_legacy_slugs_available(PDO $pdo, array $legacySlugs, ?string $ignoreId = null): void
{
    foreach ($legacySlugs as $legacySlug) {
        $sql = 'SELECT c.id FROM case_studies c
                LEFT JOIN case_study_legacy_slugs legacy ON legacy.case_study_id = c.id
                WHERE (c.slug = :current_slug OR legacy.legacy_slug = :legacy_slug)';
        if ($ignoreId !== null) $sql .= ' AND c.id <> :ignore_id';
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

function api_case_studies_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare(
        'INSERT INTO case_studies
            (id, client_name, slug, industry, overview, challenge, solution,
             testimonial_quote, testimonial_author, display_order)
         VALUES
            (:id, :client_name, :slug, :industry, :overview, :challenge, :solution,
             :testimonial_quote, :testimonial_author, :display_order)',
    );
    $statement->execute([
        'id' => $id,
        'client_name' => $payload['client_name'],
        'slug' => $payload['slug'],
        'industry' => $payload['industry'],
        'overview' => $payload['overview'],
        'challenge' => $payload['challenge'],
        'solution' => $payload['solution'],
        'testimonial_quote' => $payload['testimonial_quote'],
        'testimonial_author' => $payload['testimonial_author'],
        'display_order' => $payload['display_order'],
    ]);
}

function api_case_studies_replace_children(PDO $pdo, string $id, array $approach, array $metrics, array $legacySlugs): void
{
    foreach (['case_study_approach_steps', 'case_study_metrics', 'case_study_legacy_slugs'] as $table) {
        $delete = $pdo->prepare(sprintf('DELETE FROM %s WHERE case_study_id = :id', $table));
        $delete->execute(['id' => $id]);
    }

    $approachStatement = $pdo->prepare(
        'INSERT INTO case_study_approach_steps (case_study_id, title, description, display_order)
         VALUES (:case_study_id, :title, :description, :display_order)',
    );
    foreach ($approach as $step) {
        $approachStatement->execute([
            'case_study_id' => $id,
            'title' => $step['title'],
            'description' => $step['description'],
            'display_order' => $step['display_order'],
        ]);
    }

    $metricStatement = $pdo->prepare(
        'INSERT INTO case_study_metrics (case_study_id, value, label, display_order)
         VALUES (:case_study_id, :value, :label, :display_order)',
    );
    foreach ($metrics as $metric) {
        $metricStatement->execute([
            'case_study_id' => $id,
            'value' => $metric['value'],
            'label' => $metric['label'],
            'display_order' => $metric['display_order'],
        ]);
    }

    $legacyStatement = $pdo->prepare(
        'INSERT INTO case_study_legacy_slugs (case_study_id, legacy_slug)
         VALUES (:case_study_id, :legacy_slug)',
    );
    foreach ($legacySlugs as $legacySlug) {
        $legacyStatement->execute(['case_study_id' => $id, 'legacy_slug' => $legacySlug]);
    }
}
