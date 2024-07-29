<?php

namespace App\Services;

use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserService
{
    public function register(array $data)
    {
        DB::beginTransaction();
    
        try {
            // Here, we handle only phone_no and password. Additional details are handled later.
            $user = new User();
            $user->phone_no = $data['phone_no'];
            $user->password = Hash::make($data['password']);
            $user->save();
    
            DB::commit();
            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    

    
    

    public function login(array $credentials){

        $user = User::where('phone_no', $credentials['phone_no'])->first();

        if(!$user || !Hash::check($credentials['password'], $user->password)){
            return null;
        }

        return $user;
    }



    public function adminLogin(array $credentials) {
        
    
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                $token = $user->createToken('authToken')->plainTextToken;
                return response()->json(['token' => $token], 200);
            } else {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
    
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    
}