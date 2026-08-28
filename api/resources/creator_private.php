<?php
declare(strict_types=1);

function api_creator_private_key(array $config): string
{
    $name = (string) ($config['creator_pii_key_env'] ?? 'CREATOR_PII_KEY');
    $environmentSecret = getenv($name);
    $configuredSecret = $config['creator_pii_key'] ?? null;
    $secret = $environmentSecret !== false && $environmentSecret !== ''
        ? $environmentSecret
        : $configuredSecret;
    if (!is_string($secret) || strlen($secret) < 32) {
        throw new ApiException(503, 'CREATOR_PII_NOT_CONFIGURED', 'Private Creator data protection is not configured.');
    }
    return hash('sha256', $secret, true);
}

function api_creator_cnic(array $input, bool $required): ?string
{
    if (!array_key_exists('cnic', $input) || $input['cnic'] === null || trim((string) $input['cnic']) === '') {
        if ($required) throw new ApiException(400, 'VALIDATION_ERROR', 'CNIC is required.');
        return null;
    }
    if (!is_string($input['cnic'])) throw new ApiException(400, 'VALIDATION_ERROR', 'CNIC must be text.');
    $normalized = preg_replace('/\D+/', '', $input['cnic']) ?? '';
    if (!preg_match('/^[0-9]{13}$/', $normalized)) throw new ApiException(400, 'VALIDATION_ERROR', 'CNIC must contain exactly 13 digits.');
    return $normalized;
}

function api_creator_encrypt_cnic(array $config, string $cnic): string
{
    $iv = random_bytes(12);
    $tag = '';
    $encrypted = openssl_encrypt($cnic, 'aes-256-gcm', api_creator_private_key($config), OPENSSL_RAW_DATA, $iv, $tag, 'raahx-creator-cnic-v1', 16);
    if ($encrypted === false) throw new ApiException(500, 'PRIVATE_DATA_ENCRYPTION_FAILED', 'Private Creator data could not be protected.');
    return 'v1:' . base64_encode($iv . $tag . $encrypted);
}

function api_creator_decrypt_cnic(array $config, ?string $ciphertext): ?string
{
    if ($ciphertext === null || $ciphertext === '') return null;
    if (!str_starts_with($ciphertext, 'v1:')) throw new ApiException(500, 'PRIVATE_DATA_INVALID', 'Stored private Creator data is invalid.');
    $packed = base64_decode(substr($ciphertext, 3), true);
    if ($packed === false || strlen($packed) < 29) throw new ApiException(500, 'PRIVATE_DATA_INVALID', 'Stored private Creator data is invalid.');
    $plain = openssl_decrypt(substr($packed, 28), 'aes-256-gcm', api_creator_private_key($config), OPENSSL_RAW_DATA, substr($packed, 0, 12), substr($packed, 12, 16), 'raahx-creator-cnic-v1');
    if ($plain === false) throw new ApiException(500, 'PRIVATE_DATA_DECRYPTION_FAILED', 'Private Creator data could not be read.');
    return $plain;
}

function api_creator_private_pricing(array $input, array $existing = []): array
{
    $currencies = ['PKR','USD','GBP','EUR','AED','SAR','CAD','AUD'];
    $number = static function (string $key) use ($input, $existing): ?float {
        if (!array_key_exists($key, $input)) return isset($existing[$key]) ? (float) $existing[$key] : null;
        if ($input[$key] === null || $input[$key] === '') return null;
        if (!is_numeric($input[$key]) || (float) $input[$key] < 0 || (float) $input[$key] > 9999999999.99) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('%s must be a non-negative number.', $key));
        return round((float) $input[$key], 2);
    };
    $minimum = $number('pricing_min');
    $maximum = $number('pricing_max');
    if ($minimum !== null && $maximum !== null && $maximum < $minimum) throw new ApiException(400, 'VALIDATION_ERROR', 'Maximum price cannot be less than starting price.');
    $currency = array_key_exists('pricing_currency', $input) ? strtoupper(trim((string) $input['pricing_currency'])) : ($existing['pricing_currency'] ?? null);
    if (($minimum !== null || $maximum !== null) && !in_array($currency, $currencies, true)) throw new ApiException(400, 'VALIDATION_ERROR', 'Choose a supported pricing currency.');
    if ($minimum === null && $maximum === null) $currency = null;
    return ['pricing_min'=>$minimum, 'pricing_max'=>$maximum, 'pricing_currency'=>$currency];
}

function api_creator_private_store_application(PDO $pdo, string $applicationId, array $input, array $config): void
{
    $cnic = api_creator_cnic($input, true);
    $pricing = api_creator_private_pricing($input);
    $statement = $pdo->prepare('INSERT INTO creator_application_private_data (application_id, cnic_ciphertext, cnic_last4, pricing_min, pricing_max, pricing_currency) VALUES (:id,:ciphertext,:last4,:minimum,:maximum,:currency)');
    $statement->execute(['id'=>$applicationId, 'ciphertext'=>api_creator_encrypt_cnic($config, $cnic ?? ''), 'last4'=>substr($cnic ?? '', -4), 'minimum'=>$pricing['pricing_min'], 'maximum'=>$pricing['pricing_max'], 'currency'=>$pricing['pricing_currency']]);
}

function api_creator_private_copy_application(PDO $pdo, string $applicationId, string $creatorId): void
{
    $statement = $pdo->prepare('INSERT INTO creator_private_data (creator_id, cnic_ciphertext, cnic_last4, pricing_min, pricing_max, pricing_currency) SELECT :creator_id, cnic_ciphertext, cnic_last4, pricing_min, pricing_max, pricing_currency FROM creator_application_private_data WHERE application_id=:application_id');
    $statement->execute(['creator_id'=>$creatorId, 'application_id'=>$applicationId]);
    // Applications created before this additive migration have no private row.
    // Preserve their approval path without inventing CNIC or pricing values.
    if ($statement->rowCount() !== 1) {
        $empty = $pdo->prepare('INSERT INTO creator_private_data (creator_id) VALUES (:creator_id)');
        $empty->execute(['creator_id'=>$creatorId]);
    }
}

function api_creator_private_for_application(PDO $pdo, string $applicationId, array $config): array
{
    return api_creator_private_read($pdo, 'creator_application_private_data', 'application_id', $applicationId, $config);
}

function api_creator_private_for_creator(PDO $pdo, string $creatorId, array $config): array
{
    return api_creator_private_read($pdo, 'creator_private_data', 'creator_id', $creatorId, $config);
}

function api_creator_private_read(PDO $pdo, string $table, string $column, string $id, array $config): array
{
    $allowed = ['creator_private_data'=>'creator_id', 'creator_application_private_data'=>'application_id'];
    if (($allowed[$table] ?? null) !== $column) throw new LogicException('Invalid private Creator table.');
    $statement = $pdo->prepare(sprintf('SELECT cnic_ciphertext, cnic_last4, pricing_min, pricing_max, pricing_currency FROM %s WHERE %s=:id LIMIT 1', $table, $column));
    $statement->execute(['id'=>$id]);
    $row = $statement->fetch();
    if (!is_array($row)) return ['cnic'=>null, 'cnic_last4'=>null, 'pricing_min'=>null, 'pricing_max'=>null, 'pricing_currency'=>null];
    return ['cnic'=>api_creator_decrypt_cnic($config, $row['cnic_ciphertext']), 'cnic_last4'=>$row['cnic_last4'], 'pricing_min'=>$row['pricing_min']===null?null:(float)$row['pricing_min'], 'pricing_max'=>$row['pricing_max']===null?null:(float)$row['pricing_max'], 'pricing_currency'=>$row['pricing_currency']];
}

function api_creator_private_upsert_creator(PDO $pdo, string $creatorId, array $input, array $config): void
{
    $existing = api_creator_private_for_creator($pdo, $creatorId, $config);
    $cnic = array_key_exists('cnic', $input) ? api_creator_cnic($input, false) : $existing['cnic'];
    $pricing = api_creator_private_pricing($input, $existing);
    $statement = $pdo->prepare('INSERT INTO creator_private_data (creator_id, cnic_ciphertext, cnic_last4, pricing_min, pricing_max, pricing_currency) VALUES (:id,:ciphertext,:last4,:minimum,:maximum,:currency) ON DUPLICATE KEY UPDATE cnic_ciphertext=VALUES(cnic_ciphertext), cnic_last4=VALUES(cnic_last4), pricing_min=VALUES(pricing_min), pricing_max=VALUES(pricing_max), pricing_currency=VALUES(pricing_currency)');
    $statement->execute(['id'=>$creatorId, 'ciphertext'=>$cnic===null?null:api_creator_encrypt_cnic($config,$cnic), 'last4'=>$cnic===null?null:substr($cnic,-4), 'minimum'=>$pricing['pricing_min'], 'maximum'=>$pricing['pricing_max'], 'currency'=>$pricing['pricing_currency']]);
}
