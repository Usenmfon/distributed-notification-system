<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('notifications')->group(function(){
        Route::post('/', [NotificationController::class, 'store'])->name('notification.store');
        Route::get('/{request_id}/status', [NotificationController::class, 'status'])->name('notification.status');
        Route::post('/status/update', [NotificationController::class, 'updateStatus'])->name('notification.update.status');
    });
    Route::get('/health', HealthController::class)->name('health');
});
