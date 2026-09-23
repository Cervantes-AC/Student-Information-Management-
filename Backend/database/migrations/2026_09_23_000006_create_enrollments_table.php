<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->foreignId('course_offering_id')->constrained('course_offerings')->restrictOnDelete();
            $table->date('enrollment_date')->default(now()->toDateString());
            $table->string('status', 20)->default('enrolled')->index();
            $table->timestamps();

            $table->unique(['student_id', 'course_offering_id']);
            $table->index(['course_offering_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};