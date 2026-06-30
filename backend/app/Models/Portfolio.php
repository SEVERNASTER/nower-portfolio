<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'is_public',
        'content_dirty',
        'approved_content',

        'review_status',
        'review_comment',
        'reviewed_at',

        'template_key',
        'public_slug',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'content_dirty' => 'boolean',
        'approved_content' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
