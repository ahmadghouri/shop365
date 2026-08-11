import type { MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';

export function cardTotal(card: MonthlyGroceryCard) {
    return card.items.reduce((sum, item) => {
        const product = item.product_id;
        return sum + Number(product?.final_price ?? product?.price ?? 0) * item.quantity;
    }, 0);
}
