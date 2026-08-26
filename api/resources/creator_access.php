<?php
declare(strict_types=1);

function api_creator_access_issue(PDO $pdo, string $creatorId, int $ttlSeconds = 3600): string
{
    $ttlSeconds = max(300, min($ttlSeconds, 86400));
    $rawToken = bin2hex(random_bytes(32));
    $hash = hash('sha256', $rawToken);
    $expiresAt = date('Y-m-d H:i:s', time() + $ttlSeconds);
    $revoke = $pdo->prepare("UPDATE creator_access_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE creator_id=:creator_id AND purpose='profile_edit' AND revoked_at IS NULL");
    $revoke->execute(['creator_id'=>$creatorId]);
    $insert = $pdo->prepare("INSERT INTO creator_access_tokens (creator_id, token_hash, purpose, expires_at) VALUES (:creator_id,:token_hash,'profile_edit',:expires_at)");
    $insert->execute(['creator_id'=>$creatorId, 'token_hash'=>$hash, 'expires_at'=>$expiresAt]);
    return $rawToken;
}

function api_creator_access_request(PDO $pdo, array $input, array $config): array
{
    $email = Validation::email($input, 'email');
    $statement = $pdo->prepare('SELECT * FROM creators WHERE email=:email AND approved_at IS NOT NULL LIMIT 1');
    $statement->execute(['email'=>$email]);
    $creator = $statement->fetch();
    if (is_array($creator)) {
        $rawToken = api_creator_access_issue($pdo, (string) $creator['id']);
        api_creator_mail_send_all($config, [api_creator_access_mail_message($config, $creator, $rawToken)]);
    }
    return ['message'=>'If an approved Creator profile matches that email, a secure access link has been sent.'];
}

function api_creator_access_resolve(PDO $pdo, string $rawToken, bool $touch = true): array
{
    if (!preg_match('/^[a-f0-9]{64}$/i', $rawToken)) throw new ApiException(401, 'INVALID_CREATOR_TOKEN', 'The Creator access link is invalid or expired.');
    $hash = hash('sha256', $rawToken);
    $statement = $pdo->prepare("SELECT id, creator_id FROM creator_access_tokens WHERE token_hash=:token_hash AND purpose='profile_edit' AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1");
    $statement->execute(['token_hash'=>$hash]);
    $token = $statement->fetch();
    if (!is_array($token)) throw new ApiException(401, 'INVALID_CREATOR_TOKEN', 'The Creator access link is invalid or expired.');
    if ($touch) {
        $update = $pdo->prepare('UPDATE creator_access_tokens SET last_used_at=CURRENT_TIMESTAMP WHERE id=:id');
        $update->execute(['id'=>$token['id']]);
    }
    return $token;
}

function api_creator_access_verify(PDO $pdo, array $input): array
{
    $token = Validation::string($input, 'token', true, 128) ?? '';
    $resolved = api_creator_access_resolve($pdo, $token);
    return ['authenticated'=>true, 'creator'=>api_creators_find($pdo, (string) $resolved['creator_id'], false)];
}

function api_creator_access_update(PDO $pdo, array $input): array
{
    $token = Validation::string($input, 'token', true, 128) ?? '';
    $profile = $input['profile'] ?? null;
    if (!is_array($profile)) throw new ApiException(400, 'VALIDATION_ERROR', 'profile must be an object.');
    $resolved = api_creator_access_resolve($pdo, $token);
    return api_creators_self_update($pdo, (string) $resolved['creator_id'], $profile);
}

function api_creator_access_revoke(PDO $pdo, string $creatorId): array
{
    api_creator_row($pdo, $creatorId);
    $statement = $pdo->prepare('UPDATE creator_access_tokens SET revoked_at=CURRENT_TIMESTAMP WHERE creator_id=:creator_id AND revoked_at IS NULL');
    $statement->execute(['creator_id'=>$creatorId]);
    return ['revoked'=>$statement->rowCount()];
}
