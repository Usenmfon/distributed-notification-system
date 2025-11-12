<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Str;

class NotificationTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_store_notification_creates_and_returns_201()
    {
        $payload = [
            'notification_type' => 'email',
            'user_id' => (string) Str::uuid(),
            'template_code' => 'welcome_v1',
            'variables' => ['name' => 'Jane'],
            'request_id' => (string) Str::uuid(),
            'priority' => 5,
            "metadata" => ['source' => 'web']
        ];

        $response = $this->postJson('/api/v1/notifications', $payload);
        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'notification_queued', 'success' => true]);

        $this->assertDatabaseHas('notifications', ['request_id' => $payload['request_id']]);
    }
}
