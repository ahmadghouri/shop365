<?php

namespace App\Http\Controllers;

use App\Models\Perscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\ImageService;

class PerscriptionController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate nested prescription data
        $request->validate([
            'product.prescription.prescription_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'product.prescription.prescription_description' => 'required'
        ]);

        // Get authenticated user ID (Sanctum/Session example)
        $userId = auth()->id();

        // Handle file upload from nested key
        $imagePath = $this->imageService->uploadImage($request, 'product.prescription.prescription_image');

        // Create prescription with product relationship
        $prescription = Perscription::create([
            'user_id' => $userId,
            'image_url' => $imagePath,
            'description' => $request->input('product.prescription.prescription_description')
        ]);

        return response()->json($prescription, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Perscription $perscription)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Perscription $perscription)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Perscription $perscription)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Perscription $perscription)
    {
        //
    }
}
