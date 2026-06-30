<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateSkillRequest extends FormRequest
{
    /**
     * All authenticated users are authorized to update their own skills.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for updating a skill.
     * All fields are optional (partial update / PATCH).
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $generalErrorMessage = 'El nombre de la habilidad no es válido o contiene caracteres extraños.';

        return [
            'name'              => [
                'sometimes',
                'string',
                'max:100',
                'regex:/[\p{L}]/u', // Must contain at least one letter
                'regex:/^[\p{L}\p{N}\s\+\#\.\-\/_@&:\(\),]+$/u', // Only allowed characters
                function ($attribute, $value, $fail) use ($generalErrorMessage) {
                    // Check for 5 or more consecutive digits
                    if (preg_match('/\d{5,}/', $value)) {
                        $fail($generalErrorMessage);
                    }

                    // Check letter ratio (must be at least 30% letters)
                    $alphanumeric = preg_replace('/[^\p{L}\p{N}]/u', '', $value);
                    $letters = preg_replace('/[^\p{L}]/u', '', $value);
                    $totalLength = mb_strlen($alphanumeric);
                    $letterLength = mb_strlen($letters);
                    if ($totalLength > 0 && ($letterLength / $totalLength) < 0.3) {
                        $fail($generalErrorMessage);
                    }
                }
            ],
            'type'              => ['sometimes', 'string', 'in:technical,soft'],
            'proficiency_level' => ['sometimes', 'integer', 'min:1', 'max:5'],
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
            'name.max'              => 'El nombre no puede exceder los 100 caracteres.',
            'name.regex'            => 'El nombre de la habilidad no es válido o contiene caracteres extraños.',
            'type.in'               => 'El tipo debe ser "technical" o "soft".',
            'proficiency_level.min' => 'El nivel de dominio debe ser al menos 1.',
            'proficiency_level.max' => 'El nivel de dominio no puede ser mayor a 5.',
        ];
    }

    /**
     * Return validation errors as a structured JSON response.
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
