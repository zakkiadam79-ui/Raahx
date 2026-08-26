<?php
declare(strict_types=1);

function api_creator_brand_icon_keys(): array
{
    return [
        'camera','video','heart','users','lightbulb','chart','megaphone','message-circle','handshake','shield-check',
        'sparkles','star','award','badge-check','target','trending-up','zap','palette','pen-tool','image',
        'film','play','mic','headphones','globe','share','thumbs-up','smile','gem','crown',
        'rocket','briefcase','calendar-check','clock','eye','wand-sparkles',
    ];
}

function api_creator_brand_love_points(mixed $value): array
{
    if (!is_array($value)) throw new ApiException(400, 'VALIDATION_ERROR', 'brand_love_points must be an array.');
    if (count($value) > 4) throw new ApiException(400, 'VALIDATION_ERROR', 'A Creator can have at most four brand-love points.');
    $allowed = array_flip(api_creator_brand_icon_keys());
    $result = [];
    foreach ($value as $index => $item) {
        if (!is_array($item)) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('brand_love_points[%d] must be an object.', $index));
        $icon = Validation::string($item, 'icon_key', true, 64) ?? '';
        if (!isset($allowed[$icon])) throw new ApiException(400, 'VALIDATION_ERROR', sprintf('brand_love_points[%d].icon_key is not approved.', $index));
        $result[] = [
            'heading'=>Validation::string($item, 'heading', true, 255),
            'detail'=>Validation::string($item, 'detail', true, 5000),
            'icon_key'=>$icon,
            'display_order'=>api_creator_unsigned_integer($item, 'display_order', $index),
        ];
    }
    return $result;
}
