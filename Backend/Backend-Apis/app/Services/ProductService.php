<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Product;
use Exception;
use Illuminate\Support\Facades\File;

class ProductService
{
    public function store(array $data)
    {
        $business = Business::where('name', $data['business'])->first();

        if (!$business) {
            throw new Exception("Business not found");
        }

        $product = new Product();
        $product->title = $data['title'];
        $product->description = $data['description'];
        $product->price = $data['price'];
        $product->type = $data['type'];
        $product->business_id = $business->id; 
        $product->save();

        return $product;
    }


    public function delete($id){
        $product = Product::findOrFail($id);

        if($product->image){
            $imagepath = public_path($product->image);
            if(File::exists($imagepath)){
                File::delete($imagepath);
            }
        }

        $product->delete();
    }
}
