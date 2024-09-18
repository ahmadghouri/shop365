<?php

namespace App\Services;

use App\Models\Business;
use App\Models\Household;
use App\Models\Product;
use App\Models\Town;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use InvalidArgumentException;

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


    public function stats($filter)
    {
        $startDate = null;
        $endDate = Carbon::now();
    
    
        switch ($filter) {
            case 'today':
                $startDate = Carbon::now()->subDay();
                break;
            case 'week':
                $startDate = Carbon::now()->subWeek();
                break;
            case 'month':
                $startDate = Carbon::now()->subMonth();
                break;
            case 'all':
                break;
            default:
                throw new InvalidArgumentException('Invalid Filter value');
        }
    
        
        $businessStats = Business::join('products', 'businesses.id', '=', 'products.business_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->select('businesses.id', 'businesses.name',
                DB::raw('COUNT(order_items.id) as total_orders'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('businesses.id', 'businesses.name');
    
       
        if ($startDate) {
            $businessStats->whereBetween('order_items.created_at', [$startDate, $endDate]);
        }
    

        return $businessStats->get();
    }
    

}