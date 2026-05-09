<?php

namespace App\Http\Requests;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEducationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $clerkId = $this->get('clerk_user_id');

        if (! $clerkId) {
            return false;
        }

        $user = User::where('clerk_id', $clerkId)->first();

        if (! $user) {
            return false;
        }

        $id = (int) $this->route('id');

        return $user->experiences()
            ->where('type', 'academic')
            ->whereKey($id)
            ->exists();
    }

    public function rules(): array
    {
        $currentYear = Carbon::now()->year;
        $minYear     = 1950;

        return [
            'institution' => 'required|string|min:3|max:200',
            'title'       => 'required|string|min:2|max:200',
            'start_date'  => [
                'required',
                'date',
                'before_or_equal:today',
                function ($attribute, $value, $fail) use ($minYear, $currentYear) {
                    $year = Carbon::parse($value)->year;
                    if ($year < $minYear) {
                        $fail("El año de inicio no puede ser anterior a $minYear.");
                    }
                    if ($year > $currentYear) {
                        $fail('El año de inicio no puede ser mayor al año actual.');
                    }
                },
            ],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
                Rule::requiredIf(fn() => in_array($this->status, ['Graduado', 'Pausado'], true)),
                function ($attribute, $value, $fail) use ($minYear, $currentYear) {
                    if (! $value) {
                        return;
                    }
                    $year = Carbon::parse($value)->year;
                    if ($year < $minYear) {
                        $fail('El año de finalización no es válido.');
                    }
                    if ($this->status === 'Graduado' && $year > $currentYear) {
                        $fail('Si ya te has graduado, la fecha de fin no puede ser mayor al año actual.');
                    }
                },
            ],
            'status'      => ['required', Rule::in(['En curso', 'Graduado', 'Pausado'])],
            'degree_type' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required'          => 'La fecha de inicio es obligatoria.',
            'start_date.before_or_equal'   => 'La fecha de inicio no puede ser futura.',
            'end_date.after_or_equal'      => 'La fecha de fin debe ser posterior a la de inicio.',
            'institution.min'              => 'El nombre de la institución debe tener al menos 3 caracteres.',
            'title.min'                    => 'El título debe tener al menos 2 caracteres.',
        ];
    }
}
