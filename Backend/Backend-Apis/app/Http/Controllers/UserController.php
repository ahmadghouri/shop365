<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    
    public function index()
    {
        $order_count = 0;
        $users = User::where('role', 'end_user')
        ->with(['household.town']) 
        ->withCount(['orders']) 
        ->get();

        

        return response()->json($users);
    }

    // Get a specific user
    public function show($id)
    {
        $user = User::find($id);
        return response()->json($user);
    }

    // Update a specific user
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        $user->update($request->all());
        return response()->json($user);
    }

    // Delete a specific user
    public function destroy($id)
    {
        $user = User::find($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
