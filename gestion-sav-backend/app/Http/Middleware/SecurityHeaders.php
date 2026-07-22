<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // الأساسيات اللي كيخدمو فـ اللوكال والبروديكسيون
        $headers = [
            'X-Frame-Options' => 'DENY', // Prevents clickjacking
            'X-Content-Type-Options' => 'nosniff', // Prevents MIME-type sniffing
            'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http: https:; font-src 'self' data:;", // Restricts resource loading sources
        ];

        // HSTS (HTTPS الإجباري) كيخدم غير فـ السيرفور الحقيقي
        if (app()->environment('production')) {
            $headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
        }

        // Apply headers to the response if it supports headers (Symfony Response)
        if (method_exists($response, 'header')) {
            foreach ($headers as $key => $value) {
                $response->header($key, $value);
            }
        } elseif (property_exists($response, 'headers')) {
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }
        }

        return $response;
    }
}