<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTechnicienRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Admin;
    }

    public function rules(): array
    {
        return [
            'technician_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::Technician->value),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'technician_id.exists' => 'L\'utilisateur sélectionné n\'est pas un technicien.',
        ];
    }
}
