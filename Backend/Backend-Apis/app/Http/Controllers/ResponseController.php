<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ResponseController
{
    protected function successResponse($data, $message = "success", $status = 200, $token = null,) {
        $response = [
            "message" => $message
        ];
    
        if ($token !== null) {
            $response['token'] = $token;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }
    
        return response()->json($response, $status);
    }

    protected function errorResponse($message="Some thing went wrong",$status=400){
        return response()->json([
            "message" => $message,
        ],$status);
    }
}
