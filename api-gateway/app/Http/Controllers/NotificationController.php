<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificationRequest;
use App\Models\Notification;
use App\Services\RabbitMQPublisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NotificationController extends Controller
{
    public function store(StoreNotificationRequest $request)
    {
        $data = $request->validated();
        $request_id = $data['request_id'];
        $cacheKey = "req:{$request_id}:notification_id";

        try{
        $userInfo = Http::timeout(3)->get('http://user-service:port/users/' . $data['user_id'])->json();

        if (!$userInfo['success']) {
            return response()->json([
                'success' => false,
                'error' => 'User not found',
                'message' => 'No user record for this ID',
                'meta' => $this->paginationMeta()
            ], 404);
        }
            } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'User service unavailable',
                'message' => $e->getMessage(),
                'meta' => $this->paginationMeta()
            ], 503);
        }

        if(Cache::has($cacheKey)) {
            $notifId = Cache::get($cacheKey);
            $notification = Notification::where('id', $notifId)->first();
            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'duplicate_request_returned',
                'meta' => $this->paginationMeta()
            ], 200);
        }

        $notification = Notification::create([
            'request_id' => $request_id,
            'user_id' => $data['user_id'],
            'notification_type' => $data['notification_type'],
            'template_code' => $data['template_code'],
            'variables' => $data['variables'] ?? null,
            'priority' => $data['priority'] ?? 5,
            'metadata' => $data['metadata'] ?? null,
            'status' => 'pending'
        ]);

        Cache::put($cacheKey, $notification->id, now()->addDays(7));

        $publisher = new RabbitMQPublisher();
        $routingKey = 'notification.' . $notification->notification_type;
        $payload = [
            'notification_id' => $notification->id,
            'request_id' => $notification->request_id,
            'notification_type' => $notification->notification_type,
            'user_id' => $notification->user_id,
            'template_code' => $notification->template_code,
            'variables' => $notification->variables,
            'priority' => $notification->priority,
            'metadata' => $notification->metadata,
            'created_at' => $notification->created_at->toIso8601String()
        ];

        $headers = ['correlation_id' => $notification->request_id];

        $publisher->publish($routingKey, $payload, $headers);

        return response()->json([
            'success' => true,
            'data' => $notification,
            'message' => 'notification_queued',
            'meta' => $this->paginationMeta()
        ], 201);
    }

    public function status($request_id)
    {
        $notification = Notification::where('request_id', $request_id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $notification,
            'message' => 'notification_status_fetched',
            'meta' => $this->paginationMeta()
        ]);
    }

    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'notification_id' => 'required|uuid',
            'status' => 'required|in:delivered,pending,failed',
            'timestamp' => 'nullable|date',
            'error' => 'nullable|string',
        ]);

        $notification = Notification::findOrFail($validated['notification_id']);
        $notification->status = $validated['status'];
        if(isset($validated['error']))
        {
            $notification->last_error = $validated['error'];
            $notification->attempts = $notification->attempts + 1;

            $notification->save();

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'status_updated',
                'meta' => $this->paginationMeta()
            ]);
        }
    }

    private function paginationMeta(): array
    {
        return [
            'total' => 0,
            'limit' => 0,
            'page' => 0,
            'total_pages' => 0,
            'has_next' => false,
            'has_previous' => false
        ];
    }
}
