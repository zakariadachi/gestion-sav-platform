<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    /**
     * Authorization is enforced by ArticlePolicy::create via Gate::authorize
     * in the controller. The Form Request authorize() acts as a fast-fail
     * guard: only Admin users may reach the validation stage.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === \App\Enums\UserRole::Admin;
    }

    public function rules(): array
    {
        return [
            'title'    => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'desc'     => ['nullable', 'string', 'max:500'],
            'content'  => ['required', 'string', 'max:50000'],
            'icon'     => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'   => 'Le titre de l\'article est obligatoire.',
            'title.max'        => 'Le titre ne peut pas dépasser 255 caractères.',
            'category.required' => 'La catégorie est obligatoire.',
            'category.max'     => 'La catégorie ne peut pas dépasser 100 caractères.',
            'desc.max'         => 'La description courte ne peut pas dépasser 500 caractères.',
            'content.required' => 'Le contenu de l\'article est obligatoire.',
            'content.max'      => 'Le contenu ne peut pas dépasser 50 000 caractères.',
            'icon.max'         => 'Le nom de l\'icône ne peut pas dépasser 50 caractères.',
        ];
    }
}
