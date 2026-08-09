<?php
declare(strict_types=1);

function api_services_list(PDO $pdo): array
{
    $statement = $pdo->query('SELECT * FROM services ORDER BY display_order ASC, created_at ASC');
    return array_map(
        static fn (array $row): array => api_service_with_children($pdo, $row),
        $statement->fetchAll(),
    );
}

function api_services_find(PDO $pdo, string $id): array
{
    $statement = $pdo->prepare('SELECT * FROM services WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Service not found.');
    }

    return api_service_with_children($pdo, $row);
}

function api_services_create(PDO $pdo, array $input): array
{
    $payload = api_services_payload($pdo, $input);
    Validation::uniqueSlug($pdo, 'services', $payload['slug']);

    $id = Validation::id($input, 'id', false) ?? raahx_new_id('service');
    $pdo->beginTransaction();
    try {
        api_services_insert($pdo, $id, $payload);
        api_services_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The service could not be created because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_services_find($pdo, $id);
}

function api_services_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_services_find($pdo, $id);
    $payload = api_services_payload($pdo, $input, $existing);
    Validation::uniqueSlug($pdo, 'services', $payload['slug'], $id);

    $pdo->beginTransaction();
    try {
        $statement = $pdo->prepare(
            'UPDATE services SET
                name = :name,
                slug = :slug,
                icon_identifier = :icon_identifier,
                hero_title = :hero_title,
                hero_subtitle = :hero_subtitle,
                overview = :overview,
                why_choose_title = :why_choose_title,
                why_choose_text = :why_choose_text,
                testimonial_quote = :testimonial_quote,
                testimonial_author = :testimonial_author,
                display_order = :display_order
             WHERE id = :id',
        );
        $statement->execute([
            'id' => $id,
            'name' => $payload['name'],
            'slug' => $payload['slug'],
            'icon_identifier' => $payload['icon_identifier'],
            'hero_title' => $payload['hero_title'],
            'hero_subtitle' => $payload['hero_subtitle'],
            'overview' => $payload['overview'],
            'why_choose_title' => $payload['why_choose_title'],
            'why_choose_text' => $payload['why_choose_text'],
            'testimonial_quote' => $payload['testimonial_quote'],
            'testimonial_author' => $payload['testimonial_author'],
            'display_order' => $payload['display_order'],
        ]);
        api_services_replace_children($pdo, $id, $payload);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        if ($exception instanceof PDOException && $exception->getCode() === '23000') {
            throw new ApiException(409, 'CONFLICT', 'The service could not be updated because a unique value already exists.', $exception);
        }
        throw $exception;
    }

    return api_services_find($pdo, $id);
}

function api_services_delete(PDO $pdo, string $id): void
{
    api_services_find($pdo, $id);
    $statement = $pdo->prepare('DELETE FROM services WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_service_with_children(PDO $pdo, array $row): array
{
    $stats = $pdo->prepare('SELECT label, value, display_order FROM service_stats WHERE service_id = :id ORDER BY display_order ASC, id ASC');
    $stats->execute(['id' => $row['id']]);
    $process = $pdo->prepare('SELECT title, description, display_order FROM service_process_steps WHERE service_id = :id ORDER BY display_order ASC, id ASC');
    $process->execute(['id' => $row['id']]);
    $benefits = $pdo->prepare('SELECT title, description, display_order FROM service_benefits WHERE service_id = :id ORDER BY display_order ASC, id ASC');
    $benefits->execute(['id' => $row['id']]);

    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'icon_identifier' => $row['icon_identifier'],
        'hero_title' => $row['hero_title'],
        'hero_subtitle' => $row['hero_subtitle'],
        'overview' => $row['overview'],
        'why_choose_title' => $row['why_choose_title'],
        'why_choose_text' => $row['why_choose_text'],
        'stats' => $stats->fetchAll(),
        'process' => $process->fetchAll(),
        'benefits' => $benefits->fetchAll(),
        'testimonial' => [
            'quote' => $row['testimonial_quote'],
            'author' => $row['testimonial_author'],
        ],
        'display_order' => (int) $row['display_order'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ];
}

function api_services_payload(PDO $pdo, array $input, ?array $existing = null): array
{
    $aliases = [
        'heroTitle' => 'hero_title',
        'heroSubtitle' => 'hero_subtitle',
        'whyChooseTitle' => 'why_choose_title',
        'whyChooseText' => 'why_choose_text',
        'displayOrder' => 'display_order',
    ];
    foreach ($aliases as $alias => $canonical) {
        if (!array_key_exists($canonical, $input) && array_key_exists($alias, $input)) {
            $input[$canonical] = $input[$alias];
        }
    }
    if (!array_key_exists('icon_identifier', $input) && array_key_exists('icon', $input)) {
        $input['icon_identifier'] = $input['icon'];
    }
    if (!array_key_exists('testimonial', $input) && (array_key_exists('testimonial_quote', $input) || array_key_exists('testimonial_author', $input))) {
        $input['testimonial'] = [
            'quote' => $input['testimonial_quote'] ?? null,
            'author' => $input['testimonial_author'] ?? null,
        ];
    }

    $source = array_merge($existing ?? [], $input);
    $name = Validation::string($source, 'name', true, 255);
    $rawSlug = Validation::string($source, 'slug', true, 191);
    $slug = Validation::slug($rawSlug ?? '', 'slug');
    $icon = $source['icon_identifier'] ?? ($source['icon'] ?? null);
    $iconIdentifier = Validation::string(['icon_identifier' => $icon], 'icon_identifier', true, 100);

    $testimonial = is_array($source['testimonial'] ?? null) ? $source['testimonial'] : [];
    $testimonialQuote = Validation::nullableString(
        ['value' => $testimonial['quote'] ?? null],
        'value',
        10000,
    );
    $testimonialAuthor = Validation::nullableString(
        ['value' => $testimonial['author'] ?? null],
        'value',
        255,
    );

    return [
        'name' => $name,
        'slug' => $slug,
        'icon_identifier' => $iconIdentifier,
        'hero_title' => Validation::string($source, 'hero_title', false, 500) ?? '',
        'hero_subtitle' => Validation::string($source, 'hero_subtitle', false, 1000) ?? '',
        'overview' => Validation::string($source, 'overview', false, 100000) ?? '',
        'why_choose_title' => Validation::string($source, 'why_choose_title', false, 500) ?? '',
        'why_choose_text' => Validation::string($source, 'why_choose_text', false, 100000) ?? '',
        'testimonial_quote' => $testimonialQuote,
        'testimonial_author' => $testimonialAuthor,
        'display_order' => Validation::integer($source, 'display_order'),
        'stats' => api_service_stats($source['stats'] ?? []),
        'process' => api_service_steps($source['process'] ?? []),
        'benefits' => api_service_steps($source['benefits'] ?? []),
    ];
}

function api_service_stats(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'stats must be an array.');
    }

    $result = [];
    foreach ($value as $index => $stat) {
        if (!is_array($stat)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('stats[%d] must be an object.', $index));
        }
        $result[] = [
            'label' => Validation::string($stat, 'label', true, 255),
            'value' => Validation::string($stat, 'value', true, 255),
            'display_order' => Validation::integer($stat, 'display_order', $index),
        ];
    }
    return $result;
}

function api_service_steps(mixed $value): array
{
    if (!is_array($value)) {
        throw new ApiException(400, 'VALIDATION_ERROR', 'process and benefits must be arrays.');
    }

    $result = [];
    foreach ($value as $index => $step) {
        if (!is_array($step)) {
            throw new ApiException(400, 'VALIDATION_ERROR', sprintf('steps[%d] must be an object.', $index));
        }
        $result[] = [
            'title' => Validation::string($step, 'title', true, 255),
            'description' => Validation::string($step, 'description', true, 10000),
            'display_order' => Validation::integer($step, 'display_order', $index),
        ];
    }
    return $result;
}

function api_services_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare(
        'INSERT INTO services
            (id, name, slug, icon_identifier, hero_title, hero_subtitle, overview,
             why_choose_title, why_choose_text, testimonial_quote, testimonial_author, display_order)
         VALUES
            (:id, :name, :slug, :icon_identifier, :hero_title, :hero_subtitle, :overview,
             :why_choose_title, :why_choose_text, :testimonial_quote, :testimonial_author, :display_order)',
    );
    $statement->execute([
        'id' => $id,
        'name' => $payload['name'],
        'slug' => $payload['slug'],
        'icon_identifier' => $payload['icon_identifier'],
        'hero_title' => $payload['hero_title'],
        'hero_subtitle' => $payload['hero_subtitle'],
        'overview' => $payload['overview'],
        'why_choose_title' => $payload['why_choose_title'],
        'why_choose_text' => $payload['why_choose_text'],
        'testimonial_quote' => $payload['testimonial_quote'],
        'testimonial_author' => $payload['testimonial_author'],
        'display_order' => $payload['display_order'],
    ]);
}

function api_services_replace_children(PDO $pdo, string $id, array $payload): void
{
    foreach (['service_stats', 'service_process_steps', 'service_benefits'] as $table) {
        $delete = $pdo->prepare(sprintf('DELETE FROM %s WHERE service_id = :service_id', $table));
        $delete->execute(['service_id' => $id]);
    }

    $stats = $pdo->prepare('INSERT INTO service_stats (service_id, label, value, display_order) VALUES (:service_id, :label, :value, :display_order)');
    foreach ($payload['stats'] as $stat) {
        $stats->execute([
            'service_id' => $id,
            'label' => $stat['label'],
            'value' => $stat['value'],
            'display_order' => $stat['display_order'],
        ]);
    }

    $process = $pdo->prepare('INSERT INTO service_process_steps (service_id, title, description, display_order) VALUES (:service_id, :title, :description, :display_order)');
    foreach ($payload['process'] as $step) {
        $process->execute([
            'service_id' => $id,
            'title' => $step['title'],
            'description' => $step['description'],
            'display_order' => $step['display_order'],
        ]);
    }

    $benefits = $pdo->prepare('INSERT INTO service_benefits (service_id, title, description, display_order) VALUES (:service_id, :title, :description, :display_order)');
    foreach ($payload['benefits'] as $benefit) {
        $benefits->execute([
            'service_id' => $id,
            'title' => $benefit['title'],
            'description' => $benefit['description'],
            'display_order' => $benefit['display_order'],
        ]);
    }
}
