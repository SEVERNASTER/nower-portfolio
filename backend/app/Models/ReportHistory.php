<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportHistory extends Model
{
    protected $fillable = [
        'admin_user_id',
        'report_type',
        'filter_status',
        'rows_count',
        'filters',
        'data_snapshot',
        'generated_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'data_snapshot' => 'array',
        'generated_at' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}