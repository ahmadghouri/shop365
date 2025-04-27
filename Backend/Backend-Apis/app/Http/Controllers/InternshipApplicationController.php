<?php

namespace App\Http\Controllers;

use App\Models\InternshipApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InternshipApplicationController extends Controller
{
    // Store internship application
    public function store(Request $request)
    {
       try {
            // Log::info('❤ Internship application request: ', $request->all());
            $validated = $request->validate([
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'portfolio_url' => 'nullable|url|max:255',
                'academic_info' => 'nullable|string|max:255',
            ]);

            InternshipApplication::create($validated);

            // Send a success response
            return response()->json(['message' => 'Application submitted successfully!'], 201);
       } catch (\Exception $e) {
            Log::error('💥 Error storing internship application:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Something went wrong while submitting your application. Please try again later.',
            ], 500);
       }
    }

    // Get all internship applications
    public function index(Request $request)
    {
        try {
            $applications = InternshipApplication::get();

            return response()->json($applications);
        } catch (\Exception $e) {
            Log::error('💥 Error fetching internship applications:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Something went wrong while fetching the applications.',
            ], 500);
        }
    }
}
