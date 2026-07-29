import { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { SearchBar } from '@/components/category/SearchBar';
import { FilterChips } from '@/components/category/FilterChips';
import { ProductCard } from '@/components/home/ProductCard';

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    image?: any;
    tag?: string;
};

type CategoryDetailPageProps = {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    onCartPress?: () => void;
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
};

export function CategoryDetailPage({
    title = 'Grocery',
    subtitle = 'Daily Essentials',
    onBack,
    onCartPress,
    onProductPress,
    onAddToCart,
}: CategoryDetailPageProps) {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Oil & Ghee', 'Sugar', 'Daal', 'Rice', 'Flour'];

    // Mock data — replace with API data
    const products: Product[] = [
        { id: '1', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
        { id: '2', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
        { id: '3', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
        { id: '4', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
        { id: '5', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
        { id: '6', name: 'Oil & Ghee', store: 'SHOP365 Mart', price: 1900, tag: 'Oil & Ghee', image: require('@/assets/product/product.png') },
    ];

    const visibleProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        return products.filter((product) => {
            const matchesFilter = activeFilter === 'All' || product.tag === activeFilter;
            const matchesSearch = !query || product.name.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [products, activeFilter, search]);

    return (
        <LinearGradient colors={['#FFD54F', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <CategoryHeader
                    title={title}
                    subtitle={subtitle}
                    onBack={onBack}
                    onCartPress={onCartPress}
                />

                <SearchBar value={search} onChangeText={setSearch} />

                <FilterChips
                    filters={filters}
                    activeFilter={activeFilter}
                    onFilterPress={setActiveFilter}
                />

                <ScrollView
                    className="flex-1 mt-4"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-row flex-wrap justify-between px-5">
                        {visibleProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                store={product.store}
                                price={product.price}
                                image={product.image}
                                onPress={() => onProductPress?.(product)}
                                onAddToCart={() => onAddToCart?.(product)}
                            />
                        ))}
                    </View>

                    <View className="h-6" />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
