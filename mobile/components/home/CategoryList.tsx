import { View, Text, ScrollView, Pressable, Image } from 'react-native';

type Category = {
    id: string;
    name: string;
    subtitle: string;
    image: any;
};

type CategoryListProps = {
    categories: Category[];
    onCategoryPress?: (category: Category) => void;
};

export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row px-5">
                {categories.map((cat) => (
                    <Pressable
                        key={cat.id}
                        className="mr-3 rounded-xl pt-4 pl-4 min-w-36 min-h-32 bg-white/70"
                        onPress={() => onCategoryPress?.(cat)}
                    >
                        <Text className="text-[16px] font-lufga font-normal text-slate-900">{cat.name}</Text>
                        <Text className="text-10 text-[#6B7280] font-lufga font-light mt-0.5">{cat.subtitle}</Text>
                        <View className="flex-1 items-end justify-end">
                            <Image
                                source={cat.image}
                                className="size-20"
                                resizeMode="contain"
                            />
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}
