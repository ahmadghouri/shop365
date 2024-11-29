<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GroceryProductController extends Controller
{
    public function storeGroceryProducts()
    {
        // Make the API request
        $response = Http::withHeaders([
            'ConStr' => 'ConStr2', // Your custom header
        ])->timeout(600)
        ->withoutVerifying()
        ->post('https://cyberneticonline.com/webapi/api/product/getProductList', [
            'mode' => '0',
            'locno' => '1',
            'deptId' => '0',
            'groupId' => '0',
            'subgroupId' => '0',
            'brandId' => '0',
            'catId' => '0',
            'designId' => '0',
            'colorId' => '0',
            'sizeId' => '0',
            'makeId' => '0',
            'suppId' => '',
            'bDefault' => '0',
            'query' => '',
            'offset' => '0',
            'pagesize' => '10000', // Or use a larger number as needed
        ]);

        if ($response->successful()) {
            $products = $response->json();

            foreach ($products as $product) {
                $productName = trim($product['ITEM_DESC'] .' - ' . $product['PACK_DESC']);
    
                $existingProduct = Product::where('title', $productName)->first();

                if ($existingProduct) {
                        $existingProduct->title = $productName;
                        $existingProduct->description = $product['ITEM_DESC_LONG'] .' - ' . $product['PACK_DESC'];
                        $existingProduct->price = $product['UNIT_PRICE'];
                        $existingProduct->save();
                } else {
                    Product::create([
                        'title' => $productName,
                        'description' => $product['ITEM_DESC_LONG'] . ' - ' . $product['PACK_DESC'],
                        'image' => null,
                        'price' => $product['UNIT_PRICE'],
                        'business_id' => 6,
                        'type' => 'grocery',
                    ]);
                }
            }

            return response()->json(['message' => 'Products imported successfully, avoiding duplicates.'], 200);
        } else {
            return response()->json(['message' => 'Failed to fetch products from API.'], 500);
        }
    }
}
