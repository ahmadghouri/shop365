<?php

namespace App\Services;

use App\Models\PosProduct;
use Illuminate\Support\Facades\Http;

class PosProductImporter
{
    protected string $url = "https://webapi.cyberneticonline.com/api/product/getProductList";

    public function fetchProducts(int $locno = 0): array
    {
        $response = Http::withHeaders([
            'ConStr' => 'ConStr2',
            'Content-Type' => 'application/json',
        ])->post($this->url, [
            "mode" => "0",
            "locno" => (string)$locno, // 0 = shop, 1 = warehouse
            "deptId" => "0",
            "groupId" => "0",
            "subgroupId" => "0",
            "brandId" => "0",
            "catId" => "0",
            "designId" => "0",
            "colorId" => "0",
            "sizeId" => "0",
            "makeId" => "0",
            "suppId" => "",
            "bDefault" => "0",
            "query" => "",
            "offset" => "0",
            "pagesize" => "10000"
        ]);

        return $response->json() ?? [];
    }

    public function import(int $locno = 0)
    {
        $products = $this->fetchProducts($locno);

        foreach ($products as $item) {
            PosProduct::updateOrCreate(
                [
                    'item_code' => $item['ITEM_CODE'],
                    'bar_code' => $item['BAR_CODE'],
                    'locno' => $locno,
                ],
                [
                    'name' => $item['ITEM_DESC'],
                    'description' => $item['ITEM_DESC_LONG'],
                    'department' => $item['DEPT_NAME'],
                    'group' => $item['GRNAME'],
                    'supplier' => $item['SUPP_NAME'],
                    'brand' => $item['BRAND_DESC'],
                    'price' => $item['UNIT_PRICE'],
                    'discount_price' => $item['DISC_PRICE'],
                    'cost' => $item['AVG_COST'],
                    'quantity' => $item['QTY'],
                    'is_available' => $item['IsAvailable'],
                    'uom' => $item['UOM'],
                    'pack_desc' => $item['PACK_DESC'],
                    'image_path' => $item['IMAGE_PATH'],
                    'thumbnail_path' => $item['THUMBNAIL_PATH'],
                ]
            );
        }

        return count($products);
    }
}