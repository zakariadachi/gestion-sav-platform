<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Admin;
    }

    public function rules(): array
    {
        return [
            'name'   => 'required|string|max:255',
            'email'  => 'required|email|unique:users,email',
            'role'   => ['required', Rule::enum(UserRole::class)],
            'status' => 'required|in:Active,Inactive',
            'phone'  => 'nullable|string|max:20',
            'company'=> 'nullable|string|max:100',
        ];
    }
}
