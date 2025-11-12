<?php

use App\Http\Middleware\CorrelationMiddleware;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(append: [
            CorrelationMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (QueryException $e, $request) {
        if (str_contains($e->getMessage(), 'invalid input syntax for type uuid')) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid UUID format',
                'message' => 'The provided identifier is not a valid UUID.'
            ], 400);
        }

        return response()->json([
            'success' => false,
            'error' => 'Database error',
            'message' => $e->getMessage(),
        ], 500);
    });

    $exceptions->renderable(function (NotFoundHttpException $e, $request) {
        return response()->json([
            'success' => false,
            'error' => 'Resource not found'
        ], 404);
    });

    $exceptions->renderable(function (ValidationException $e, $request) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors(),
        ], 422);
    });

    $exceptions->renderable(function (Throwable $e, $request) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    });
    })->create();
