import { useQuery } from '@tanstack/react-query';
import { getMyRiderApplication } from './riderApplication.service';

export function useMyRiderApplication() {
    return useQuery({
        queryKey: ['riderApplication', 'me'],
        queryFn: getMyRiderApplication,
    });
}
