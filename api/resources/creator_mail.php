<?php
declare(strict_types=1);

function api_creator_html(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function api_creator_mail_send_all(array $config, array $messages): array
{
    $mailConfig = $config['mail'] ?? [];
    $sent = 0;
    foreach ($messages as $message) {
        try {
            RaahxMailer::send($mailConfig, $message);
            $sent++;
        } catch (Throwable $exception) {
            error_log('[RaahX API] A Creator Network email could not be delivered.');
        }
    }
    return ['sent' => $sent, 'total' => count($messages)];
}

function api_creator_application_mail_messages(array $config, array $application): array
{
    $mail = $config['mail'] ?? [];
    $from = (string) ($mail['from'] ?? 'hello@raahx.com');
    $admin = (string) ($mail['to'] ?? 'hello@raahx.com');
    $appUrl = rtrim((string) ($config['app_url'] ?? 'https://raahx.com'), '/') ?: 'https://raahx.com';
    $payload = $application['submitted_payload'];
    $categories = implode(', ', $payload['categories'] ?? []);
    $socialLines = [];
    $followers = 0;
    foreach ($payload['socials'] ?? [] as $social) {
        $followers += (int) ($social['follower_count'] ?? 0);
        $socialLines[] = sprintf('%s — %s — %s followers', $social['platform'], $social['profile_url'], (int) $social['follower_count']);
    }
    $adminHtml = sprintf(
        '<h2>New Creator Application Requires Review</h2><p><strong>Application ID:</strong> %s</p><p><strong>Full name:</strong> %s</p><p><strong>Display name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>WhatsApp:</strong> %s</p><p><strong>City:</strong> %s</p><p><strong>Portfolio:</strong> %s</p><p><strong>Categories:</strong> %s</p><p><strong>Social accounts:</strong><br>%s</p><p><strong>Total submitted followers:</strong> %s</p><p><strong>Short bio:</strong> %s</p><p><strong>Submitted:</strong> %s</p><p><a href="%s/admin/creator-requests">Review Creator applications</a></p>',
        api_creator_html($application['id']), api_creator_html($application['full_name']), api_creator_html($application['display_name']),
        api_creator_html($application['email']), api_creator_html($application['whatsapp'] ?? 'N/A'), api_creator_html($application['city'] ?? 'N/A'),
        api_creator_html($application['portfolio_url'] ?? 'N/A'), api_creator_html($categories ?: 'None'), nl2br(api_creator_html(implode("\n", $socialLines) ?: 'None')),
        api_creator_html($followers), nl2br(api_creator_html($application['short_bio'] ?? 'N/A')),
        api_creator_html($application['created_at']), api_creator_html($appUrl),
    );
    return [
        ['from'=>$from, 'to'=>[$admin], 'reply_to'=>$application['email'], 'subject'=>'New Creator Application - RaahX', 'html'=>$adminHtml],
        ['from'=>$from, 'to'=>[$application['email']], 'subject'=>'We Received Your RaahX Creator Application', 'html'=>'<p>Thank you for applying to become a RaahX Creator.</p><p>Our team has received your information and will review your profile soon. We will contact you once the review is complete.</p><p>Your application is currently pending and has not yet been approved.</p><br><p>— The RaahX Team</p>'],
    ];
}

function api_creator_access_mail_message(array $config, array $creator, string $rawToken, bool $approved = false): array
{
    $mail = $config['mail'] ?? [];
    $from = (string) ($mail['from'] ?? 'hello@raahx.com');
    $appUrl = rtrim((string) ($config['app_url'] ?? 'https://raahx.com'), '/') ?: 'https://raahx.com';
    $url = $appUrl . '/creator-network/edit?token=' . rawurlencode($rawToken);
    $intro = $approved
        ? 'Your RaahX Creator application has been approved. Your profile is now available in the Creator Network.'
        : 'Use the secure link below to access and edit your RaahX Creator profile.';
    return [
        'from'=>$from,
        'to'=>[$creator['email']],
        'subject'=>$approved ? 'Your RaahX Creator Profile Is Approved' : 'Your RaahX Creator Profile Access Link',
        'html'=>sprintf('<p>Hello %s,</p><p>%s</p><p><a href="%s">Edit your Creator profile</a></p><p>This single-purpose link expires and can be revoked. Do not share it.</p><br><p>— The RaahX Team</p>', api_creator_html($creator['display_name']), api_creator_html($intro), api_creator_html($url)),
    ];
}

function api_creator_collaboration_mail_messages(array $config, array $request, array $creator): array
{
    $mail = $config['mail'] ?? [];
    $from = (string) ($mail['from'] ?? 'hello@raahx.com');
    $admin = (string) ($mail['to'] ?? 'hello@raahx.com');
    $details = sprintf(
        '<p><strong>Creator:</strong> %s</p><p><strong>Requester:</strong> %s</p><p><strong>Company/brand:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>WhatsApp:</strong> %s</p><p><strong>Campaign type:</strong> %s</p><p><strong>Budget:</strong> %s</p><p><strong>Campaign details:</strong></p><p>%s</p><p><strong>Portfolio/work link:</strong> %s</p>',
        api_creator_html($creator['display_name']), api_creator_html($request['requester_name']), api_creator_html($request['company_name'] ?? 'N/A'),
        api_creator_html($request['email']), api_creator_html($request['whatsapp'] ?? 'N/A'), api_creator_html($request['campaign_type'] ?? 'N/A'),
        api_creator_html($request['campaign_budget'] ?? 'N/A'), nl2br(api_creator_html($request['campaign_details'])), api_creator_html($request['portfolio_url'] ?? 'N/A'),
    );
    return [
        ['from'=>$from, 'to'=>[$creator['email']], 'reply_to'=>$request['email'], 'subject'=>'New Collaboration Request via RaahX', 'html'=>'<h2>A brand wants to collaborate with you</h2>' . $details],
        ['from'=>$from, 'to'=>[$admin], 'reply_to'=>$request['email'], 'subject'=>'Creator Collaboration Request - ' . $creator['display_name'], 'html'=>'<h2>New Creator Collaboration Request</h2>' . $details],
        ['from'=>$from, 'to'=>[$request['email']], 'subject'=>'We Received Your Collaboration Request - RaahX', 'html'=>sprintf('<p>Hello %s,</p><p>Thank you for your collaboration request for %s.</p><p>The Creator and RaahX team have received your campaign details. The Creator will reach out to you soon using the contact information you provided.</p><br><p>— The RaahX Team</p>', api_creator_html($request['requester_name']), api_creator_html($creator['display_name']))],
    ];
}
