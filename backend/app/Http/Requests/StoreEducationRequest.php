<?php

namespace App\Http\Requests;

/**
 * POST /api/education — fuerza type academic (misma validación que StoreExperienceRequest).
 */
class StoreEducationRequest extends StoreExperienceRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'type' => 'academic',
        ]);
    }
}
