import { useMutation } from '@tanstack/react-query';
import { submitRiderApplication } from './riderApplication.service';
import type { RiderApplicationPayload } from './riderApplication.service';

export function useSubmitRiderApplication() {
    return useMutation({
        mutationFn: (payload: RiderApplicationPayload) => submitRiderApplication(payload),
    });
}
