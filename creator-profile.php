<?php
declare(strict_types=1);

require_once __DIR__ . '/api/lib/bootstrap.php';

function creator_profile_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function creator_profile_image(?string $value): string
{
    if ($value === null || trim($value) === '') return 'https://raahx.com/logo.png';
    if (str_starts_with($value, '/')) return 'https://raahx.com' . $value;
    $parts = parse_url($value);
    return is_array($parts) && strtolower((string) ($parts['scheme'] ?? '')) === 'https'
        ? $value
        : 'https://raahx.com/logo.png';
}

$indexPath = __DIR__ . '/index.html';
$html = is_file($indexPath) ? (string) file_get_contents($indexPath) : '';
if ($html === '') {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Website entry point is unavailable.';
    exit;
}

try {
    $identifier = api_creator_public_identifier($_GET['creator'] ?? null);
    $creator = api_creators_find(Database::connect(raahx_config()), $identifier, true);
    $canonicalSegment = 'creator-' . (string) $creator['slug'];
    $canonicalPath = '/creator-network/' . rawurlencode($canonicalSegment);

    if ($identifier !== $canonicalSegment) {
        header('Location: https://raahx.com' . $canonicalPath, true, 301);
        exit;
    }

    $title = (string) $creator['display_name'] . ' | RaahX Creator Network';
    $description = trim((string) ($creator['short_bio'] ?: $creator['about'] ?: 'View this Creator profile on RaahX.'));
    $description = preg_replace('/\s+/u', ' ', strip_tags($description)) ?? '';
    $description = mb_substr($description, 0, 240);
    $image = creator_profile_image($creator['profile_image_url'] ?? null);
    $canonicalUrl = 'https://raahx.com' . $canonicalPath;

    $html = preg_replace('~\s*<title\b[^>]*>.*?</title>~is', '', $html) ?? $html;
    $html = preg_replace('~\s*<link\b(?=[^>]*rel=["\']canonical["\'])[^>]*>~i', '', $html) ?? $html;
    $html = preg_replace(
        '~\s*<meta\b(?=[^>]*(?:name|property)=["\'](?:description|og:(?:type|title|description|image|image:alt|url)|twitter:(?:card|title|description|image))["\'])[^>]*>~i',
        '',
        $html,
    ) ?? $html;

    $metadata = sprintf(
        "\n    <title>%s</title>\n" .
        "    <link rel=\"canonical\" href=\"%s\" />\n" .
        "    <meta name=\"description\" content=\"%s\" />\n" .
        "    <meta property=\"og:type\" content=\"profile\" />\n" .
        "    <meta property=\"og:title\" content=\"%s\" />\n" .
        "    <meta property=\"og:description\" content=\"%s\" />\n" .
        "    <meta property=\"og:image\" content=\"%s\" />\n" .
        "    <meta property=\"og:image:alt\" content=\"%s\" />\n" .
        "    <meta property=\"og:url\" content=\"%s\" />\n" .
        "    <meta name=\"twitter:card\" content=\"summary_large_image\" />\n" .
        "    <meta name=\"twitter:title\" content=\"%s\" />\n" .
        "    <meta name=\"twitter:description\" content=\"%s\" />\n" .
        "    <meta name=\"twitter:image\" content=\"%s\" />\n",
        creator_profile_html($title),
        creator_profile_html($canonicalUrl),
        creator_profile_html($description),
        creator_profile_html($title),
        creator_profile_html($description),
        creator_profile_html($image),
        creator_profile_html((string) $creator['display_name'] . ' profile photo'),
        creator_profile_html($canonicalUrl),
        creator_profile_html($title),
        creator_profile_html($description),
        creator_profile_html($image),
    );
    $html = str_replace('</head>', $metadata . '  </head>', $html);
} catch (Throwable $exception) {
    // Keep browser navigation available during a temporary API/database failure.
    raahx_log_exception($exception);
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=300');
echo $html;
