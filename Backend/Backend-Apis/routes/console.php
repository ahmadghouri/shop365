<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

$schedule = app(Schedule::class)
    ->command('backup:send')
    ->weeklyOn(6, '08:00')
    ->timezone('Asia/Karachi');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();
