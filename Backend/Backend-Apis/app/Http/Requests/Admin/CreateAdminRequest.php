<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;

class CreateAdminRequest extends BaseRequest
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
            "name" => 'required|string|max:255',
            "phone_no" => 'required|min:11|max:11',
            "password" => "required|string|min:6",
            "business" => "required|string"
        ];
    }
}
