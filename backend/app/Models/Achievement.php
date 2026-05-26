<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Achievement extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'institution',
        'obtained_at',
        'hours',
        'description',
        'file_url',
        'file_public_id',
    ];

    protected $casts = [
        'obtained_at' => 'date',
        'hours' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(AchievementFile::class);
    }
}
