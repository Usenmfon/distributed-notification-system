<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Notification extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'request_id',
        'user_id',
        'notification_type',
        'template_code',
        'variables',
        'priority',
        'metadata',
        'status',
        'attempts',
        'last_error'
    ];

    protected $casts = [
        'variables' => 'array',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if(empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
