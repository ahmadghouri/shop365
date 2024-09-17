<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;

class AdminService
{
    public function createAdmin(array $data) 
    {

    
        $business = Business::where("name", $data["business"])->first();

        

        if(!$business){
            throw new Exception("Business not found");
        }

        $town_admin = new User();
        $town_admin->name = $data["name"];
        $town_admin->phone_no = $data["phone_no"];
        $town_admin->password = $data["password"];
        $town_admin->role = User::ROLE_ADMIN;
        $town_admin->business_id = $business->id;
        $town_admin->save();

        return $town_admin;
    }


    
}