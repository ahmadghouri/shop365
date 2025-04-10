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
        try {
            $request->validate([
                'product.prescription.prescription_description' => 'required',
                'product.prescription.prescription_image' => 'required|image|mimes:jpeg,jpg,png,gif,heic,heif',
            ]);

            $userId = auth()->id();

            $imagePath = $this->imageService->uploadImage($request, 'product.prescription.prescription_image');
            
            $prescription = Perscription::create([
                'user_id' => $userId,
                'description' => $request->input('product.prescription.prescription_description'),
                'image_url' => $imagePath
            ]);

            return response()->json($prescription, 201);
        } catch (\Exception $e) {
            // Return a JSON response with the exception message
            return $this->errorResponse($e->getMessage(), 400);
        }
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
