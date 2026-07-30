import { create } from 'zustand';
import { API_BASE_URL } from '@/api/client';
import {
    addToCart as apiAddToCart,
    getCart as apiGetCart,
    removeCartItem as apiRemoveCartItem,
    updateCartQuantity as apiUpdateCartQuantity,
    clearCart as apiClearCart,
} from '@/api/cart/cart.service';

export type CartExtra = {
    id: string;
    name: string;
    price: number;
};

export type CartVariant = {
    id: string;
    name: string;
    price: number;
};

export type CartItem = {
    id: string;          // backend cart item _id
    productId: string;   // product _id
    name: string;
    store: string;
    price: number;
    quantity: number;
    image?: any;
    imageUri?: string;
    extras: CartExtra[];
    variant?: CartVariant;
};

type CartState = {
    items: CartItem[];
    loading: boolean;
    addItem: (item: {
        productId: string;
        name: string;
        store: string;
        price: number;
        quantity: number;
        image?: any;
        imageUri?: string;
        extras: CartExtra[];
        variant?: CartVariant;
    }) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loadCart: () => Promise<void>;
    getSubtotal: () => number;
    getTotal: () => number;
};

const DELIVERY_FEE = 150;

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,

    addItem: async (newItem) => {
        try {
            await apiAddToCart({
                product_id: newItem.productId,
                quantity: newItem.quantity,
                variant: newItem.variant,
                extras: newItem.extras,
            });
            // Reload cart from backend to get accurate state
            await get().loadCart();
        } catch (error) {
            console.log('Cart addItem error (adding locally):', error);
            // Fallback: add locally if not authenticated or network error
            set((state) => ({
                items: [
                    ...state.items,
                    {
                        id: `local-${Date.now()}`,
                        productId: newItem.productId,
                        name: newItem.name,
                        store: newItem.store,
                        price: newItem.price,
                        quantity: newItem.quantity,
                        image: newItem.image,
                        imageUri: newItem.imageUri,
                        extras: newItem.extras || [],
                        variant: newItem.variant,
                    },
                ],
            }));
        }
    },

    removeItem: async (id) => {
        // Optimistic removal
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        try {
            await apiRemoveCartItem(id);
        } catch (error) {
            console.log('Cart removeItem error:', error);
            // Reload to get real state
            await get().loadCart();
        }
    },

    updateQuantity: async (id, quantity) => {
        if (quantity < 1) return;
        // Optimistic update
        set((state) => ({
            items: state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item,
            ),
        }));
        try {
            await apiUpdateCartQuantity(id, quantity);
        } catch (error) {
            console.log('Cart updateQuantity error:', error);
            await get().loadCart();
        }
    },

    clearCart: async () => {
        set({ items: [] });
        try {
            await apiClearCart();
        } catch (error) {
            console.log('Cart clearCart error:', error);
        }
    },

    loadCart: async () => {
        try {
            set({ loading: true });
            const data = await apiGetCart();
            const cartItems: CartItem[] = (data?.cartItems || []).map((item: any) => {
                const product = item.product_id;
                const business = product?.business_id;
                const rawImage = product?.image_url || product?.image || '';

                let imageUri: string | undefined;
                if (rawImage) {
                    if (/^https?:\/\//.test(rawImage)) {
                        imageUri = rawImage;
                    } else {
                        let path = String(rawImage).replace(/^\/be\/uploads\//, '/uploads/');
                        path = path.replace(/^\/uploads\/uploads\//, '/uploads/');
                        if (!path.startsWith('/')) path = `/uploads/${path}`;
                        imageUri = `${API_BASE_URL}${path}`;
                    }
                }

                return {
                    id: String(item._id || item.id),
                    productId: String(product?._id || product?.id || ''),
                    name: product?.title || 'Product',
                    store: business?.name || '',
                    price: item.variant?.price || product?.final_price || product?.price || 0,
                    quantity: item.quantity || 1,
                    imageUri,
                    extras: (item.extras || []).map((extra: any) => ({
                        id: extra.id || extra._id || extra.name,
                        name: extra.name || '',
                        price: Number(extra.price || 0),
                    })),
                    variant: item.variant ? {
                        id: item.variant.id || '',
                        name: item.variant.name || '',
                        price: Number(item.variant.price || 0),
                    } : undefined,
                };
            });
            set({ items: cartItems, loading: false });
        } catch (error) {
            console.log('Cart loadCart error:', error);
            set({ loading: false });
        }
    },

    getSubtotal: () => {
        return get().items.reduce((sum, item) => {
            const extrasTotal = item.extras.reduce((extraSum, extra) => extraSum + extra.price, 0);
            return sum + (item.price + extrasTotal) * item.quantity;
        }, 0);
    },

    getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
    },
}));

export const DELIVERY_FEE_AMOUNT = DELIVERY_FEE;
