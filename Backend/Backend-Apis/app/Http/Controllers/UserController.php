<?php

namespace App\Http\Controllers;

use App\Models\Household;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{


    public function refreshUser()
    {
        $user = Auth::user();
    
        if ($user) {
            return response()->json([
                'user' => $user,
            ], 200);
        }
        return response()->json(['message' => 'User not authenticated'], 401);
    }
    
    public function index()
    {
        $totalUsers = User::where('role', 'end_user')->count();

        $todaysUser = User::where('role', 'end_user')->whereDate('created_at', Carbon::today())->count();
        $users = User::where('role', 'end_user')
        ->with(['household.town']) 
        ->withCount(['orders']) 
        ->get();

        

        return response()->json([
            'total_users_count' => $totalUsers,
            'today_users_count' => $todaysUser,
            'users' => $users
        ]);
    }
    
    public function usersRegisteredToday()
    {
        // Get today's date
        $today = Carbon::today();
    
        // Count users registered today
        $todaysUserCount = User::where('role', 'end_user')
            ->whereDate('created_at', $today)
            ->count();
    
        // Retrieve the users who registered today
        $usersRegisteredToday = User::where('role', 'end_user')
            ->whereDate('created_at', $today)
            ->with(['household.town'])
            ->withCount(['orders'])
            ->get();
    
        return response()->json([
            'today_users_count' => $todaysUserCount,
            'users' => $usersRegisteredToday
        ]);
    }
    
    

    // Get a specific user
    public function show($id)
    {
        $user = User::find($id);
        return response()->json($user);
    }

    // Update a specific user
    // public function update(Request $request, $id)
    // {
    //     $user = User::find($id);

    //     if($request->has('address'))
    //     {
    //         $houseHold = Household::firstOrCreate(['address' => $request->address],['town_id' => 10]);
    //     }
    //     $user->update($request->all());
    //     return response()->json($user);
    // }


    public function update(Request $request, $id)
    {
        // Validate request
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone_no' => 'sometimes|string|max:15',
            'address' => 'sometimes|string|max:255', 
            'town' => 'sometimes|string|max:255'
        ]);

        // Find the user
        $user = User::findOrFail($id);

    
        $user->update($request->only(['name', 'phone_no']));

        if ($request->has('address')) {
            $household = Household::find($user->household_id);

            if (!$household) {
                $household = new Household();
                $household->town_id = 1; 
            }

            $household->address = $request->address;
            $household->save();

            $user->household_id = $household->id;
            $user->save();
        }

        return response()->json([
            'message' => 'User and address updated successfully',
            'user' => $user,
        ]);
    }

    // Delete a specific user
    public function destroy($id)
    {
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    $user->cart()->delete(); 
    $user->orders()->delete();
    $user->delete();
    return response()->json(['message' => 'User deleted successfully']);
    }


    public function deleteUsers() 
    {
        $appLaunchDate = '2024-09-30 15:26:29';

        User::where('role', 'end_user')->where('created_at', '<', $appLaunchDate)->delete();
        return response()->json(['message' => 'End user accounts deleted successfully.']);
    }
}
