<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Interactive API documentation (Swagger UI) — spec at /openapi.yaml
Route::get('/api/docs', function () {
    return view('swagger');
});