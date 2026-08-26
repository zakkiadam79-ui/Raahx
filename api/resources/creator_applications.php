<?php
declare(strict_types=1);

function api_creator_application_payload(array $input): array
{
    $socials = api_creator_socials($input['socials'] ?? []);
    $categories = api_creator_string_list($input['categories'] ?? [], 'categories');
    $expertise = api_creator_string_list($input['expertise'] ?? [], 'expertise');
    $collaborations = api_creator_string_list($input['collaboration_types'] ?? [], 'collaboration_types');
    $work = api_creator_featured_work($input['featured_work'] ?? []);
    return [
        'full_name'=>Validation::string($input, 'full_name', true, 255),
        'display_name'=>Validation::string($input, 'display_name', true, 255),
        'email'=>Validation::email($input, 'email'),
        'whatsapp'=>Validation::nullableString($input, 'whatsapp', 100),
        'profile_image_url'=>Validation::url($input, 'profile_image_url', true),
        'portfolio_url'=>Validation::url($input, 'portfolio_url'),
        'short_bio'=>Validation::nullableString($input, 'short_bio', 5000),
        'about'=>Validation::nullableString($input, 'about', 100000),
        'city'=>Validation::nullableString($input, 'city', 191),
        'region'=>Validation::nullableString($input, 'region', 191),
        'submitted_payload'=>[
            'socials'=>$socials, 'categories'=>$categories, 'expertise'=>$expertise,
            'collaboration_types'=>$collaborations, 'featured_work'=>$work,
        ],
    ];
}

function api_creator_applications_submit(PDO $pdo, array $input, array $config): array
{
    $payload = api_creator_application_payload($input);
    $duplicate = $pdo->prepare("SELECT id FROM creator_applications WHERE email = :email AND status = 'pending' LIMIT 1");
    $duplicate->execute(['email'=>$payload['email']]);
    if ($duplicate->fetchColumn() !== false) throw new ApiException(409, 'APPLICATION_PENDING', 'A pending Creator application already exists for this email.');
    $id = raahx_new_id('creator-application');
    $statement = $pdo->prepare('INSERT INTO creator_applications
        (id, full_name, display_name, email, whatsapp, profile_image_url, portfolio_url, short_bio, about, city, region, submitted_payload, status)
        VALUES (:id,:full_name,:display_name,:email,:whatsapp,:profile_image_url,:portfolio_url,:short_bio,:about,:city,:region,:submitted_payload,\'pending\')');
    $params = $payload;
    $params['id'] = $id;
    $params['submitted_payload'] = json_encode($payload['submitted_payload'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $statement->execute($params);
    $application = api_creator_applications_find($pdo, $id);
    api_creator_mail_send_all($config, api_creator_application_mail_messages($config, $application));
    return ['id'=>$id, 'status'=>'pending', 'message'=>'Creator application submitted for review.'];
}

function api_creator_applications_list(PDO $pdo, array $filters = []): array
{
    $params = [];
    $where = [];
    if (isset($filters['status']) && is_string($filters['status']) && trim($filters['status']) !== '') {
        $status = trim($filters['status']);
        if (!in_array($status, ['pending','approved','rejected'], true)) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid application status.');
        $where[] = 'status = :status'; $params['status'] = $status;
    }
    $sql = 'SELECT * FROM creator_applications' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY created_at DESC';
    $statement = $pdo->prepare($sql); $statement->execute($params);
    return array_map('api_creator_application_record', $statement->fetchAll());
}

function api_creator_applications_find(PDO $pdo, string $id, bool $forUpdate = false): array
{
    $statement = $pdo->prepare('SELECT * FROM creator_applications WHERE id = :id LIMIT 1' . ($forUpdate ? ' FOR UPDATE' : ''));
    $statement->execute(['id'=>$id]);
    $row = $statement->fetch();
    if (!is_array($row)) throw new ApiException(404, 'NOT_FOUND', 'Creator application not found.');
    return api_creator_application_record($row);
}

function api_creator_application_record(array $row): array
{
    try {
        $submitted = is_array($row['submitted_payload'] ?? null)
            ? $row['submitted_payload']
            : json_decode((string) ($row['submitted_payload'] ?? '{}'), true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new ApiException(500, 'INVALID_STORED_APPLICATION', 'Stored Creator application data is invalid.', $exception);
    }
    $row['submitted_payload'] = is_array($submitted) ? $submitted : [];
    return $row;
}

function api_creator_applications_approve(PDO $pdo, string $id, array $input, array $config): array
{
    $rawToken = null;
    $creatorId = raahx_new_id('creator');
    $pdo->beginTransaction();
    try {
        $application = api_creator_applications_find($pdo, $id, true);
        if ($application['status'] !== 'pending') throw new ApiException(409, 'APPLICATION_ALREADY_REVIEWED', 'Only pending applications can be approved.');
        $submitted = api_creator_application_payload(array_merge($application, $application['submitted_payload']));
        $slug = isset($input['slug']) ? Validation::slug((string) $input['slug']) : api_creator_available_slug($pdo, (string) $submitted['display_name']);
        Validation::uniqueSlug($pdo, 'creators', $slug);
        api_creator_assert_email_available($pdo, (string) $submitted['email']);
        $status = Validation::string($input, 'status', false, 32) ?? 'published';
        if (!in_array($status, ['published','hidden'], true)) throw new ApiException(400, 'VALIDATION_ERROR', 'status must be published or hidden.');
        $approvedAt = date('Y-m-d H:i:s');
        $creatorInput = array_merge($submitted, $submitted['submitted_payload'], [
            'portfolio_url'=>$submitted['portfolio_url'],
            'slug'=>$slug, 'status'=>$status, 'display_order'=>api_creator_next_display_order($pdo),
            'engagement_rate'=>$input['engagement_rate'] ?? 0, 'compatibility_score'=>$input['compatibility_score'] ?? null,
            'is_verified'=>$input['is_verified'] ?? false, 'followers_override'=>$input['followers_override'] ?? null,
            'approved_at'=>$approvedAt,
        ]);
        $creatorPayload = api_creator_payload($creatorInput, null, true);
        api_creators_insert($pdo, $creatorId, $creatorPayload);
        api_creators_replace_children($pdo, $creatorId, $creatorPayload);
        $rawToken = api_creator_access_issue($pdo, $creatorId);
        $update = $pdo->prepare("UPDATE creator_applications SET status='approved', admin_notes=:admin_notes, reviewed_by='admin-session', reviewed_at=CURRENT_TIMESTAMP, approved_creator_id=:creator_id WHERE id=:id");
        $update->execute(['admin_notes'=>Validation::nullableString($input, 'admin_notes', 100000), 'creator_id'=>$creatorId, 'id'=>$id]);
        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw api_creator_storage_exception($exception);
    }
    $creator = api_creators_find($pdo, $creatorId, false);
    $delivery = api_creator_mail_send_all($config, [api_creator_access_mail_message($config, $creator, (string) $rawToken, true)]);
    return ['application'=>api_creator_applications_find($pdo, $id), 'creator'=>$creator, 'notifications'=>$delivery];
}

function api_creator_applications_reject(PDO $pdo, string $id, array $input): array
{
    $application = api_creator_applications_find($pdo, $id);
    if ($application['status'] !== 'pending') throw new ApiException(409, 'APPLICATION_ALREADY_REVIEWED', 'Only pending applications can be rejected.');
    $statement = $pdo->prepare("UPDATE creator_applications SET status='rejected', admin_notes=:admin_notes, reviewed_by='admin-session', reviewed_at=CURRENT_TIMESTAMP WHERE id=:id AND status='pending'");
    $statement->execute(['admin_notes'=>Validation::nullableString($input, 'admin_notes', 100000), 'id'=>$id]);
    if ($statement->rowCount() !== 1) throw new ApiException(409, 'APPLICATION_ALREADY_REVIEWED', 'The application status changed before it could be rejected.');
    return api_creator_applications_find($pdo, $id);
}
