<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_number', 20)->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix', 20)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('contact_number', 30)->nullable();
            $table->text('address')->nullable();
            $table->foreignId('program_id')->constrained('programs')->restrictOnDelete();
            $table->unsignedTinyInteger('year_level')->default(1);
            $table->string('status', 20)->default('active')->index();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['program_id', 'year_level', 'status']);
            $table->index('last_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};