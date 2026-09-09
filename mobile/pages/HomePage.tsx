import { useMemo, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/api/client';
import { AppBackground } from '@/components/AppBackground';
import { useCategories, useRandomProducts, useBusinesses } from '@/api/home/useHomeQueries';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoryList } from '@/components/home/CategoryList';
import { PromoBanner } from '@/components/home/PromoBanner';
import { MonthlyGroceryHomeCard } from '@/components/home/MonthlyGroceryHomeCard';
import { TopSellingProducts } from '@/components/home/TopSellingProducts';

type Category = {
    id: string;
    name: string;
    subtitle: string;
    image?: any;
    imageUri?: string;
};

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    image?: any;
    imageUri?: string;
};

type HomePageProps = {
    onCategoryPress?: (category: Category) => void;
    onProductPress?: (product: Product) => void;
    onCartPress?: () => void;
    onListPress?: () => void;
    onOrdersPress?: () => void;
    onProfilePress?: () => void;
    onScrollChange?: (scrolling: boolean) => void;
    onNotificationPress?: () => void;
};

function backendImageUri(product: any) {
    const value = product?.image_url || product?.image || '';
    if (!value) return undefined;
    if (/^https?:\/\//.test(value)) return value;

    let path = String(value).replace(/^\/be\/uploads\//, '/uploads/');
    path = path.replace(/^\/uploads\/uploads\//, '/uploads/');
    if (!path.startsWith('/')) path = `/uploads/${path}`;
    return `${API_BASE_URL}${path}`;
}

function productPrice(product: any) {
    const basePrice = Number(product?.price || 0);
    const discount = Number(product?.discount || 0);
    if (!discount) return basePrice;
    if (product?.discount_type === 'flat') return Math.max(0, basePrice - discount);
    return Math.max(0, basePrice - (basePrice * discount) / 100);
}

export function HomePage({ onCategoryPress, onProductPress, onCartPress, onListPress, onOrdersPress, onProfilePress, onScrollChange, onNotificationPress }: HomePageProps) {
    const { data: categoryData } = useCategories();
    const { data: randomProductData } = useRandomProducts();
    const { data: businessData } = useBusinesses();
    const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build a businessId → name map for quick lookup
    const businessMap = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        (Array.isArray(businessData) ? businessData : []).forEach((b: any) => {
            const id = String(b._id || b.id || '');
            if (id) map[id] = b.name || 'Provider';
        });
        return map;
    }, [businessData]);

    const categories = useMemo<Category[]>(() => {
        return (categoryData ?? [])
            .filter((category: any) => category.status !== 'inactive')
            .map((category: any) => {
                const path = category.image_url || (category.image ? `/uploads/${category.image}` : '');
                const imageUri = path
                    ? (/^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`)
                    : undefined;

                return {
                    id: String(category.id || category._id),
                    name: category.name,
                    subtitle: category.subtitle || '',
                    imageUri,
                };
            });
    }, [categoryData]);

    const products = useMemo<Product[]>(() => {
        const groups = Array.isArray(randomProductData) ? randomProductData : [];
        return groups.flatMap((group: any) => {
            const groupBusinessId = String(group._id || group.id || '');
            return (group.products || []).map((product: any) => {
                const imageUri = backendImageUri(product);
                const businessId = String(
                    product.business_id?._id || product.business_id?.id || product.business_id || groupBusinessId
                );
                const storeName =
                    product.business_id?.name ||
                    businessMap[businessId] ||
                    businessMap[groupBusinessId] ||
                    'SHOP365 Provider';
                return {
                    id: String(product.id || product._id),
                    name: product.title || 'Product',
                    store: storeName,
                    price: productPrice(product),
                    imageUri,
                    image: imageUri ? { uri: imageUri } : undefined,
                };
            });
        });
    }, [randomProductData, businessMap]);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <HomeHeader onNotificationPress={onNotificationPress} />
                    <CategoryList categories={categories} onCategoryPress={onCategoryPress} />
                    <PromoBanner discount="10%" storeName="SHOP365 Mart" />
                    <MonthlyGroceryHomeCard onPress={onListPress} />
                    <TopSellingProducts products={products} onProductPress={onProductPress} />
                    <View className="h-28" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
