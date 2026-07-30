import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { API_BASE_URL } from '@/api/client';
import { useProductQuery } from '@/api/products/useProductQuery';
import { ProductDetailPage } from './ProductDetailPage';

type BackendProductDetailPageProps = {
    productId: string;
    previewImage?: any;
    onBack?: () => void;
    onAddToCart?: () => void;
    onBuyNow?: () => void;
};

function imageUrl(product: any) {
    const value = product?.image_url || product?.image || '';
    if (!value) return undefined;
    if (/^https?:\/\//.test(value)) return value;

    let path = String(value).replace(/^\/be\/uploads\//, '/uploads/');
    path = path.replace(/^\/uploads\/uploads\//, '/uploads/');
    if (!path.startsWith('/')) path = `/uploads/${path}`;
    return `${API_BASE_URL}${path}`;
}

function discountedPrice(price: number, product: any) {
    const discount = Number(product?.discount || 0);
    if (!discount) return price;
    if (product?.discount_type === 'flat') return Math.max(0, price - discount);
    return Math.max(0, price - (price * discount) / 100);
}

export function BackendProductDetailPage({
    productId,
    previewImage,
    onBack,
    onAddToCart,
    onBuyNow,
}: BackendProductDetailPageProps) {
    const { data: product, isLoading, isError, refetch } = useProductQuery(productId);
    if (isLoading) {
        return (
            <LinearGradient colors={['#FFD54F', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
                <SafeAreaView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EAB308" />
                    <Text className="mt-3 font-lufga text-slate-600">Loading product...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    if (isError || !product) {
        return (
            <LinearGradient colors={['#FFD54F', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
                <SafeAreaView className="flex-1 items-center justify-center px-6">
                    {onBack && (
                        <Pressable
                            className="absolute left-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-white/90"
                            onPress={onBack}
                        >
                            <ChevronLeft size={22} color="#1e293b" />
                        </Pressable>
                    )}
                    <Text className="text-center font-lufga text-red-600">
                        Product details load nahi ho sake.
                    </Text>
                    <Pressable className="mt-4 rounded-full bg-[#EAB308] px-6 py-3" onPress={() => refetch()}>
                        <Text className="font-lufga-medium text-slate-900">Try Again</Text>
                    </Pressable>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    const basePrice = Number(product.price || 0);
    const finalPrice = discountedPrice(basePrice, product);
    const variants = (product.sizes || []).map((size: any, index: number) => ({
        id: String(size._id || `${size.name}-${index}`),
        name: String(size.name || ''),
        price: discountedPrice(Number(size.price || 0), product),
    }));
    const extras = (product.extras || [])
        .map((extra: any, index: number) => ({
            id: String(extra?._id || `${extra?.name}-${index}`),
            name: String(extra?.name || '').trim(),
            price: Number(extra?.price),
        }))
        .filter((extra: { name: string; price: number }) =>
            extra.name && Number.isFinite(extra.price) && extra.price >= 0,
        );

    return (
        <ProductDetailPage
            productId={String(product.id || product._id)}
            name={product.title}
            store={product.business_id?.name || 'SHOP365 Provider'}
            price={finalPrice}
            oldPrice={finalPrice < basePrice ? basePrice : undefined}
            description={product.description || ''}
            image={previewImage}
            imageUri={imageUrl(product)}
            extras={extras}
            variants={variants}
            onBack={onBack}
            onAddToCart={() => onAddToCart?.()}
            onBuyNow={() => onBuyNow?.()}
        />
    );
}
