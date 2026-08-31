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
                card_description = :card_description,
                card_cta_label = :card_cta_label,
                hero_cta_label = :hero_cta_label,
                overview_title = :overview_title,
                overview = :overview,
                why_choose_title = :why_choose_title,
                why_choose_text = :why_choose_text,
                process_title = :process_title,
                benefits_title = :benefits_title,
                cta_title = :cta_title,
                cta_text = :cta_text,
                cta_supporting_text = :cta_supporting_text,
                cta_label = :cta_label,
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
            'card_description' => $payload['card_description'],
            'card_cta_label' => $payload['card_cta_label'],
            'hero_cta_label' => $payload['hero_cta_label'],
            'overview_title' => $payload['overview_title'],
            'overview' => $payload['overview'],
            'why_choose_title' => $payload['why_choose_title'],
            'why_choose_text' => $payload['why_choose_text'],
            'process_title' => $payload['process_title'],
            'benefits_title' => $payload['benefits_title'],
            'cta_title' => $payload['cta_title'],
            'cta_text' => $payload['cta_text'],
            'cta_supporting_text' => $payload['cta_supporting_text'],
            'cta_label' => $payload['cta_label'],
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
    $sections = $pdo->prepare('SELECT id, section_key, eyebrow, heading, body, display_order FROM service_content_sections WHERE service_id = :id ORDER BY display_order ASC, id ASC');
    $sections->execute(['id' => $row['id']]);
    $contentSections = array_map(static function (array $section) use ($pdo): array {
        $items = $pdo->prepare('SELECT title, description, details, display_order FROM service_content_items WHERE section_id = :section_id ORDER BY display_order ASC, id ASC');
        $items->execute(['section_id' => $section['id']]);
        return [
            'key' => $section['section_key'],
            'eyebrow' => $section['eyebrow'],
            'heading' => $section['heading'],
            'body' => $section['body'],
            'display_order' => (int) $section['display_order'],
            'items' => $items->fetchAll(),
        ];
    }, $sections->fetchAll());

    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'icon_identifier' => $row['icon_identifier'],
        'hero_title' => $row['hero_title'],
        'hero_subtitle' => $row['hero_subtitle'],
        'card_description' => $row['card_description'],
        'card_cta_label' => $row['card_cta_label'],
        'hero_cta_label' => $row['hero_cta_label'],
        'overview_title' => $row['overview_title'],
        'overview' => $row['overview'],
        'why_choose_title' => $row['why_choose_title'],
        'why_choose_text' => $row['why_choose_text'],
        'process_title' => $row['process_title'],
        'benefits_title' => $row['benefits_title'],
        'cta_title' => $row['cta_title'],
        'cta_text' => $row['cta_text'],
        'cta_supporting_text' => $row['cta_supporting_text'],
        'cta_label' => $row['cta_label'],
        'stats' => $stats->fetchAll(),
        'process' => $process->fetchAll(),
        'benefits' => $benefits->fetchAll(),
        'content_sections' => $contentSections,
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
        'cardDescription' => 'card_description',
        'cardCtaLabel' => 'card_cta_label',
        'heroCtaLabel' => 'hero_cta_label',
        'overviewTitle' => 'overview_title',
        'whyChooseTitle' => 'why_choose_title',
        'whyChooseText' => 'why_choose_text',
        'processTitle' => 'process_title',
        'benefitsTitle' => 'benefits_title',
        'contentSections' => 'content_sections',
        'ctaTitle' => 'cta_title',
        'ctaText' => 'cta_text',
        'ctaSupportingText' => 'cta_supporting_text',
        'ctaLabel' => 'cta_label',
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
        'card_description' => Validation::string($source, 'card_description', false, 2000) ?? '',
        'card_cta_label' => Validation::string($source, 'card_cta_label', false, 255) ?? '',
        'hero_cta_label' => Validation::string($source, 'hero_cta_label', false, 255) ?? '',
        'overview_title' => Validation::string($source, 'overview_title', false, 500) ?? '',
        'overview' => Validation::string($source, 'overview', false, 100000) ?? '',
        'why_choose_title' => Validation::string($source, 'why_choose_title', false, 500) ?? '',
        'why_choose_text' => Validation::string($source, 'why_choose_text', false, 100000) ?? '',
        'process_title' => Validation::string($source, 'process_title', false, 500) ?? '',
        'benefits_title' => Validation::string($source, 'benefits_title', false, 500) ?? '',
        'cta_title' => Validation::string($source, 'cta_title', false, 500) ?? '',
        'cta_text' => Validation::string($source, 'cta_text', false, 10000) ?? '',
        'cta_supporting_text' => Validation::string($source, 'cta_supporting_text', false, 1000) ?? '',
        'cta_label' => Validation::string($source, 'cta_label', false, 255) ?? '',
        'content_sections' => api_service_content_sections($source['content_sections'] ?? []),
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

function api_service_content_sections(mixed $value): array
{
    if (!is_array($value)) throw new ApiException(400, 'VALIDATION_ERROR', 'content_sections must be an array.');
    $result = [];
    $keys = [];
    foreach ($value as $sectionIndex => $section) {
        if (!is_array($section)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content_sections[%d] must be an object.', $sectionIndex));
        $key = Validation::slug((string) ($section['key'] ?? $section['section_key'] ?? ''), sprintf('content_sections[%d].key', $sectionIndex));
        if (isset($keys[$key])) throw new ApiException(400, 'VALIDATION_ERROR', 'Each content section key must be unique.');
        $keys[$key] = true;
        $items = [];
        if (!is_array($section['items'] ?? [])) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content_sections[%d].items must be an array.', $sectionIndex));
        foreach ($section['items'] ?? [] as $itemIndex => $item) {
            if (!is_array($item)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('content_sections[%d].items[%d] must be an object.', $sectionIndex, $itemIndex));
            $items[] = [
                'title' => Validation::string($item, 'title', true, 500),
                'description' => Validation::string($item, 'description', false, 20000) ?? '',
                'details' => Validation::nullableString($item, 'details', 20000),
                'display_order' => Validation::integer($item, 'display_order', $itemIndex),
            ];
        }
        $result[] = [
            'key' => $key,
            'eyebrow' => Validation::nullableString($section, 'eyebrow', 255),
            'heading' => Validation::string($section, 'heading', true, 500),
            'body' => Validation::nullableString($section, 'body', 50000),
            'display_order' => Validation::integer($section, 'display_order', $sectionIndex),
            'items' => $items,
        ];
    }
    return $result;
}

function api_services_insert(PDO $pdo, string $id, array $payload): void
{
    $statement = $pdo->prepare(
        'INSERT INTO services
            (id, name, slug, icon_identifier, hero_title, hero_subtitle, card_description, card_cta_label,
             hero_cta_label, overview_title, overview, why_choose_title, why_choose_text, process_title,
             benefits_title, cta_title, cta_text, cta_supporting_text, cta_label,
             testimonial_quote, testimonial_author, display_order)
         VALUES
            (:id, :name, :slug, :icon_identifier, :hero_title, :hero_subtitle, :card_description, :card_cta_label,
             :hero_cta_label, :overview_title, :overview, :why_choose_title, :why_choose_text, :process_title,
             :benefits_title, :cta_title, :cta_text, :cta_supporting_text, :cta_label,
             :testimonial_quote, :testimonial_author, :display_order)',
    );
    $statement->execute([
        'id' => $id,
        'name' => $payload['name'],
        'slug' => $payload['slug'],
        'icon_identifier' => $payload['icon_identifier'],
        'hero_title' => $payload['hero_title'],
        'hero_subtitle' => $payload['hero_subtitle'],
        'card_description' => $payload['card_description'],
        'card_cta_label' => $payload['card_cta_label'],
        'hero_cta_label' => $payload['hero_cta_label'],
        'overview_title' => $payload['overview_title'],
        'overview' => $payload['overview'],
        'why_choose_title' => $payload['why_choose_title'],
        'why_choose_text' => $payload['why_choose_text'],
        'process_title' => $payload['process_title'],
        'benefits_title' => $payload['benefits_title'],
        'cta_title' => $payload['cta_title'],
        'cta_text' => $payload['cta_text'],
        'cta_supporting_text' => $payload['cta_supporting_text'],
        'cta_label' => $payload['cta_label'],
        'testimonial_quote' => $payload['testimonial_quote'],
        'testimonial_author' => $payload['testimonial_author'],
        'display_order' => $payload['display_order'],
    ]);
}

function api_services_replace_children(PDO $pdo, string $id, array $payload): void
{
    foreach (['service_stats', 'service_process_steps', 'service_benefits', 'service_content_sections'] as $table) {
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

    $sectionStatement = $pdo->prepare('INSERT INTO service_content_sections (service_id, section_key, eyebrow, heading, body, display_order) VALUES (:service_id, :section_key, :eyebrow, :heading, :body, :display_order)');
    $itemStatement = $pdo->prepare('INSERT INTO service_content_items (section_id, title, description, details, display_order) VALUES (:section_id, :title, :description, :details, :display_order)');
    foreach ($payload['content_sections'] as $section) {
        $sectionStatement->execute([
            'service_id' => $id,
            'section_key' => $section['key'],
            'eyebrow' => $section['eyebrow'],
            'heading' => $section['heading'],
            'body' => $section['body'],
            'display_order' => $section['display_order'],
        ]);
        $sectionId = (int) $pdo->lastInsertId();
        foreach ($section['items'] as $item) {
            $itemStatement->execute([
                'section_id' => $sectionId,
                'title' => $item['title'],
                'description' => $item['description'],
                'details' => $item['details'],
                'display_order' => $item['display_order'],
            ]);
        }
    }
}
