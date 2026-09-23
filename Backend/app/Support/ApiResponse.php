<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Consistent API response envelope: { success, message, data, meta, errors }.
 */
class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'Request successful.',
        array $meta = [],
        int $status = 200
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function error(
        string $message = 'Request failed.',
        array $errors = [],
        int $status = 400
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}