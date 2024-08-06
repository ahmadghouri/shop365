<?php

namespace App\Services;

use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TownService
{
    public function store(array $data){

        $town = new Town();

        $town->town_name = $data["town_name"];
        $town->save();

        return $town;
    }
}