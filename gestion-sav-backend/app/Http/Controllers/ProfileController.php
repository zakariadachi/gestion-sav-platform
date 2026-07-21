<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AttachmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request, AttachmentService $attachmentService): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user      = auth()->user();
        $validated = $request->validated();

        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->company = $validated['company'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            // Delete the old avatar from storage before uploading the new one
            if ($user->avatar) {
                $attachmentService->delete($user->avatar);
            }

            $user->avatar = $attachmentService->upload($request->file('avatar'), 'avatars');
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => new UserResource($user),
        ]);
    }
}
