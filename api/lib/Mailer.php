<?php
declare(strict_types=1);

/**
 * Small SMTP client for the PHP API.
 *
 * It intentionally uses the server-only SMTP configuration and never exposes
 * the password in responses or logs. Port 465 uses implicit TLS; port 587
 * uses STARTTLS.
 */
final class RaahxMailer
{
    public static function send(array $config, array $message): void
    {
        $host = trim((string) ($config['host'] ?? ''));
        $port = (int) ($config['port'] ?? 465);
        $secure = $port === 465
            ? true
            : ($port === 587 ? false : (bool) ($config['secure'] ?? true));
        $user = trim((string) ($config['user'] ?? ''));
        $password = (string) ($config['pass'] ?? '');

        if ($host === '' || $user === '' || $password === '') {
            throw new ApiException(503, 'EMAIL_NOT_CONFIGURED', 'Email delivery is not configured.');
        }

        $from = self::requireEmail((string) ($message['from'] ?? ''), 'from');
        $recipients = $message['to'] ?? [];
        $recipients = is_array($recipients) ? array_values($recipients) : [$recipients];
        $recipients = array_map(
            static fn (mixed $recipient): string => self::requireEmail((string) $recipient, 'to'),
            $recipients,
        );
        if ($recipients === []) {
            throw new ApiException(500, 'EMAIL_NOT_CONFIGURED', 'Email delivery has no recipient.');
        }

        $replyTo = null;
        if (array_key_exists('reply_to', $message) && $message['reply_to'] !== null && $message['reply_to'] !== '') {
            $replyTo = self::requireEmail((string) $message['reply_to'], 'reply_to');
        }

        $subject = (string) ($message['subject'] ?? '');
        if ($subject === '' || preg_match('/[\r\n]/', $subject)) {
            throw new ApiException(500, 'EMAIL_INVALID_MESSAGE', 'Email delivery received an invalid subject.');
        }

        $html = (string) ($message['html'] ?? '');
        $domain = self::safeDomain();
        $socket = null;

        try {
            $socket = self::openSocket($host, $port, $secure);
            self::expect($socket, [220]);
            self::command($socket, 'EHLO ' . $domain, [250]);

            if (!$secure) {
                self::command($socket, 'STARTTLS', [220]);
                $cryptoEnabled = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                if ($cryptoEnabled !== true) {
                    throw new RuntimeException('TLS negotiation failed.');
                }
                self::command($socket, 'EHLO ' . $domain, [250]);
            }

            self::command($socket, 'AUTH LOGIN', [334]);
            self::command($socket, base64_encode($user), [334]);
            self::command($socket, base64_encode($password), [235]);
            self::command($socket, 'MAIL FROM:<' . $from . '>', [250]);
            foreach ($recipients as $recipient) {
                self::command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
            }

            self::command($socket, 'DATA', [354]);
            self::write($socket, self::buildMessage($from, $recipients, $replyTo, $subject, $html, $domain));
            self::write($socket, "\r\n.\r\n");
            self::expect($socket, [250]);
            self::write($socket, "QUIT\r\n");
        } catch (ApiException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw new ApiException(502, 'EMAIL_DELIVERY_FAILED', 'Email delivery is temporarily unavailable.', $exception);
        } finally {
            if (is_resource($socket)) {
                fclose($socket);
            }
        }
    }

    private static function openSocket(string $host, int $port, bool $secure)
    {
        $transport = $secure ? 'ssl' : 'tcp';
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
                'allow_self_signed' => false,
                'peer_name' => $host,
            ],
        ]);
        $errorNumber = 0;
        $errorMessage = '';
        $socket = @stream_socket_client(
            $transport . '://' . $host . ':' . $port,
            $errorNumber,
            $errorMessage,
            15,
            STREAM_CLIENT_CONNECT,
            $context,
        );

        if (!is_resource($socket)) {
            throw new RuntimeException('SMTP connection failed.');
        }

        stream_set_timeout($socket, 15);
        return $socket;
    }

    private static function command($socket, string $command, array $expectedCodes): void
    {
        self::write($socket, $command . "\r\n");
        self::expect($socket, $expectedCodes);
    }

    private static function expect($socket, array $expectedCodes): void
    {
        $response = self::readResponse($socket);
        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException('SMTP server rejected a command.');
        }
    }

    private static function readResponse($socket): string
    {
        $response = '';
        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }

        if ($response === '') {
            throw new RuntimeException('SMTP server closed the connection.');
        }

        return $response;
    }

    private static function write($socket, string $data): void
    {
        $length = strlen($data);
        $offset = 0;
        while ($offset < $length) {
            $written = fwrite($socket, substr($data, $offset));
            if ($written === false || $written === 0) {
                throw new RuntimeException('SMTP write failed.');
            }
            $offset += $written;
        }
    }

    private static function buildMessage(
        string $from,
        array $recipients,
        ?string $replyTo,
        string $subject,
        string $html,
        string $domain,
    ): string {
        $headers = [
            'Date: ' . gmdate(DATE_RFC2822),
            'From: RaahX <' . $from . '>',
            'To: ' . implode(', ', array_map(static fn (string $email): string => '<' . $email . '>', $recipients)),
            'Subject: ' . self::encodeHeader($subject),
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domain . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        if ($replyTo !== null) {
            $headers[] = 'Reply-To: ' . $replyTo;
        }

        $normalizedBody = str_replace(["\r\n", "\r"], "\n", $html);
        $normalizedBody = str_replace("\n", "\r\n", $normalizedBody);
        $normalizedBody = preg_replace('/^\./m', '..', $normalizedBody) ?? $normalizedBody;

        return implode("\r\n", $headers) . "\r\n\r\n" . $normalizedBody;
    }

    private static function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }

    private static function requireEmail(string $value, string $field): string
    {
        $value = trim($value);
        if ($value === '' || preg_match('/[\r\n]/', $value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new ApiException(500, 'EMAIL_INVALID_ADDRESS', sprintf('Email delivery received an invalid %s address.', $field));
        }
        return $value;
    }

    private static function safeDomain(): string
    {
        $serverName = (string) ($_SERVER['SERVER_NAME'] ?? 'raahx.com');
        $domain = preg_replace('/[^A-Za-z0-9.-]/', '-', $serverName) ?: 'raahx.com';
        return trim($domain, '.-') ?: 'raahx.com';
    }
}
