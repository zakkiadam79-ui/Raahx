<?php
declare(strict_types=1);

function api_blog_views_increment(PDO $pdo, string $slug): array
{
    $slug = Validation::slug($slug, 'slug');
    $statement = $pdo->prepare(
        'INSERT INTO blog_views (slug, views)
         VALUES (:slug, 1)
         ON DUPLICATE KEY UPDATE
            views = views + 1,
            updated_at = CURRENT_TIMESTAMP',
    );
    $statement->execute(['slug' => $slug]);

    $find = $pdo->prepare('SELECT slug, views FROM blog_views WHERE slug = :slug LIMIT 1');
    $find->execute(['slug' => $slug]);
    $row = $find->fetch();

    return [
        'slug' => $slug,
        'views' => is_array($row) ? (int) $row['views'] : 0,
        'tracked' => true,
    ];
}

function api_blog_views_popular(PDO $pdo, mixed $requestedLimit): array
{
    $limit = filter_var($requestedLimit, FILTER_VALIDATE_INT);
    $limit = $limit === false ? 3 : max(1, min(20, (int) $limit));

    $statement = $pdo->query(
        'SELECT slug, views FROM blog_views
         WHERE views > 0 ORDER BY views DESC, updated_at DESC, slug ASC
         LIMIT ' . $limit,
    );
    return [
        'posts' => array_map(
            static fn (array $row): array => [
                'slug' => $row['slug'],
                'views' => (int) $row['views'],
            ],
            $statement->fetchAll(),
        ),
    ];
}
