<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreSkillRequest extends FormRequest
{
    /**
     * All authenticated users are authorized to create skills.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for creating a skill.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:100'],
            'type'              => ['required', 'string', 'in:technical,soft'],
            'proficiency_level' => ['required', 'integer', 'min:1', 'max:5'],
        ];
    }

    /**
     * Custom error messages in Spanish for the frontend team.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'              => 'El nombre de la habilidad es obligatorio.',
            'name.max'                   => 'El nombre no puede exceder los 100 caracteres.',
            'type.required'              => 'El tipo de habilidad es obligatorio.',
            'type.in'                    => 'El tipo debe ser "technical" o "soft".',
            'proficiency_level.required' => 'El nivel de dominio es obligatorio.',
            'proficiency_level.min'      => 'El nivel de dominio debe ser al menos 1.',
            'proficiency_level.max'      => 'El nivel de dominio no puede ser mayor a 5.',
        ];
    }

    /**
     * Return validation errors as a structured JSON response
     * instead of redirecting (API-only behavior).
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Error de validación.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
