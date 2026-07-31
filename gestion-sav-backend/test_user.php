<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = \App\Models\User::where('role', 'Admin')->first();
\Illuminate\Support\Facades\Auth::login($u);

$req = \Illuminate\Http\Request::create('/api/user', 'GET');
$resource = new \App\Http\Resources\UserResource($u);
echo json_encode($resource->toArray($req));
