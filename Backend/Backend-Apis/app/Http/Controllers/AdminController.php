<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\CreateAdminRequest;
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
            return $this->successResponse($town_admin, "New Restaurant admin created");

        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(),400);
        }

    }
}
