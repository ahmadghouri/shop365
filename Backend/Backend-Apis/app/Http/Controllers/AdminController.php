<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\CreateAdminRequest;
use App\Models\User;
use App\Services\AdminService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    protected $adminService;

    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
    }

    public function createTownAdmin(CreateAdminRequest $request): JsonResponse
    {
        try {
            $town_admin = $this->adminService->createAdmin($request->validated());
            return $this->successResponse($town_admin, 'New Restaurant admin created');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function updateAdmin($id, Request $request) 
    {
        $admin = User::find($id);

        if(!$admin) {
            return response()->json(['error' => 'Admin not found'], 404);
        }

        if($request->has('name')) {
            $admin->name = $request->input('name');
        }

        if ($request->has('phone_no')) {
            $admin->phone_no = $request->input('phone_no');
        }

        $admin->save();

        return response()->json(['message' => 'Admin updated successfully', 'admin' => $admin]);
    }

    public function getAdmins()
    {
        $admins = User::where('role', 'restaurant_admin')
                      ->join('businesses', 'users.business_id', '=', 'businesses.id')
                      ->select('users.id', 'users.name', 'users.phone_no', 'users.created_at', 'businesses.name as business_name')
                      ->get();
    
        if ($admins) {
            return $this->successResponse($admins);
        }
    
        return $this->errorResponse();
    }
    
}
