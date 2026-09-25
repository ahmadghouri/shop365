import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reuploadRiderDocuments } from './riderApplication.service';

export function useReuploadRiderDocuments() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (images: Partial<Record<string, string>>) => reuploadRiderDocuments(images),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['riderApplication', 'me'] });
        },
    });
}
