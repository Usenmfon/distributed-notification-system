<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class CorrelationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $correlationId = $request->header('correlation_id') ?? (string) Str::uuid();
        $requestId = $request->header('request_id') ?? $request->input('request_id') ?? null;

        Log::withContext([
            'correlation_id' => $correlationId,
            'request_id' => $requestId
        ]);

        $response =  $next($request);
        return $response->header('correlation_id', $correlationId);

    }
}
