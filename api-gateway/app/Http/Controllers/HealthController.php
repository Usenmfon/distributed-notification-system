<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function __invoke()
    {
        $redisOk = true;
        try {
            Redis::connection()->ping();
        } catch (\Throwable $e) {
            $redisOk = false;
        }

    $dbOk = true;
    try {
        DB::select('select 1');
    } catch (\Throwable $e) {
        $dbOk = false;
    }

    $rabbitOk = false;
    try {
        $mgmtUrl = env('RABBITMQ_MGMT_URL', 'http://rabbitmq:15672/api/healthchecks/node');
        $client = new Client([
            'auth' => [env('RABBITMQ_USER', 'guest'), env('RABBITMQ_PASSWORD', 'guest')]
        ]);
        $response = $client->get($mgmtUrl);
        $status = json_decode($response->getBody(), true);
        $rabbitOk = !empty($status['status']) && $status['status'] === 'ok';
    } catch (\Throwable $e) {
        $rabbitOk = false;
    }

    return response()->json([
        'success' => true,
        'data' => [
            'app'      => 'ok',
            'redis'    => $redisOk ? 'ok' : 'down',
            'database' => $dbOk   ? 'ok' : 'down',
            'rabbitmq' => $rabbitOk ? 'ok' : 'down'
        ],
        'message' => 'health_check',
        'meta' => [
            'total' => 0, 'limit' => 0, 'page' => 0, 'total_pages' => 0, 'has_next' => false, 'has_previous' => false
        ]
    ]);
    }
}
