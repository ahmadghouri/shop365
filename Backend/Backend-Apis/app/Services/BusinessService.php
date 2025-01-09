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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use InvalidArgumentException;

class BusinessService
{

    public function store(array $data)
    {
        if (!empty($data['parent_id'])) {
            $parentBusiness = Business::find($data['parent_id']);
            if (!$parentBusiness) {
                throw new \Exception("Parent business not found.");
            }
        }

        $business = new Business();
        $business->type = $data['type'];
        $business->name = $data['name'];
        $business->opening_time = $data['opening_time'];
        $business->closing_time = $data['closing_time'];
        $business->parent_id = $data['parent_id'] ?? null; 
        $business->save();

        return $business;
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $business = Business::findOrFail($id);

            $products = Product::withTrashed()->where('business_id', $id)->get();
            if ($products->isNotEmpty()) {
                $products->each->forceDelete(); 
            }

            $users = User::where('business_id', $id)->get();
            if ($users->isNotEmpty()) {
                $users->each->forceDelete();
            }

            if ($business->image) {
                $imagePath = public_path($business->image);
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                }
            }

            $business->delete(); 

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error deleting business: ' . $e->getMessage());
            throw new Exception('Error deleting business: ' . $e->getMessage());
        }
    }
    
    
    
    


    public function stats($filter)
    {
        $startDate = null;
        $endDate = Carbon::now('Asia/Karachi');
    
    
        switch ($filter) {
            case 'today':
                $startDate = Carbon::now('Asia/Karachi')->subDay();
                break;
            case 'week':
                $startDate = Carbon::now('Asia/Karachi')->subWeek();
                break;
            case 'month':
                $startDate = Carbon::now('Asia/Karachi')->subMonth();
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