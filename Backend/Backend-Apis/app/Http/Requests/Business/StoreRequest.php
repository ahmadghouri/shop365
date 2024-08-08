<?php

namespace App\Http\Requests\Business;

use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends BaseRequest
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
            "name" => 'required|string|min:5',
            "image" => 'nullable|image|max:2048|mimes:png,jpg,jpeg,svg,gif',
            "type" => 'required|string|max:255',
            "opening_time" => 'required|string',
            "closing_time" => 'required|string',
        ];
    }
}
