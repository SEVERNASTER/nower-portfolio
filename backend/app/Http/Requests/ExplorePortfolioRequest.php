<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExplorePortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'search'   => 'nullable|string|max:100',
            'city'     => 'nullable|string|max:100',
            'skills'   => 'nullable|array',
            'skills.*' => 'string|max:50',
            'tags'     => 'nullable|array',
            'tags.*'   => 'string|max:50',
            'per_page' => 'nullable|integer|min:1|max:1000',
        ];
    }
}
