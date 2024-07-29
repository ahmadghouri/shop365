<?php

namespace App\Http\Controllers;

use App\Http\Requests\complain\StoreRequest;
use App\Http\Requests\complain\UpdateRequest;
use App\Models\Complaint;
use App\Services\ComplainService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComplainController extends Controller
{
    protected $complainService;

    public function __construct(ComplainService $complainService)
    {
        $this->complainService = $complainService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $complaints = Complaint::all();
        return $this->successResponse($complaints,"Your all complaints",200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request):JsonResponse
    {
        try {
            $complain = $this->complainService->store($request->validated());
            return $this->successResponse($complain, "Complaint submitted successfully", 200); 
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Complaint $complain): JsonResponse
    {
        return $this->successResponse($complain,"Complain", 201);
    }

    /**
     * Update the specified resource in storage.(Only for admin to change the status of the complaint)
     */
    public function update(UpdateRequest $request, Complaint $complain): JsonResponse
    {
        $complain->update($request->validated());

        $updated_complain = $complain->refresh();

        return $this->successResponse($updated_complain,"Updated Complain",201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Complaint $complain): JsonResponse
    {
        $complain->delete();
        return $this->successResponse(null,"Deleted Successfully");
    }


    public function complaintsOfTown() 
    {
        $user = Auth::user();

        $comaplints = Complaint::where('town_id', $user->town_id)->get();

        return $this->successResponse($comaplints, "All Complaints of the Town");
    }
}
