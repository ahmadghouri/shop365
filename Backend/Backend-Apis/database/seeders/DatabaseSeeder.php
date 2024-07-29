<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if(!User::where('role', 'admin')->exists()) {
            User::create([
                'name' => 'Admin',
                'phone_no' => '00000000000',
                'password' => Hash::make('password'), 
                'role' => 'admin',
            ]);
        }
    }
}
