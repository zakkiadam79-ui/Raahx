<?php
declare(strict_types=1);

function api_subscribers_list(PDO $pdo): array
{
    $statement = $pdo->query(
        'SELECT id, email, subscribed_at, created_at, updated_at
         FROM subscribers ORDER BY subscribed_at DESC, id DESC',
    );
    return $statement->fetchAll();
}

function api_subscribers_create(PDO $pdo, array $input): array
{
    $email = Validation::email($input, 'email');

    $existing = $pdo->prepare('SELECT id FROM subscribers WHERE email = :email LIMIT 1');
    $existing->execute(['email' => $email]);
    if ($existing->fetchColumn() !== false) {
        return [
            'message' => 'You are already subscribed.',
            'duplicate' => true,
        ];
    }

    try {
        $statement = $pdo->prepare(
            'INSERT INTO subscribers (email, subscribed_at)
             VALUES (:email, CURRENT_TIMESTAMP)',
        );
        $statement->execute(['email' => $email]);
    } catch (PDOException $exception) {
        // A concurrent request can win the unique-key race after the SELECT.
        if ($exception->getCode() === '23000') {
            return [
                'message' => 'You are already subscribed.',
                'duplicate' => true,
            ];
        }
        throw new ApiException(500, 'SUBSCRIBER_STORAGE_FAILED', 'Newsletter subscription could not be saved.', $exception);
    }

    return [
        'message' => 'Subscribed successfully.',
        'duplicate' => false,
    ];
}

function api_notify_subscribers(PDO $pdo, array $config, array $input): array
{
    $title = Validation::string($input, 'title', true, 500) ?? '';
    $slug = Validation::slug(Validation::string($input, 'slug', true, 191) ?? '', 'slug');
    $subscribers = api_subscribers_list($pdo);
    if ($subscribers === []) {
        return ['message' => 'No subscribers to notify.', 'sent' => 0, 'total' => 0];
    }

    $mailConfig = $config['mail'] ?? [];
    if ((string) ($mailConfig['pass'] ?? '') === '') {
        throw new ApiException(503, 'EMAIL_NOT_CONFIGURED', 'Email delivery is not configured.');
    }
    $from = (string) ($mailConfig['from'] ?? 'hello@raahx.com');
    $appUrl = rtrim((string) ($config['app_url'] ?? ''), '/');
    $postUrl = ($appUrl !== '' ? $appUrl : '') . '/blog/' . rawurlencode($slug);
    $safeTitle = htmlspecialchars($title ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeUrl = htmlspecialchars($postUrl, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $sent = 0;

    foreach ($subscribers as $subscriber) {
        try {
            RaahxMailer::send($mailConfig, [
                'from' => $from,
                'to' => [$subscriber['email']],
                'subject' => 'New on the RaahX Blog: ' . $title,
                'html' => sprintf(
                    '<h2>%s</h2>
                     <p>We just published a new article on the RaahX Blog.</p>
                     <p><a href="%s">Read it here</a></p>
                     <br>
                     <p>— The RaahX Team</p>',
                    $safeTitle,
                    $safeUrl,
                ),
            ]);
            $sent++;
        } catch (Throwable $exception) {
            error_log('[RaahX API] A newsletter notification could not be delivered.');
        }
    }

    return [
        'message' => 'Notifications processed.',
        'sent' => $sent,
        'total' => count($subscribers),
    ];
}
