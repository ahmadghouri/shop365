<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Modify this if you need to add authorization logic
    }

    public function rules()
    {
        return [
            'status' => 'required|string|in:pending,preparing,delivered',
        ];
    }
}
