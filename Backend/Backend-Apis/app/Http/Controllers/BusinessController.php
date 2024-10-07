    <?php

    namespace App\Http\Controllers;

    use App\Http\Requests\Business\StoreRequest;
    use App\Http\Requests\Business\UpdateRequest;
    use App\Models\Business;
    use App\Services\BusinessService;
    use App\Services\ImageService;
    use Exception;
    use Illuminate\Container\Attributes\DB;
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB as FacadesDB;
    use Illuminate\Support\Facades\File;
    use Illuminate\Support\Str;

    class BusinessController extends Controller
    {
        protected $businessService;
        protected $imageService;

        public function __construct(BusinessService $businessService, ImageService $imageService)
        {
            $this->businessService = $businessService;
            $this->imageService = $imageService;
        }
        /**
         * Display a listing of the resource.
         */
        public function index(): JsonResponse
        {
            $businesses = Business::all();

            return $this->successResponse($businesses, 'All the businesses');
        }

        /**
         * Store a newly created resource in storage.
         */
        public function store(StoreRequest $request): JsonResponse
        {
            $business = $this->businessService->store($request->validated());

            if ($request->has('image')) {
                $imagePath = $this->imageService->uploadImage($request, 'image');
                $business->image = $imagePath;
                $business->save();
            }

            return $this->successResponse($business, 'Business added successfully');
        }

        /**
         * Display the specified resource.
         */
        public function show(Business $business): JsonResponse
        {
            return $this->successResponse($business, 'Business', 201);
        }

        /**
         * Update the specified resource in storage.
         */
        public function update(UpdateRequest $request, Business $business): JsonResponse
        {
            $business->update($request->only(['type', 'name', 'opening_time', 'closing_time','image']));

            if ($request->hasFile('image')) {
                $imagePath = $this->imageService->uploadImage($request, 'image');
                $business->image = $imagePath;
                $business->save();
            }

            return $this->successResponse($business->refresh(), 'Updated');
        }

        /**
         * Remove the specified resource from storage.
         */
        public function destroy($id): JsonResponse
        {
            try {
                $this->businessService->delete($id);
                return $this->successResponse(null, 'Deleted Successfully');
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                return $this->errorResponse('Business not found', 404);
            } catch (\Exception $e) {
                return $this->errorResponse('An error occurred: ' . $e->getMessage(), 500);
            }
        }


    public function getBusinessStats(Request $request)
    {
        try {
           $filter = $request->query('filter', 'all');
           $businessStats = $this->businessService->stats($filter);
           return $this->successResponse($businessStats);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}
