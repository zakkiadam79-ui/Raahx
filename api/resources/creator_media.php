<?php
declare(strict_types=1);

const CREATOR_MEDIA_MAX_BYTES = 5242880;

function api_creator_media_upload(PDO $pdo, array $config, string $mode, array $input): array
{
    if (!in_array($mode, ['application', 'creator', 'admin'], true)) throw new ApiException(404, 'NOT_FOUND', 'Creator media endpoint not found.');
    if ($mode === 'admin') Auth::requireAuthenticated($pdo, $config);
    if ($mode === 'creator') {
        $token = is_string($input['token'] ?? null) ? $input['token'] : '';
        api_creator_access_resolve($pdo, $token);
    }
    if ($mode === 'application') api_creator_media_rate_limit();

    $file = $_FILES['image'] ?? null;
    if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new ApiException(400, 'IMAGE_UPLOAD_FAILED', 'Choose a valid image to upload.');
    }
    $size = (int) ($file['size'] ?? 0);
    $temporary = (string) ($file['tmp_name'] ?? '');
    if ($size < 1 || $size > CREATOR_MEDIA_MAX_BYTES || !is_uploaded_file($temporary)) {
        throw new ApiException(400, 'IMAGE_UPLOAD_INVALID', 'Image must be no larger than 5 MB.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($temporary);
    $extensions = ['image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp'];
    if (!isset($extensions[$mime])) throw new ApiException(400, 'IMAGE_TYPE_INVALID', 'Only JPEG, PNG, and WebP images are allowed.');
    $dimensions = @getimagesize($temporary);
    if (!is_array($dimensions) || ($dimensions[0] ?? 0) < 1 || ($dimensions[1] ?? 0) < 1 || $dimensions[0] > 8000 || $dimensions[1] > 8000) {
        throw new ApiException(400, 'IMAGE_CONTENT_INVALID', 'The uploaded file is not a valid supported image.');
    }

    $relativeDirectory = 'uploads/creator-media/' . gmdate('Y/m');
    $directory = dirname(__DIR__) . '/' . $relativeDirectory;
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new ApiException(500, 'IMAGE_STORAGE_FAILED', 'Creator image storage is unavailable.');
    }
    $filename = bin2hex(random_bytes(20)) . '.' . $extensions[$mime];
    $destination = $directory . '/' . $filename;
    if (!move_uploaded_file($temporary, $destination)) throw new ApiException(500, 'IMAGE_STORAGE_FAILED', 'The Creator image could not be stored.');
    @chmod($destination, 0644);

    return ['url'=>'/api/' . $relativeDirectory . '/' . $filename, 'mime_type'=>$mime, 'size'=>$size, 'width'=>(int) $dimensions[0], 'height'=>(int) $dimensions[1]];
}

function api_creator_media_rate_limit(): void
{
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $file = sys_get_temp_dir() . '/raahx-creator-upload-' . hash('sha256', $ip) . '.json';
    $now = time();
    $attempts = [];
    if (is_file($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded)) $attempts = array_values(array_filter($decoded, static fn ($time): bool => is_int($time) && $time > $now - 3600));
    }
    if (count($attempts) >= 10) throw new ApiException(429, 'UPLOAD_RATE_LIMITED', 'Too many image uploads. Try again later.');
    $attempts[] = $now;
    @file_put_contents($file, json_encode($attempts), LOCK_EX);
}
