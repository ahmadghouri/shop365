import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    addMonthlyGroceryItem,
    createMonthlyGroceryCard,
    deleteMonthlyGroceryCard,
    getMonthlyGroceryCard,
    getMonthlyGroceryCards,
    removeMonthlyGroceryItem,
    updateMonthlyGroceryItem,
    type CreateMonthlyGroceryCardPayload,
} from './monthly-grocery.service';

export const monthlyGroceryKeys = {
    all: ['monthly-grocery-cards'] as const,
    detail: (cardId: string) => ['monthly-grocery-cards', cardId] as const,
};

export function useMonthlyGroceryCards() {
    return useQuery({
        queryKey: monthlyGroceryKeys.all,
        queryFn: getMonthlyGroceryCards,
    });
}

export function useMonthlyGroceryCard(cardId: string) {
    return useQuery({
        queryKey: monthlyGroceryKeys.detail(cardId),
        queryFn: () => getMonthlyGroceryCard(cardId),
        enabled: Boolean(cardId),
    });
}

function useRefreshCards() {
    const queryClient = useQueryClient();
    return async (cardId?: string) => {
        await queryClient.invalidateQueries({ queryKey: monthlyGroceryKeys.all });
        if (cardId) {
            await queryClient.invalidateQueries({ queryKey: monthlyGroceryKeys.detail(cardId) });
        }
    };
}

export function useCreateMonthlyGroceryCard() {
    const refresh = useRefreshCards();
    return useMutation({
        mutationFn: (payload: CreateMonthlyGroceryCardPayload) => createMonthlyGroceryCard(payload),
        onSuccess: (card) => refresh(card._id),
    });
}

export function useDeleteMonthlyGroceryCard() {
    const refresh = useRefreshCards();
    return useMutation({
        mutationFn: deleteMonthlyGroceryCard,
        onSuccess: () => refresh(),
    });
}

export function useAddMonthlyGroceryItem() {
    const refresh = useRefreshCards();
    return useMutation({
        mutationFn: ({ cardId, productId, quantity, variant }: { cardId: string; productId: string; quantity: number; variant?: { name: string; price: number } }) =>
            addMonthlyGroceryItem(cardId, productId, quantity, variant),
        onSuccess: (card) => refresh(card._id),
    });
}

export function useUpdateMonthlyGroceryItem() {
    const refresh = useRefreshCards();
    return useMutation({
        mutationFn: ({
            cardId,
            itemId,
            updates,
        }: {
            cardId: string;
            itemId: string;
            updates: { quantity?: number; checked?: boolean };
        }) => updateMonthlyGroceryItem(cardId, itemId, updates),
        onSuccess: (card) => refresh(card._id),
    });
}

export function useRemoveMonthlyGroceryItem() {
    const refresh = useRefreshCards();
    return useMutation({
        mutationFn: ({ cardId, itemId }: { cardId: string; itemId: string }) =>
            removeMonthlyGroceryItem(cardId, itemId),
        onSuccess: (card) => refresh(card._id),
    });
}