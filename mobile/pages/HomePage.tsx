import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '@/api/client';
import { useCategories } from '@/api/home/useHomeQueries';
import { useAuthStore } from '@/lib/authStore';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoryList } from '@/components/home/CategoryList';
import { PromoBanner } from '@/components/home/PromoBanner';
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
};

type HomePageProps = {
    onCategoryPress?: (category: Category) => void;
    onProductPress?: (product: Product) => void;
    onCartPress?: () => void;
};

export function HomePage({ onCategoryPress, onProductPress, onCartPress }: HomePageProps) {
    const { logout } = useAuthStore();
    const { data: categoryData } = useCategories();

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
            { id: '2', name: 'Food', subtitle: 'Restaurants', image: require('@/assets/category/food.png') },
            { id: '3', name: 'Hospital', subtitle: 'Pharmacy', image: require('@/assets/category/hospital.png') },
        ];
    }, [categoryData]);

    // Mock data for products
    const products = [
        { id: '1', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, image: require('@/assets/product/product.png') },
        { id: '2', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, image: require('@/assets/product/toys.png') },
        { id: '3', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, image: require('@/assets/product/product.png') },
        { id: '4', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, image: require('@/assets/product/product.png') },
    ];

    return (
        <LinearGradient colors={['#FFD54F', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Header Component */}
                    <HomeHeader onCartPress={onCartPress} />

                    {/* Categories Component */}
                    <CategoryList categories={categories} onCategoryPress={onCategoryPress} />

                    {/* Banner Component */}
                    <PromoBanner discount="10%" storeName="SHOP365 Mart" />

                    {/* Top Selling Products Component */}
                    <TopSellingProducts products={products} onProductPress={onProductPress} />

                    {/* Bottom spacing */}
                    <View className="h-20" />
                </ScrollView>

                {/* Bottom Tab Bar Component */}
                <BottomTabBar onProfilePress={logout} onCartPress={onCartPress} />
            </SafeAreaView>
        </LinearGradient>
    );
}
