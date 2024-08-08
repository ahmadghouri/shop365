<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ForgotPassword extends Controller
{
    public function updatePassword(Request $request) {
        $request->validate([
            'phone_no' => 'required|string',
            'password' => 'required|string|min:4'
        ]);

        $user = User::where('phone_no', $request->phone_no)->first();

        if(!$user) {
            return $this->errorResponse("User does not exist");
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return $this->successResponse([], "Password Updated");
    }
}
