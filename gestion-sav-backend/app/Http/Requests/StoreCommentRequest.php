<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    /**
     * Any authenticated user may attempt to post a comment.
     * Ownership of the ticket is enforced in the controller via
     * Gate::authorize('update', $ticket) which delegates to TicketPolicy::update.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'message'    => ['required', 'string', 'min:1', 'max:5000'],
            'attachment' => ['nullable', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.required' => 'Le message ne peut pas être vide.',
            'message.max'      => 'Le message ne peut pas dépasser 5000 caractères.',
            'attachment.mimes' => 'Le fichier joint doit être une image (jpeg, png, jpg) ou un PDF.',
            'attachment.max'   => 'Le fichier joint ne peut pas dépasser 5 Mo.',
        ];
    }
}
