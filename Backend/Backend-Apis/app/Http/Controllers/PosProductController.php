<?php

namespace App\Http\Controllers;

use App\Models\PosProduct;
use Illuminate\Http\Request;
use App\Jobs\ImportPosProductsJob;

class PosProductController extends Controller
{
    public function index(Request $request)
    {
        $query = PosProduct::query();

        if ($request->has('locno')) {
            $query->where('locno', $request->locno);
        }

        if ($request->sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        }

        if (!is_null($request->max_quantity)) {
            $query->where('quantity', '=', $request->max_quantity);
        }

        return $query->paginate(20);
    }

    public function import(Request $request)
    {
        $locno = $request->input('locno', 0);

        ImportPosProductsJob::dispatch($locno);

        return response()->json([
            'status' => 'queued',
            'message' => 'Product import started. You can check progress soon.'
        ]);
    }
}
