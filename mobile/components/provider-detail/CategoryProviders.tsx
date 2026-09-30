import {
    View,
    Text,
    ScrollView,
    Image,
    Pressable,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { useProvidersByCategory } from '@/api/provider/useProviderDetail';
import { API_BASE_URL } from '@/api/client';

// Business logos may be a full URL (seeded/hosted) or a stored filename served
// from /storage. Handle both — same as the provider detail page.
function businessImageUri(biz: any): string | undefined {
    const path = biz?.image || biz?.image_url;
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
    return `${API_BASE_URL}/storage/${path}`;
}

type CategoryProvidersProps = {
    categoryId: string;
    onProviderPress?: (provider: { id: string; name: string }) => void;
};

/**
 * Providers that belong to a category, filtered on the backend via
 * GET /business?category_id=... . Rendered exactly like the home page's
 * provider strip: horizontal round avatars with the name underneath.
 */
export function CategoryProviders({ categoryId, onProviderPress }: CategoryProvidersProps) {
    const { data: providers = [], isLoading } = useProvidersByCategory(categoryId);
    const { width } = useWindowDimensions();
    const isSmall = width < 380;
    const isTiny = width < 340;

    // Avatar diameter and per-item width scale down on small screens.
    const avatar = isTiny ? 52 : isSmall ? 58 : 64;
    const itemWidth = isTiny ? 60 : isSmall ? 66 : 72;
    const gap = isTiny ? 12 : isSmall ? 16 : 20;

    if (isLoading) {
        return <ActivityIndicator color="#eab308" className="py-4" />;
    }

    if (providers.length === 0) return null;

    return (
        <View className={`${isSmall ? 'px-3' : 'px-5'} mt-2 pb-3`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                    {providers.map((biz: any, index: number) => {
                        const logo = businessImageUri(biz);
                        return (
                            <Pressable
                                key={String(biz._id || biz.id)}
                                className="items-center"
                                style={{
                                    width: itemWidth,
                                    marginRight: index === providers.length - 1 ? 0 : gap,
                                }}
                                onPress={() =>
                                    onProviderPress?.({ id: String(biz._id || biz.id), name: biz.name })
                                }
                            >
                                <View
                                    className="bg-yellow-50 rounded-full items-center justify-center border border-yellow-200 overflow-hidden"
                                    style={{ width: avatar, height: avatar }}
                                >
                                    {logo ? (
                                        <Image
                                            source={{ uri: logo }}
                                            style={{ width: avatar, height: avatar, borderRadius: avatar / 2 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text style={{ fontSize: isTiny ? 20 : 24 }}>🛒</Text>
                                    )}
                                </View>
                                <Text
                                    className={`${isTiny ? 'text-[10px]' : 'text-xs'} text-slate-700 mt-1 font-medium text-center`}
                                    numberOfLines={1}
                                >
                                    {biz.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
