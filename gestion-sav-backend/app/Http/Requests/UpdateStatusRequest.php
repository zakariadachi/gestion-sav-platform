<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\TicketStatus;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, [
            \App\Enums\UserRole::Admin,
            \App\Enums\UserRole::Technician,
        ]);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in([TicketStatus::InProgress->value, TicketStatus::Resolved->value])],
        ];
    }
}
