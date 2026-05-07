<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class StoreExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Definimos el año actual para limitar fechas futuras
        $currentYear = Carbon::now()->year;
        $minYear = 1950; // Año mínimo lógico para una carrera profesional

        return [
            'type' => 'required|in:work,academic',
            'institution' => 'required|string|min:3|max:200',
            'title' => 'required|string|min:2|max:200',

            // VALIDACIÓN DE FECHA
            'start_date' => [
                'required',
                'date',
                'before_or_equal:today',

                function ($attribute, $value, $fail) use ($minYear, $currentYear) {
                    $year = Carbon::parse($value)->year;
                    if ($year < $minYear) {
                        $fail("El año de inicio no puede ser anterior a $minYear.");
                    }
                    if ($year > $currentYear) {
                        $fail("El año de inicio no puede ser mayor al año actual.");
                    }
                },
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',

                Rule::requiredIf(function () {
                    return $this->type === 'academic' && in_array($this->status, ['Graduado', 'Pausado']);
                }),

                function ($attribute, $value, $fail) use ($minYear, $currentYear) {
                    if (!$value) return;
                    $year = Carbon::parse($value)->year;
                    if ($year < $minYear) {
                        $fail("El año de finalización no es válido.");
                    }

                    if ($this->status === 'Graduado' && $year > $currentYear) {
                        $fail("Si ya te has graduado, la fecha de fin no puede ser mayor al año actual.");
                    }
                },
            ],

            // Solo aplican a type academic; si type es work y envían null, Rule::in/string fallaban con 422.
            'status' => [
                'exclude_unless:type,academic',
                'required',
                Rule::in(['En curso', 'Graduado', 'Pausado']),
            ],

            'degree_type' => [
                'exclude_unless:type,academic',
                'required',
                'string',
                'max:100',
            ],

            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'start_date.before_or_equal' => 'La fecha de inicio no puede ser futura.',
            'end_date.after_or_equal' => 'La fecha de fin debe ser posterior a la de inicio.',
            'institution.min' => 'El nombre de la institución debe tener al menos 3 caracteres.',
            'title.min' => 'El título debe tener al menos 2 caracteres.',
        ];
    }
}
