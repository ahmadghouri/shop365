<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Container\Attributes\Log;
use Illuminate\Support\Facades\Log as FacadesLog;

class ImageService
{
    public function uploadImage(Request $request, $requestName = 'imageData', $fileName = null, $uploadPath = 'uploads/images/', $fileExtension = null)
    {
        try {
            $image = $request->file($requestName);
            FacadesLog::info('Upload Image Request', ['request' => $request->all()]);

            if ($image) {

                $fileName = $fileName ?? Str::random(10);
                $extension = $fileExtension ?: $image->getClientOriginalExtension();

                // Validate the file
                if (!in_array($extension, ['jpeg', 'jpg', 'png', 'gif'])) {
                    throw new Exception("Invalid file type.");
                }

                $filePath = $fileName . '.' . $extension;

                // Store the image in the specified upload path
                $path = $image->storeAs('public/' . $uploadPath, $filePath);

                return Storage::url($uploadPath . $filePath);
            } else {
                $requestFileData = $request->$requestName;

                // Decode the base64 file
                $file = base64_decode(preg_replace('#^data:([^;]+);base64,#', '', $requestFileData));

                if (empty($file)) {
                    throw new Exception("Invalid file data.");
                }

                $fileName = $fileName ?? Str::random(10);
                $extension = $fileExtension ?: pathinfo(parse_url($requestFileData, PHP_URL_PATH), PATHINFO_EXTENSION);
                $extension = $extension ?: 'png'; // Default to PNG if no extension found

                $filePath = $uploadPath . $fileName . '.' . $extension;

                // Create directory if it doesn't exist
                if (!Storage::exists('public/' . $uploadPath)) {
                    Storage::makeDirectory('public/' . $uploadPath);
                }

                // Store the base64 encoded file
                Storage::put('public/' . $filePath, $file);

                return Storage::url('public/' . $filePath);
            }
        } catch (Exception $e) {
            throw new Exception("Unable to upload image: " . $e->getMessage());
        }
    }
}
