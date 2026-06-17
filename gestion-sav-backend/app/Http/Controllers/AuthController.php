<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user           = new User();
        $user->name     = $request->name;
        $user->email    = $request->email;
        $user->password = Hash::make($request->password);
        $user->role     = UserRole::Client;
        $user->status   = 'Active';
        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Account created successfully.',
            'user'    => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Les identifiants sont incorrects.',
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->status === 'Inactive') {
            Auth::logout();
            return response()->json([
                'message' => 'Votre compte a été désactivé. Veuillez contacter l\'administration.',
            ], 403);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Connexion réussie',
            'user'    => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
