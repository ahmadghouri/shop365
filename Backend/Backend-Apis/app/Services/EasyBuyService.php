<?php

namespace App\Services;

use App\Models\EasyBuy;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class EasyBuyService
{
    protected $imageService;

    public function __construct(\App\Services\ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function storeEasyBuy(array $validated, Request $request): EasyBuy
    {
        $payload = is_string($validated['payload'])
            ? $validated['payload']
            : json_encode($validated['payload'], JSON_UNESCAPED_UNICODE);

        $easyBuy = EasyBuy::firstOrCreate([
            'title' => $validated['title'],
            'business_id' => 4,         // 🔁 Replace with 6 in ptoduction
        ], [
            'image' => null,
            'payload' => $payload
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $this->imageService->uploadImage($request, 'image');
            $easyBuy->image = $imagePath;
            $easyBuy->save();
        }

        $this->createEasyBuyProducts($easyBuy);

        return $easyBuy;
    }

    protected function createEasyBuyProducts(EasyBuy $easyBuy): void
    {
        $payload = is_string($easyBuy->payload)
            ? json_decode($easyBuy->payload, true)
            : $easyBuy->payload;

        foreach ($payload as $brand => $sizes) {
            foreach ($sizes as $size => $price) {
                $product = Product::create([
                    'title' => "{$easyBuy->title} {$brand} {$size}",
                    'type' => 'easy_buy',
                    'business_id' => 4,          // 🔁 Replace with 6 in ptoduction
                    'description' => "Easy Buy: {$easyBuy->title} - {$brand} - {$size}",
                    'price' => $price,
                    'image' => $easyBuy->image,
                    'easy_buy_id' => $easyBuy->id,
                ]);
                Log::info('Product Created:', ['product' => $product]);
            }
        }
    }
}
