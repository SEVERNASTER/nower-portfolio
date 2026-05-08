<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExperienceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'type'        => $this->type,
            'title'       => $this->title,
            'institution' => $this->institution,
            'degree_type' => $this->degree_type,
            'status'      => $this->status,
            'start_date'  => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'end_date'    => $this->end_date ? $this->end_date->format('Y-m-d') : null,
            'description' => $this->description,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
