import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronLeft, Plus, Search, X } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { API_BASE_URL } from '@/api/client';
import { useCategoryProducts, useCategories } from '@/api/home/useHomeQueries';
import { useAddMonthlyGroceryItem } from '@/api/monthly-grocery/useMonthlyGroceryQueries';

type AddProductToListPageProps = {
    cardId: string;
    onBack: () => void;
};

function productImageUri(product: any) {
    const path = product?.image_url || product?.image || '';
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/uploads/${path}`;
    return `${API_BASE_URL}${normalized}`;
}

export function AddProductToListPage({ cardId, onBack }: AddProductToListPageProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [addingId, setAddingId] = useState('');
    const [sizeProduct, setSizeProduct] = useState<any>(null);
    const addItem = useAddMonthlyGroceryItem();

    const { data: categories } = useCategories();
    const groceryCategoryId = (categories || []).find(
        (cat: any) => (cat.name || '').toLowerCase() === 'grocery',
    )?.id || '';

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useCategoryProducts(groceryCategoryId, 'All', debouncedSearch);
    const products = data?.products || [];

    const handleAdd = async (product: any) => {
        const hasSizes = product.sizes && product.sizes.length > 0;
        if (hasSizes) {
            setSizeProduct(product);
            return;
        }
        await doAdd(product);
    };

    const doAdd = async (product: any, variant?: { name: string; price: number }) => {
        const productId = String(product.id || product._id);
        try {
            setAddingId(productId);
            await addItem.mutateAsync({ cardId, productId, quantity: 1, variant });
            Alert.alert('Added!', `${product.title}${variant ? ` (${variant.name})` : ''} added to your list.`);
        } catch (error: any) {
            Alert.alert('Could not add', error?.response?.data?.message || 'Please try again.');
        } finally {
            setAddingId('');
        }
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1 bg-transparent" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
                    <Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-50" onPress={onBack}>
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <View className="flex-1 flex-row items-center rounded-2xl bg-slate-100 px-3 py-3">
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            className="ml-2 flex-1 font-lufga text-slate-950"
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search grocery products..."
                            placeholderTextColor="#94a3b8"
                            autoFocus
                        />
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {!groceryCategoryId ? (
                        <View className="items-center py-20">
                            <ActivityIndicator color="#EAB308" />
                        </View>
                    ) : isLoading ? (
                        <View className="items-center py-20">
                            <ActivityIndicator size="large" color="#EAB308" />
                        </View>
                    ) : (
                        <>
                            <Text className="px-5 pb-2 pt-4 text-sm font-lufga text-slate-400">
                                {products.length} {products.length === 1 ? 'result' : 'results'}
                            </Text>
                            <View className="gap-2 px-5 pb-10">
                                {products.map((product: any) => {
                                    const id = String(product.id || product._id);
                                    const imageUri = productImageUri(product);
                                    const adding = addingId === id;
                                    return (
                                        <View key={id} className="flex-row items-center rounded-3xl bg-white p-3">
                                            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                                {imageUri ? (
                                                    <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="contain" />
                                                ) : (
                                                    <Text className="text-xl">🛒</Text>
                                                )}
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-xs font-lufga text-slate-400" numberOfLines={1}>
                                                    {product.business_id?.name || 'Grocery'}
                                                </Text>
                                                <Text className="text-[15px] font-lufga-bold text-slate-950" numberOfLines={1}>
                                                    {product.title}
                                                </Text>
                                                <Text className="mt-1 text-base font-lufga-bold text-slate-950">
                                                    Rs {Number(product.final_price ?? product.price ?? 0).toLocaleString()}
                                                </Text>
                                            </View>
                                            <Pressable
                                                disabled={adding}
                                                className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC400] active:opacity-80 disabled:opacity-50"
                                                onPress={() => handleAdd(product)}
                                            >
                                                <Plus size={24} color="#171717" strokeWidth={3} />
                                            </Pressable>
                                        </View>
                                    );
                                })}
                                {products.length === 0 && debouncedSearch.length > 0 && (
                                    <View className="items-center py-10">
                                        <Text className="font-lufga text-slate-400">No grocery products found</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>

                {sizeProduct && (
                    <Modal visible transparent animationType="slide" onRequestClose={() => setSizeProduct(null)}>
                        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setSizeProduct(null)}>
                            <Pressable className="rounded-t-[32px] bg-white px-5 pb-9 pt-4" onPress={() => { }}>
                                <View className="mb-5 flex-row items-center justify-between">
                                    <View className="flex-1">
                                        <Text className="text-xl font-lufga-bold text-slate-950">{sizeProduct.title}</Text>
                                        <Text className="mt-1 text-sm font-lufga text-slate-400">Select a size or variant</Text>
                                    </View>
                                    <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100" onPress={() => setSizeProduct(null)}>
                                        <X size={19} color="#334155" />
                                    </Pressable>
                                </View>
                                <View className="gap-2">
                                    {(sizeProduct.sizes || []).map((size: any, idx: number) => (
                                        <Pressable
                                            key={size._id || size.name || idx}
                                            className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 active:bg-amber-50"
                                            onPress={async () => {
                                                const selectedVariant = { name: size.name, price: Number(size.price || 0) };
                                                setSizeProduct(null);
                                                await doAdd(sizeProduct, selectedVariant);
                                            }}
                                        >
                                            <View className="flex-1">
                                                <Text className="font-lufga-semibold text-slate-950">{size.name}</Text>
                                                <Text className="mt-1 text-sm font-lufga-bold text-slate-700">Rs {Number(size.price || 0).toLocaleString()}</Text>
                                            </View>
                                            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FFC400]">
                                                <Plus size={20} color="#171717" strokeWidth={3} />
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                                <Pressable
                                    className="mt-4 flex-row items-center justify-center rounded-2xl bg-slate-100 py-4"
                                    onPress={async () => {
                                        setSizeProduct(null);
                                        await doAdd(sizeProduct);
                                    }}
                                >
                                    <Text className="font-lufga-semibold text-slate-700">Add default (no size)</Text>
                                </Pressable>
                            </Pressable>
                        </Pressable>
                    </Modal>
                )}
            </SafeAreaView>
        </AppBackground>
    );
}