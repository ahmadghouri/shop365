import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAddresses, createAddress, activateAddress, deleteAddress, updateAddress, type AddressPayload } from './address.service';
import { monthlyGroceryKeys } from '@/api/monthly-grocery/useMonthlyGroceryQueries';

const KEY = ['addresses'];

export function useAddresses() {
  return useQuery({ queryKey: KEY, queryFn: getAddresses });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddressPayload) => createAddress(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useActivateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) => updateAddress(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: monthlyGroceryKeys.all });
    },
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
