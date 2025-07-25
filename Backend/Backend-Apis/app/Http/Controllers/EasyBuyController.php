<?php

namespace App\Http\Controllers;

use App\Models\EasyBuy;
use Illuminate\Http\Request;

class EasyBuyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $easyBuys = EasyBuy::all();
        return response()->json($easyBuys);
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
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|string|max:255',
            'payload' => 'required',
        ]);

        // For SQLite, we need to manually ensure proper JSON encoding
        $payload = $validated['payload'];
        if (!is_string($payload)) {
            $payload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        }

        $easyBuy = EasyBuy::create([
            'title' => $validated['title'],
            'business_id' => 2,
            'image' => $validated['image'],
            'payload' => $payload
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $easyBuy
        ], 201);

    } catch (\JsonException $e) {
        return response()->json([
            'message' => 'Invalid JSON payload',
            'error' => $e->getMessage()
        ], 400);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Server Error',
            'error' => $e->getMessage(),
        ], 500);
    }
}
    /**
     * Display the specified resource.
     */
    public function show(EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EasyBuy $easyBuy)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EasyBuy $easyBuy)
    {
        //
    }
}
