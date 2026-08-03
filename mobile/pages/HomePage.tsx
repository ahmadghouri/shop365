import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/api/client';
import { AppBackground } from '@/components/AppBackground';
import { useCategories, useRandomProducts } from '@/api/home/useHomeQueries';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoryList } from '@/components/home/CategoryList';
import { PromoBanner } from '@/components/home/PromoBanner';
import { MonthlyGroceryHomeCard } from '@/components/home/MonthlyGroceryHomeCard';
import { TopSellingProducts } from '@/components/home/TopSellingProducts';
import { BottomTabBar } from '@/components/home/BottomTabBar';

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
    onProfilePress?: () => void;
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

export function HomePage({ onCategoryPress, onProductPress, onCartPress, onListPress, onProfilePress }: HomePageProps) {
    const { data: categoryData } = useCategories();
    const { data: randomProductData } = useRandomProducts();

    const categories = useMemo<Category[]>(() => {
        const backendCategories = (categoryData ?? [])
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

        if (backendCategories.length > 0) return backendCategories;

        return [
            { id: '1', name: 'Grocery', subtitle: 'Daily Essentials', image: require('@/assets/category/grocery.png') },
            { id: '2', name: 'Food', subtitle: 'Providers', image: require('@/assets/category/food.png') },
            { id: '3', name: 'Hospital', subtitle: 'Pharmacy', image: require('@/assets/category/hospital.png') },
        ];
    }, [categoryData]);

    const products = useMemo<Product[]>(() => {
        const groups = Array.isArray(randomProductData) ? randomProductData : [];
        return groups.flatMap((group: any) => group.products || []).map((product: any) => {
            const imageUri = backendImageUri(product);
            return {
                id: String(product.id || product._id),
                name: product.title || 'Product',
                store: product.business_id?.name || 'SHOP365 Provider',
                price: productPrice(product),
                imageUri,
                image: imageUri ? { uri: imageUri } : undefined,
            };
        });
    }, [randomProductData]);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <HomeHeader onCartPress={onCartPress} />
                    <CategoryList categories={categories} onCategoryPress={onCategoryPress} />
                    <PromoBanner discount="10%" storeName="SHOP365 Mart" />
                    <MonthlyGroceryHomeCard onPress={onListPress} />
                    <TopSellingProducts products={products} onProductPress={onProductPress} />
                    <View className="h-20" />
                </ScrollView>

                <BottomTabBar onProfilePress={onProfilePress} onListPress={onListPress} />
            </SafeAreaView>
        </AppBackground>
    );
}
