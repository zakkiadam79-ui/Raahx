<?php
declare(strict_types=1);

function api_team_list(PDO $pdo): array
{
    $statement = $pdo->query('SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC');
    return $statement->fetchAll();
}

function api_team_find(PDO $pdo, string $id): array
{
    $statement = $pdo->prepare('SELECT * FROM team_members WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $row = $statement->fetch();
    if (!is_array($row)) {
        throw new ApiException(404, 'NOT_FOUND', 'Team member not found.');
    }

    return $row;
}

function api_team_create(PDO $pdo, array $input): array
{
    $payload = api_team_payload($input);
    $id = Validation::id($input, 'id', false) ?? raahx_new_id('team');

    $statement = $pdo->prepare(
        'INSERT INTO team_members (id, name, role, image_url, linkedin_url, display_order)
         VALUES (:id, :name, :role, :image_url, :linkedin_url, :display_order)',
    );
    $statement->execute([
        'id' => $id,
        'name' => $payload['name'],
        'role' => $payload['role'],
        'image_url' => $payload['image_url'],
        'linkedin_url' => $payload['linkedin_url'],
        'display_order' => $payload['display_order'],
    ]);

    return api_team_find($pdo, $id);
}

function api_team_update(PDO $pdo, string $id, array $input): array
{
    $existing = api_team_find($pdo, $id);
    $payload = api_team_payload($input, $existing);

    $statement = $pdo->prepare(
        'UPDATE team_members SET
            name = :name,
            role = :role,
            image_url = :image_url,
            linkedin_url = :linkedin_url,
            display_order = :display_order
         WHERE id = :id',
    );
    $statement->execute([
        'id' => $id,
        'name' => $payload['name'],
        'role' => $payload['role'],
        'image_url' => $payload['image_url'],
        'linkedin_url' => $payload['linkedin_url'],
        'display_order' => $payload['display_order'],
    ]);

    return api_team_find($pdo, $id);
}

function api_team_delete(PDO $pdo, string $id): void
{
    api_team_find($pdo, $id);
    $statement = $pdo->prepare('DELETE FROM team_members WHERE id = :id');
    $statement->execute(['id' => $id]);
}

function api_team_payload(array $input, ?array $existing = null): array
{
    if (!array_key_exists('image_url', $input) && array_key_exists('image', $input)) {
        $input['image_url'] = $input['image'];
    }
    if (!array_key_exists('linkedin_url', $input) && array_key_exists('linkedin', $input)) {
        $input['linkedin_url'] = $input['linkedin'];
    }
    if (!array_key_exists('display_order', $input) && array_key_exists('displayOrder', $input)) {
        $input['display_order'] = $input['displayOrder'];
    }

    $source = array_merge($existing ?? [], $input);

    return [
        'name' => Validation::string($source, 'name', true, 255),
        'role' => Validation::string($source, 'role', true, 255),
        'image_url' => Validation::url($source, 'image_url', true),
        'linkedin_url' => Validation::url($source, 'linkedin_url'),
        'display_order' => Validation::integer($source, 'display_order'),
    ];
}
