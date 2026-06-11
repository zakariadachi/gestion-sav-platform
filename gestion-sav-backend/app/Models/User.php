<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;

use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'company',
    ];

    protected $appends = ['avatar_url'];

    /**
     * Return the full public URL for the user's avatar.
     *
     * AttachmentService::upload() stores the file as 'avatars/{uuid}.ext'
     * on the 'public' disk and saves that relative path in the avatar column.
     *
     * Storage::disk('public')->url() appends the stored path to the disk's
     * configured base URL (APP_URL/storage), producing the correct URL:
     *   http://localhost:8000/storage/avatars/{uuid}.ext
     *
     * The previous implementation used asset('storage/avatars/' . $this->avatar)
     * which prepended 'avatars/' a second time, producing a broken double-path:
     *   http://localhost:8000/storage/avatars/avatars/{uuid}.ext
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar
            ? Storage::disk('public')->url($this->avatar)
            : null;
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
        ];
    }

    public function clientTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'client_id');
    }

    public function technicianTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'technician_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }
}
