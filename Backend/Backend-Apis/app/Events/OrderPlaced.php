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

    /**
     * Create a new event instance.
     *
     * @param  Order  $order
     * @return void
     */
    public function __construct(Order $order, $businessId)
    {
        $this->order = $order;
        $this->user = $order->user;
        $this->orderItems = $order->items()->with('product')->get();
        $this->businessId = $businessId; // Pass the business ID
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
                'order' => $this->order,
                'items' => $this->orderItems,
            ],
        ];
    }
}
