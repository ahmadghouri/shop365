<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $order;
    public $user;
    public $orderItems;
    public $businessId;
    public $orderData;

    /**
     * Create a new event instance.
     *
     * @param  Order  $order
     * @return void
     */
    public function __construct(Order $order, $businessId)
    {
        // $this->order = $order->load('user.household.town');
        // $this->user = $order->user;
        // $this->orderItems = $order->items()->with('product')->get();

        // for address
        $order->load('user.household.town');
        
        $this->orderData = [
            'id' => $order->id,
            'name' => $order->user->name,
            'phone_no' => $order->user->phone_no,
            'status' => $order->status,
            'totalPrice' => $order->total_price,
            'createdAt' => $order->created_at->timezone('Asia/Karachi')->toDateTimeString(),
            // Combine the address data into an array
            'address' => [
                'household' => $order->user->household->address ?? null, // Household address field
                'town' => $order->user->household->town->town_name ?? null, // Town name
                'fullAddress' => $order->user->household->address . ', ' . $order->user->household->town->name ?? null, // Full address combining both
            ],
        ];
        $this->businessId = $businessId; 
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('order-channel.'.$this->businessId);
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'businessId' => $this->businessId,
            'mergedData' => [
                'order' => $this->orderData,
            ]
        ];
    }
}
