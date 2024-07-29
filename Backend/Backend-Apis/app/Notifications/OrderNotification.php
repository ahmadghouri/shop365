<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

     public $title = "";
     public $order = [];
    public function __construct($title, $order)
    {
        $this->title = $title;
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['broadcast', 'database'];
    }



    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $notification = [
            'data' => [
                'id' => $notifiable->id,
                'title' => $this->title,
                 'order_id' => $this->order->id
            ]
            ];
    return new BroadcastMessage($notification);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'order_id' => $this->order->id
        ];
    }
}
