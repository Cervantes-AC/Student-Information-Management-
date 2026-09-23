<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->restrictOnDelete();
            $table->string('section', 20);
            $table->string('schedule', 100)->nullable();
            $table->string('room', 50)->nullable();
            $table->unsignedInteger('capacity')->default(30);
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();

            $table->index(['course_id', 'academic_term_id']);
            $table->index('instructor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_offerings');
    }
};