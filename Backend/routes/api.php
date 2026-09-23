<?php

use App\Http\Controllers\Api\V1\AcademicRecordController;
use App\Http\Controllers\Api\V1\AcademicTermController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CourseOfferingController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\GradeController;
use App\Http\Controllers\Api\V1\MyDataController;
use App\Http\Controllers\Api\V1\OfferingStudentController;
use App\Http\Controllers\Api\V1\ProgramController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\StudentEnrollmentController;
use App\Http\Controllers\Api\V1\StudentGradeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // ── Authentication ────────────────────────────────────────────────
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('dashboard/stats', [DashboardController::class, 'stats']);

        // ── Reference data (administrator + registrar only) ────────────
        Route::middleware('role:administrator,registrar')->group(function () {
            Route::apiResource('programs', ProgramController::class);
            Route::apiResource('courses', CourseController::class);
            Route::apiResource('academic-terms', AcademicTermController::class);
        });

        // ── Course offerings (staff manage; instructor views own) ──────
        Route::middleware('role:administrator,registrar,instructor')->group(function () {
            Route::get('course-offerings', [CourseOfferingController::class, 'index']);
            Route::get('course-offerings/{course_offering}', [CourseOfferingController::class, 'show']);
            Route::get('course-offerings/{course_offering}/students', [OfferingStudentController::class, 'index']);
        });
        Route::middleware('role:administrator,registrar')->group(function () {
            Route::post('course-offerings', [CourseOfferingController::class, 'store']);
            Route::match(['put', 'patch'], 'course-offerings/{course_offering}', [CourseOfferingController::class, 'update']);
            Route::delete('course-offerings/{course_offering}', [CourseOfferingController::class, 'destroy']);
        });

        // ── Students ───────────────────────────────────────────────────
        Route::get('students', [StudentController::class, 'index'])->middleware('role:administrator,registrar');
        Route::get('students/{student}', [StudentController::class, 'show']);
        Route::middleware('role:administrator,registrar')->group(function () {
            Route::post('students', [StudentController::class, 'store']);
            Route::match(['put', 'patch'], 'students/{student}', [StudentController::class, 'update']);
            Route::delete('students/{student}', [StudentController::class, 'destroy']);
        });

        // ── Enrollments (staff only) ───────────────────────────────────
        Route::middleware('role:administrator,registrar')->group(function () {
            Route::apiResource('enrollments', EnrollmentController::class)->except(['create', 'edit']);
        });

        // ── Grades (staff + instructors; instructors only for their own offerings) ──
        Route::get('grades', [GradeController::class, 'index'])->middleware('role:administrator,registrar');
        Route::get('grades/{grade}', [GradeController::class, 'show'])->middleware('role:administrator,registrar');
        Route::middleware('role:administrator,registrar,instructor')->group(function () {
            Route::post('grades', [GradeController::class, 'store']);
            Route::match(['put', 'patch'], 'grades/{grade}', [GradeController::class, 'update']);
        });

        // ── Nested collection endpoints (staff, or the student themselves) ──
        Route::middleware('role:administrator,registrar,student')->group(function () {
            Route::get('students/{student}/enrollments', [StudentEnrollmentController::class, 'index']);
            Route::get('students/{student}/grades', [StudentGradeController::class, 'index']);
            Route::get('students/{student}/academic-record', [AcademicRecordController::class, 'index']);
        });

        // ── Student self-service ───────────────────────────────────────
        Route::middleware('role:student')->group(function () {
            Route::get('my/enrollments', [MyDataController::class, 'enrollments']);
            Route::get('my/grades', [MyDataController::class, 'grades']);
            Route::get('my/academic-record', [MyDataController::class, 'academicRecord']);
        });
    });
});