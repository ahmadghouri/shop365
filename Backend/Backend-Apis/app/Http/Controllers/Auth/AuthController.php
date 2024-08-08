<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Household;
use App\Models\Town;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\userService;
use Exception;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(userService $authService)
    {
        $this->authService = $authService;
        
    }

    public function register(RegisterRequest $request)
{
    try {
        $user = $this->authService->register($request->only('phone_no', 'password')); 
        $token = $user->createToken('mytoken')->plainTextToken;

        return $this->successResponse($user, "Registered Successfull", 200, $token);
    } catch (Exception $e) {
        if ($e->getMessage() === "Town not found") {
            return $this->errorResponse("Town not found", 404);
        }

        return $this->errorResponse($e->getMessage(), 400);
    }
}



    public function login(LoginRequest $request){

        $user = $this->authService->login($request->validated());

        if(!$user){
           return $this->errorResponse("Invalid credentials", 401);
        }

        $token = $user->createToken('mytoken')->plainTextToken;

        return $this->successResponse($user->load('notifications'), "Login Successfull", 200, $token);
    }

    public function addDetails(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'town' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);
    
        try {
            $user = auth()->user();
            $town = Town::where('town_name', $request->town)->first();
    
            if (!$town) {
                return $this->errorResponse("Town not found", 404);
            }
    
            $household = Household::firstOrCreate(
                ['address' => $request->address],
                ['town_id' => $town->id]
            );
    
            $user->name = $request->name;
            $user->household_id = $household->id;
            $user->town_id = $town->id;
            $user->save();
    
            return $this->successResponse($user, "Details updated successfully", 200);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function profile() {
        $user = auth()->user();
        $household_id = $user->household_id;
        $town_id = $user->town_id;
    
        // Load related household and town data conditionally
        if ($household_id) {
            $household = Household::where('id', $household_id)->first();
        }
    
        if ($town_id) {
            $town = Town::where('id', $town_id)->first();
        }

        if($household_id && $town_id){
            $response = [
                'user' => $user,
                'household' => $household,
                'town' => $town,
            ];
        } else {
            $response = [
                'user' => $user,
            ];
        }
    
       

        return $this->successResponse($response, "User Profile", 200);
    }
    
    
}
