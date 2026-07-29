import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { useBusinesses } from '@/api/home/useHomeQueries';
import { API_BASE_URL } from '@/api/client';

type CategoriesProps = {
    onCategoryPress?: (id: number, title: string) => void;
};

export function Categories({ onCategoryPress }: CategoriesProps) {
    const { data, isLoading } = useBusinesses();

    if (isLoading) {
        return <ActivityIndicator color="#eab308" className="py-4" />;
    }

    if (!data) return null;

    return (
        <View className="px-5 mt-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                    {data.map((biz: any) => (
                        <Pressable
                            key={biz.id}
                            className="items-center mr-5"
                            onPress={() => onCategoryPress?.(biz.id, biz.name)}
                        >
                            <View className="w-16 h-16 bg-yellow-50 rounded-full items-center justify-center border border-yellow-200">
                                {biz.image ? (
                                    <Image
                                        source={{ uri: `${API_BASE_URL}/storage/${biz.image}` }}
                                        className="w-10 h-10 rounded-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-2xl">🛒</Text>
                                )}
                            </View>
                            <Text className="text-xs text-slate-700 mt-1 font-medium text-center" numberOfLines={1}>
                                {biz.name}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
