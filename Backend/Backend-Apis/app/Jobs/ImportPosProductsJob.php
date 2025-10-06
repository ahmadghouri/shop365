<?php

namespace App\Jobs;

use App\Models\PosProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportPosProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $locno;

    /**
     * Create a new job instance.
     */
    public function __construct(int $locno)
    {
        $this->locno = $locno;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $url = config('services.pos_products.url'); // put your API url in config/services.php
        $pageSize = 500;
        $offset = 0;

        do {
            $response = Http::withHeaders([
                'ConStr' => 'ConStr2',
                'Content-Type' => 'application/json',
            ])->post($url, [
                "mode" => "0",
                "locno" => (string)$this->locno,
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
                "offset" => $offset,
                "pagesize" => $pageSize,
            ])->json();

            if (!$response || empty($response)) {
                break;
            }

            $rows = [];
            foreach ($response as $item) {
                $rows[] = [
                    'item_code' => $item['ITEM_CODE'],
                    'bar_code' => $item['BAR_CODE'] ?? '',
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
                    'locno' => $this->locno,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk upsert
            PosProduct::upsert(
                $rows,
                ['item_code', 'locno'], // unique keys
                [
                    'bar_code','name','description','department','group','supplier',
                    'brand','price','discount_price','cost','quantity',
                    'is_available','uom','pack_desc','image_path','thumbnail_path',
                    'updated_at'
                ]
            );

            $count = count($rows);
            $offset += $pageSize;

        } while ($count === $pageSize);
    }
}