<?php

namespace App\Services;

use App\Models\User;

class SocialLinkService
{
    public function syncLinks(User $user, array $links): void
    {
        $user->socialLinks()->delete();

        $validLinks = collect($links)
            ->filter(function ($link) {
                return !empty($link['platform_name']) && !empty($link['url']);
            })
            ->map(function ($link) {
                return [
                    'platform_name' => $link['platform_name'],
                    'url' => $link['url'],
                ];
            })
            ->values()
            ->toArray();

        if (!empty($validLinks)) {
            $user->socialLinks()->createMany($validLinks);
        }
    }
}