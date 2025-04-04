<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Town;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Towns
        $towns = [
            ['town_name' => 'Haroonabad'],
        ];

        foreach ($towns as $town) {
            Town::create($town);
        }

        // Create Admin User
        User::create([
            'name' => 'System Admin',
            'phone_no' => '11111111111',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'town_id' => 1
        ]);

        // Create Businesses
        $businesses = [
            [
                'name' => 'Desire',
                'type' => 'fast_food',
                'opening_time' => '10:00:00',
                'closing_time' => '23:00:00',
                'image' => 'https://placehold.co/100x100?text=Desire'
            ],
            [
                'name' => 'Burger King',
                'type' => 'fast_food',
                'opening_time' => '10:00:00',
                'closing_time' => '23:00:00',
                'image' => 'https://placehold.co/100x100?text=Burger+king'
            ],
            [
                'name' => 'National Pharmacy',
                'type' => 'health',
                'opening_time' => '10:00:00',
                'closing_time' => '23:00:00',
                'image' => 'https://lh3.googleusercontent.com/p/AF1QipNDKvH1Z-wuvp_wEy-OrQpXe-aT4a1xTzmcIfJw=s1360-w1360-h1020'
            ]
        ];

        foreach ($businesses as $business) {
            Business::create($business);
        }

        // Create Restaurant Admins
        foreach (Business::all() as $business) {
            User::create([
                'name' => 'Restaurant Admin ' . $business->name,
                'phone_no' => $business->id . '2222222222',
                'password' => Hash::make('password'),
                'role' => 'restaurant_admin',
                'business_id' => $business->id,
                'town_id' => 1
            ]);
        }

        // Create Products for each business
        $products = [
            1 => [
                [
                    'title' => 'Margherita Pizza',
                    'description' => 'Classic Italian pizza',
                    'type' => 'pizza',
                    'price' => '1000',
                    'image' => 'https://placehold.co/100x100?text=Classic Italian pizza'
                ],
                [
                    'title' => 'Pepperoni Pizza small',
                    'description' => 'Spicy pepperoni pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy pepperoni pizza'
                ],
                [
                    'title' => 'Pepperoni Pizza medium',
                    'description' => 'Spicy pepperoni pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy pepperoni pizza'
                ],
                [
                    'title' => 'Pepperoni Pizza large',
                    'description' => 'Spicy pepperoni pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy pepperoni pizza'
                ],
                [
                    'title' => 'Pepperoni Pizza extra large',
                    'description' => 'Spicy pepperoni pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy pepperoni pizza'
                ],
                [
                    'title' => 'Lazania Pizza small',
                    'description' => 'Spicy Lazania Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy Lazania Pizza'
                ],
                [
                    'title' => 'Lazania Pizza medium',
                    'description' => 'Spicy Lazania Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy Lazania Pizza'
                ],
                [
                    'title' => 'Lazania Pizza large',
                    'description' => 'Spicy Lazania Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy Lazania Pizza'
                ],
                [
                    'title' => 'Lazania Pizza extra large',
                    'description' => 'Spicy Lazania Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy Lazania Pizza'
                ],
                [
                    'title' => 'New York Style Crust Filled Pizza small',
                    'description' => 'Spicy New York Style Crust Filled Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza'
                ],
                [
                    'title' => 'New York Style Crust Filled Pizza medium',
                    'description' => 'Spicy New York Style Crust Filled Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza'
                ],
                [
                    'title' => 'New York Style Crust Filled Pizza large',
                    'description' => 'Spicy New York Style Crust Filled Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza'
                ],
                [
                    'title' => 'New York Style Crust Filled Pizza extra large',
                    'description' => 'Spicy New York Style Crust Filled Pizza',
                    'type' => 'pizza',
                    'price' => '1400',
                    'image' => 'https://placehold.co/100x100?text=Spicy New York Style Crust Filled Pizza'
                ],
            ],
            2 => [
                [
                    'title' => 'Classic Burger',
                    'description' => 'Juicy beef burger',
                    'type' => 'burger',
                    'price' => '350',
                    'image' => 'https://placehold.co/100x100?text=Juicy beef burger'
                ],
                [
                    'title' => 'Chicken Burger',
                    'description' => 'Grilled chicken burger',
                    'type' => 'burger',
                    'price' => '350',
                    'image' => 'https://placehold.co/100x100?text=Grilled chicken burger'
                ]
            ],
            3 => [
                [
                    'title' => 'Prescription',
                    'description' => 'Upload your doctors prescription',
                    'type' => 'prescription',
                    'price' => '0',
                    'image' => 'https://cdn-icons-png.flaticon.com/512/898/898671.png'
                ],
                [
                    'title' => 'Panadol',
                    'description' => 'Pain killer tablet',
                    'type' => 'medicine',
                    'price' => '500',
                    'image' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtCFBhGlUNA4Y8Wy8ZatSK7aYzHMrBhFycAQ&s'
                ]
            ]
        ];

        foreach ($products as $business_id => $businessProducts) {
            foreach ($businessProducts as $product) {
                Product::create([
                    'business_id' => $business_id,
                    ...$product
                ]);
            }
        }

        // Create End Users
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => 'Customer ' . $i,
                'phone_no' => $i . '3333333333',
                'password' => Hash::make('password'),
                'role' => 'end_user',
                'town_id' => 1
            ]);
        }
    }
}