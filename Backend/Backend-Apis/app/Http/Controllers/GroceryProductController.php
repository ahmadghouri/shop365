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
            'ConStr' => 'ConStr4', // Your custom header
        ])->timeout(60)->post('https://webapi.cyberneticonline.com/api/product/getProductList', [
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
            'pagesize' => '5000', // Or use a larger number as needed
        ]);

        if ($response->successful()) {
            // Get the product data from the response
            $products = $response->json(); // Assuming the data is in JSON format

            foreach ($products as $product) {
                $existingProduct = Product::where('title', $product['ITEM_DESC'])->where('price', $product['UNIT_PRICE'])->first();

                if ($existingProduct) {
                        $existingProduct->title = $product['ITEM_DESC'] .' - ' . $product['PACK_DESC'];
                        $existingProduct->description = $product['ITEM_DESC_LONG'] .' - ' . $product['PACK_DESC'];
                        $existingProduct->save();
                }
            }

            return response()->json(['message' => 'Products imported successfully, avoiding duplicates.'], 200);
        } else {
            return response()->json(['message' => 'Failed to fetch products from API.'], 500);
        }
    }
}
