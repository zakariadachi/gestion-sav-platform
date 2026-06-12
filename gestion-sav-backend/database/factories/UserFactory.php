<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'role'              => 'Client',
            'remember_token'    => Str::random(10),
            'phone'             => fake()->phoneNumber(),
            'company'           => fake()->company(),
        ];
    }

    public function configureAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role'    => 'Admin',
            'company' => null,
        ]);
    }

    public function configureTechnicien(): static
    {
        return $this->state(fn (array $attributes) => [
            'role'    => 'Technician',
            'company' => null,
        ]);
    }
}
