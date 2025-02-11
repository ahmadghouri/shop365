<?php

namespace App\Http\Controllers;

use App\Models\HeaderImage;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HeaderImageController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        return HeaderImage::orderBy('order')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|max:5120', // 5MB max
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        try {
            // Upload image using ImageService
            $imagePath = $this->imageService->uploadImage(
                $request,
                'image', // request field name
                uniqid(), // filename
                'header-images/' // upload path
            );

            // Remove the /storage/ prefix from the path if present
            $imagePathForDB = str_replace('/storage/', '', $imagePath);

            $headerImage = HeaderImage::create([
                'title' => $request->title,
                'description' => $request->description,
                'image_path' => $imagePathForDB,
                'order' => $request->order ?? HeaderImage::count(),
                'is_active' => $request->is_active ?? true
            ]);

            return response()->json([
                'message' => 'Image uploaded successfully',
                'data' => $headerImage
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upload image',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show(string $id)
    {
        return HeaderImage::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $headerImage = HeaderImage::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'sometimes|image|max:5120',
            'order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean'
        ]);

        try {
            if ($request->hasFile('image')) {
                // Delete old image
                Storage::disk('public')->delete($headerImage->image_path);

                // Upload new image
                $imagePath = $this->imageService->uploadImage(
                    $request,
                    'image',
                    uniqid(),
                    'header-images/'
                );

                // Remove the /storage/ prefix from the path if present
                $imagePathForDB = str_replace('/storage/', '', $imagePath);
                $headerImage->image_path = $imagePathForDB;
            }

            $headerImage->update($request->except('image'));

            return response()->json([
                'message' => 'Image updated successfully',
                'data' => $headerImage
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update image',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy(string $id)
    {
        $image = HeaderImage::findOrFail($id);
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:header_images,id',
            'orders.*.order' => 'required|integer'
        ]);

        foreach ($request->orders as $item) {
            HeaderImage::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}
