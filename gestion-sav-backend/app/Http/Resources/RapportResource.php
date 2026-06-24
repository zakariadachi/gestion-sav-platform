<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class RapportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'ticket_id'  => $this->ticket_id,
            'contenu'    => $this->contenu,
            'photos'     => collect($this->photos ?? [])->map(
                fn (string $path) => Storage::url($path)
            )->values()->all(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
