<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Admin;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'name'   => 'sometimes|required|string|max:255',
            'email'  => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($userId)],
            'role'   => ['sometimes', 'required', Rule::enum(UserRole::class)],
            'status' => 'sometimes|required|in:Active,Inactive',
            'phone'  => 'nullable|string|max:20',
            'company'=> 'nullable|string|max:100',
        ];
    }
}
