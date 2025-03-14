<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use ZipArchive;

class SendDataBaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:send';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $database_path = database_path('database.sqlite');
        $backup_dir = storage_path('app/database-backup');
        $backup_path = $backup_dir . '/database_backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sqlite';

        if (!file_exists($backup_dir)) {
            mkdir($backup_dir, 0777, true);
        }

        $zip = new ZipArchive();

        if ($zip->open($backup_path, ZipArchive::CREATE) === true) {
            $zip->addFile($database_path, 'database.sqlite');
            $zip->close();
        } else {
            $this->error('Failed to create backup archive!');
            return;
        }

        Mail::send([], [], function ($message) use ($backup_path) {
            $message->from('noreply@yourdomain.com', 'shop365')
                ->to('alihassan113413@gmail.com', 'User')
                ->subject('Database Backup - ' . date('Y-m-d H:i:s'))
                ->text('Please find the attached database backup file.')
                ->attach($backup_path, [
                    'as' => 'database_backup.zip',
                    'mime' => 'application/zip',
                ]);
        });

        unlink($backup_path);
        $this->info('Database backup sent successfully!');
    }
}
