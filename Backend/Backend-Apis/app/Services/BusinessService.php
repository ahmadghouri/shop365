<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Household;
use App\Models\Product;
use App\Models\Town;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BusinessService
{

    public function store(array $data)
    {

        $business = new Business();
        $business->type = $data['type'];
        $business->name = $data['name'];
        $business->opening_time = $data['opening_time'];
        $business->closing_time = $data['closing_time'];
        $business->save();

        return $business;
    }

    public function delete($id) {
        $product = Business::findOrFail($id);

        if($product->image){
            $imagepath = public_path($product->image);
            if(File::exists($imagepath)){
                File::delete($imagepath);
            }
        }
        $product->delete();
    }

}