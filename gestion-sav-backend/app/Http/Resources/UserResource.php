<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'role'        => $this->role,
            'status'      => $this->status ?? 'Active',
            'avatar_url'  => $this->avatar_url,
            'company'     => $this->company,
            'phone'       => $this->phone,
            'tickets'     => $this->tickets_total ?? 0,
            'resolved'    => $this->tickets_resolus ?? $this->resolvedTickets ?? 0,
            'openTickets' => $this->openTickets ?? 0,
        ];
    }
}
