<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class AttachmentService
{
    /**
     * Store the uploaded file in the public disk.
     *
     * @param UploadedFile $file
     * @param string $directory
     * @return string The path to the stored file.
     */
    public function upload(UploadedFile $file, string $directory = 'attachments'): string
    {
        // Generate a clean filename to avoid conflicts and strange characters
        $filename = Str::uuid()->toString() . '.' . $file->extension();
        
        // Store on the 'public' disk inside the given directory
        return $file->storeAs($directory, $filename, 'public');
    }

    /**
     * Delete the file from the public disk.
     *
     * @param string $path
     * @return bool
     */
    public function delete(string $path): bool
    {
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        return false;
    }
}
