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
            'name'              => [
                'required',
                'string',
                'max:100',
                'regex:/[\p{L}]/u', // Must contain at least one letter
                'regex:/^[\p{L}\p{N}\s\+\#\.\-\/_@&:\(\),]+$/u', // Only allowed characters
                function ($attribute, $value, $fail) {
                    // Check for 5 or more consecutive digits
                    if (preg_match('/\d{5,}/', $value)) {
                        $fail('El nombre de la habilidad no debe contener más de 4 números seguidos.');
                    }

                    // Check letter ratio (must be at least 30% letters)
                    $alphanumeric = preg_replace('/[^\p{L}\p{N}]/u', '', $value);
                    $letters = preg_replace('/[^\p{L}]/u', '', $value);
                    $totalLength = mb_strlen($alphanumeric);
                    $letterLength = mb_strlen($letters);
                    if ($totalLength > 0 && ($letterLength / $totalLength) < 0.3) {
                        $fail('El nombre de la habilidad debe contener una mayor proporción de letras.');
                    }
                }
            ],
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
            'name.regex'                 => 'El nombre de la habilidad debe contener al menos una letra y usar caracteres válidos.',
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
