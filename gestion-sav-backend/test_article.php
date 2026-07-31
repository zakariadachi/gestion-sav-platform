<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = \App\Models\User::where('role', 'Admin')->first();
\Illuminate\Support\Facades\Auth::login($u);

$res = app(\App\Http\Controllers\ArticleController::class)->show(1);
echo $res->content();
