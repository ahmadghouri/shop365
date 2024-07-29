<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ComplainService
{
    public function store(array $data){
        $user = Auth::user();

        
        $complaint = new Complaint();
        $complaint->title = $data["title"];
        $complaint->description = $data["description"];
        $complaint->user_id = $user->id;
        $complaint->household_id = $user->household_id;
        $complaint->town_id = $user->town_id;
        $complaint->status = $data["status"] ?? 'pending';
        $complaint->save();

        return $complaint;
    }
}