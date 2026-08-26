<?php
declare(strict_types=1);

function api_creator_collaboration_payload(array $input): array
{
    return [
        'creator_id'=>Validation::id($input, 'creator_id'),
        'requester_name'=>Validation::string($input, 'requester_name', true, 255),
        'company_name'=>Validation::nullableString($input, 'company_name', 255),
        'email'=>Validation::email($input, 'email'),
        'whatsapp'=>Validation::nullableString($input, 'whatsapp', 100),
        'campaign_type'=>Validation::nullableString($input, 'campaign_type', 191),
        'campaign_budget'=>Validation::nullableString($input, 'campaign_budget', 255),
        'campaign_details'=>Validation::string($input, 'campaign_details', true, 100000),
        'portfolio_url'=>Validation::url($input, 'portfolio_url'),
    ];
}

function api_creator_collaboration_create(PDO $pdo, array $input, array $config): array
{
    $payload = api_creator_collaboration_payload($input);
    $creator = api_creator_row($pdo, (string) $payload['creator_id']);
    if ($creator['status'] !== 'published') throw new ApiException(404, 'NOT_FOUND', 'Creator not found.');
    $statement = $pdo->prepare("INSERT INTO creator_collaboration_requests
        (creator_id, creator_display_name, requester_name, company_name, email, whatsapp, campaign_type, campaign_budget, campaign_details, portfolio_url, status)
        VALUES (:creator_id,:creator_display_name,:requester_name,:company_name,:email,:whatsapp,:campaign_type,:campaign_budget,:campaign_details,:portfolio_url,'new')");
    $statement->execute(array_merge($payload, ['creator_display_name'=>$creator['display_name']]));
    $id = (int) $pdo->lastInsertId();
    $request = array_merge($payload, ['id'=>$id, 'creator_display_name'=>$creator['display_name'], 'status'=>'new']);
    api_creator_mail_send_all($config, api_creator_collaboration_mail_messages($config, $request, $creator));
    return ['id'=>$id, 'status'=>'new', 'message'=>'Collaboration request submitted.'];
}

function api_creator_collaboration_list(PDO $pdo, array $filters = []): array
{
    $where=[]; $params=[];
    if (isset($filters['status']) && is_string($filters['status']) && trim($filters['status']) !== '') {
        $status=trim($filters['status']);
        if (!in_array($status, ['new','reviewed','closed'], true)) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid collaboration request status.');
        $where[]='status=:status'; $params['status']=$status;
    }
    if (isset($filters['creator_id']) && is_string($filters['creator_id']) && trim($filters['creator_id']) !== '') {
        $where[]='creator_id=:creator_id'; $params['creator_id']=Validation::id(['id'=>$filters['creator_id']]) ?? '';
    }
    $statement=$pdo->prepare('SELECT * FROM creator_collaboration_requests' . ($where ? ' WHERE ' . implode(' AND ',$where) : '') . ' ORDER BY created_at DESC');
    $statement->execute($params);
    return $statement->fetchAll();
}

function api_creator_collaboration_find(PDO $pdo, int $id): array
{
    if ($id < 1) throw new ApiException(400, 'VALIDATION_ERROR', 'Invalid collaboration request ID.');
    $statement=$pdo->prepare('SELECT * FROM creator_collaboration_requests WHERE id=:id LIMIT 1');
    $statement->execute(['id'=>$id]);
    $row=$statement->fetch();
    if (!is_array($row)) throw new ApiException(404, 'NOT_FOUND', 'Collaboration request not found.');
    return $row;
}
