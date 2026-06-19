<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    /**
     * Fast-fail guard: only Client-role users may submit edits.
     * The status gate (ticket must be 'New') is enforced in the controller
     * via Gate::authorize('edit', $ticket) → TicketPolicy::edit().
     */
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Client;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'min:10', 'max:10000'],
            'priority'    => ['sometimes', 'string', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Le titre du ticket est obligatoire.',
            'title.max'            => 'Le titre ne peut pas dépasser 255 caractères.',
            'description.required' => 'La description est obligatoire.',
            'description.min'      => 'La description doit contenir au moins 10 caractères.',
            'description.max'      => 'La description ne peut pas dépasser 10 000 caractères.',
            'priority.in'          => 'La priorité doit être : Low, Medium, High ou Critical.',
        ];
    }
}
