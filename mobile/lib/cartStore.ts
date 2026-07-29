import { create } from 'zustand';

export type CartExtra = {
    id: string;
    name: string;
    price: number;
};

export type CartItem = {
    id: string;
    name: string;
    store: string;
    price: number;
    quantity: number;
    image?: any;
    imageUri?: string;
    extras: CartExtra[];
};

type CartState = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    removeExtra: (itemId: string, extraId: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTotal: () => number;
};

const DELIVERY_FEE = 150;

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (newItem) => {
        set((state) => {
            // Check if same product with same extras already in cart
            const existingIndex = state.items.findIndex(
                (item) =>
                    item.id === newItem.id &&
                    JSON.stringify(item.extras.map((e) => e.id).sort()) ===
                    JSON.stringify((newItem.extras || []).map((e) => e.id).sort())
            );

            if (existingIndex >= 0) {
                // Increase quantity
                const updated = [...state.items];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + (newItem.quantity || 1),
                };
                return { items: updated };
            }

            // Add new item
            return {
                items: [
                    ...state.items,
                    { ...newItem, quantity: newItem.quantity || 1, extras: newItem.extras || [] },
                ],
            };
        });
    },

    removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    },

    updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
            ),
        }));
    },

    removeExtra: (itemId, extraId) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === itemId
                    ? { ...item, extras: item.extras.filter((e) => e.id !== extraId) }
                    : item
            ),
        }));
    },

    clearCart: () => set({ items: [] }),

    getSubtotal: () => {
        return get().items.reduce((sum, item) => {
            const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
            return sum + (item.price + extrasTotal) * item.quantity;
        }, 0);
    },

    getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
    },
}));

export const DELIVERY_FEE_AMOUNT = DELIVERY_FEE;
