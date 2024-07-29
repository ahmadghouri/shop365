<?php

namespace App\Http\Controllers;

use App\Http\Requests\town\StoreRequest;
use App\Http\Requests\town\UpdateRequest;
use App\Models\Town;
use App\Services\TownService;
use Illuminate\Http\Request;

class TownController extends Controller
{
    protected $townService;

    public function __construct(TownService $townService)
    {
        $this->townService = $townService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $town = Town::all();

        return $this->successResponse($town, "list of towns", 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request)
    {
        $this->townService->store($request->validated());

        return $this->successResponse(null,"Town created successfully",201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Town $town)
    {
        return $this->successResponse($town,"Town Found", 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, Town $town)
    {
        $town->update($request->validated());
        $updated_town = $town->fresh();
        return $this->successResponse($updated_town,"Town updated successfully", 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Town $town)
    {
        $town->delete();
        return $this->successResponse(null,"Deleted successfully", 201);
    }
}
