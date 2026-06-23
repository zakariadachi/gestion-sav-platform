<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRapportRequest extends FormRequest
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
            'contenu'  => ['required', 'string', 'min:10'],
            'photos'   => ['nullable', 'array', 'max:5'],
            'photos.*' => ['image', 'mimes:jpeg,png,jpg', 'max:5120'],
        ];
    }
}
