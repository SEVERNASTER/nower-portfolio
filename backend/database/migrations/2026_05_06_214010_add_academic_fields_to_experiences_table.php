<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            // 1. Tipo de Grado (Licenciatura, Maestría, etc.)
            // Lo ponemos después de 'institution' para mantener orden
            $table->string('degree_type')->nullable()->after('institution');

            // 2. Estado de la formación (HU18: En curso, Graduado, Pausado)
            // Usamos enum para restringir los valores y asegurar integridad
            $table->enum('status', ['En curso', 'Graduado', 'Pausado'])
                  ->default('Graduado')
                  ->after('degree_type');

            // 3. Ajuste de fechas (Opcional pero recomendado)
            // Aseguramos que las fechas puedan ser null por si está "En curso"
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            // Eliminamos los campos si revertimos la migración
            $table->dropColumn(['degree_type', 'status']);
        });
    }
};