<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    /**
     * Only Client-role users may create tickets.
     * This mirrors TicketPolicy::create and acts as a fast-fail guard.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Client;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'priority'    => ['sometimes', 'string', 'in:Low,Medium,High,Critical'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Le titre du ticket est obligatoire.',
            'title.max'            => 'Le titre ne peut pas dépasser 255 caractères.',
            'description.required' => 'La description du ticket est obligatoire.',
            'description.max'      => 'La description ne peut pas dépasser 10 000 caractères.',
            'priority.in'          => 'La priorité doit être : Low, Medium, High ou Critical.',
        ];
    }
}
