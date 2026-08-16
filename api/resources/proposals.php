<?php
declare(strict_types=1);

function api_proposals_create(PDO $pdo, array $input, array $config): array
{
    $payload = api_proposal_payload($input);

    $statement = $pdo->prepare(
        'INSERT INTO proposals
            (full_name, company_name, business_email, phone, website, industry,
             services, budget, timeline, project_details, submission_date)
         VALUES
            (:full_name, :company_name, :business_email, :phone, :website, :industry,
             :services, :budget, :timeline, :project_details, CURRENT_TIMESTAMP)',
    );
    $statement->execute($payload);
    $proposalId = (int) $pdo->lastInsertId();

    $mailConfig = $config['mail'] ?? [];
    $from = (string) ($mailConfig['from'] ?? 'hello@raahx.com');
    $to = (string) ($mailConfig['to'] ?? 'hello@raahx.com');
    $submittedAt = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s T');

    $adminHtml = sprintf(
        '<h2>New Proposal Request</h2>
         <p><strong>Full Name:</strong> %s</p>
         <p><strong>Company Name:</strong> %s</p>
         <p><strong>Email:</strong> %s</p>
         <p><strong>Phone:</strong> %s</p>
         <p><strong>Website:</strong> %s</p>
         <p><strong>Industry:</strong> %s</p>
         <p><strong>Services:</strong> %s</p>
         <p><strong>Budget (PKR):</strong> %s</p>
         <p><strong>Timeline:</strong> %s</p>
         <p><strong>Project Details:</strong></p>
         <p>%s</p>
         <p><strong>Submission Date:</strong> %s</p>',
        api_proposal_html($payload['full_name']),
        api_proposal_html($payload['company_name']),
        api_proposal_html($payload['business_email']),
        api_proposal_html($payload['phone']),
        api_proposal_html($payload['website'] ?? 'N/A'),
        api_proposal_html($payload['industry']),
        api_proposal_html($payload['services']),
        api_proposal_html($payload['budget']),
        api_proposal_html($payload['timeline']),
        nl2br(api_proposal_html($payload['project_details'])),
        api_proposal_html($submittedAt),
    );

    RaahxMailer::send($mailConfig, [
        'from' => $from,
        'to' => [$to],
        'reply_to' => $payload['business_email'],
        'subject' => 'New Proposal Request - RaahX',
        'html' => $adminHtml,
    ]);

    RaahxMailer::send($mailConfig, [
        'from' => $from,
        'to' => [$payload['business_email']],
        'subject' => 'Thank You for Contacting RaahX',
        'html' => '<p>Thank you for contacting RaahX.</p>
                  <p>We have received your proposal request.</p>
                  <p>Our team will review your requirements and contact you within 24 hours.</p>
                  <br>
                  <p>Best regards,</p>
                  <p>The RaahX Team</p>',
    ]);

    return [
        'id' => $proposalId,
        'message' => 'Proposal submitted successfully.',
    ];
}

function api_proposal_payload(array $input): array
{
    $aliases = [
        'fullName' => 'full_name',
        'companyName' => 'company_name',
        'businessEmail' => 'business_email',
        'projectDetails' => 'project_details',
    ];
    foreach ($aliases as $alias => $canonical) {
        if (!array_key_exists($canonical, $input) && array_key_exists($alias, $input)) {
            $input[$canonical] = $input[$alias];
        }
    }

    return [
        'full_name' => Validation::string($input, 'full_name', true, 255),
        'company_name' => Validation::string($input, 'company_name', true, 255),
        'business_email' => Validation::email($input, 'business_email'),
        'phone' => Validation::string($input, 'phone', true, 100),
        'website' => Validation::nullableString($input, 'website', 2048),
        'industry' => Validation::string($input, 'industry', true, 255),
        'services' => Validation::string($input, 'services', true, 255),
        'budget' => Validation::string($input, 'budget', true, 255),
        'timeline' => Validation::string($input, 'timeline', true, 255),
        'project_details' => Validation::string($input, 'project_details', true, 100000),
    ];
}

function api_proposal_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
