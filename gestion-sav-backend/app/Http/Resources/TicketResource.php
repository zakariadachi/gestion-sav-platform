<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'description'   => $this->description,
            'status'        => $this->status,
            'priority'      => $this->priority,
            'due_date'      => $this->due_date?->toDateTimeString(),
            'rating'        => $this->rating,
            'feedback'      => $this->feedback,
            'client_id'     => $this->client_id,
            'technician_id' => $this->technician_id,
            'client'        => $this->whenLoaded('client', fn () => [
                'id'   => $this->client->id,
                'name' => $this->client->name,
            ]),
            'technician'    => $this->whenLoaded('technician', fn () => $this->technician ? [
                'id'   => $this->technician->id,
                'name' => $this->technician->name,
            ] : null),
            'created_at'  => $this->created_at->toDateTimeString(),
            'updated_at'  => $this->updated_at->toDateTimeString(),
        ];
    }
}