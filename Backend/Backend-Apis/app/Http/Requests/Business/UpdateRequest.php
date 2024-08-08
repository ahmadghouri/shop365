<?php

namespace App\Http\Requests\Business;

use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "name" => 'nullable|string|min:5',
            "image" => 'nullable|image|max:2048',
            "type" => 'nullable|string|max:255',
            "opening_time" => 'nullable|string',
            "closing_time" => 'nullable|string',
        ];
    }
}
