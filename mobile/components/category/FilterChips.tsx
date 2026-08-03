import { Text, ScrollView, Pressable, View } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { AppStyles } from '@/components/reusable/colors';

type FilterChipsProps = {
    filters: string[];
    activeFilter: string;
    onFilterPress?: (filter: string) => void;
};

export function FilterChips({ filters, activeFilter, onFilterPress }: FilterChipsProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 grow-0"
            contentContainerClassName="px-5 gap-2"
        >
            {filters.map((filter) => {
                const isActive = filter === activeFilter;

                if (isActive) {
                    return (
                        <GradientPill
                            key={filter}
                            className="rounded-full active:opacity-70"
                            onTouchEnd={() => onFilterPress?.(filter)}
                        >
                            <View className="h-9 items-center justify-center px-5">
                                <Text className="font-lufga-medium text-sm text-slate-900">
                                    {filter}
                                </Text>
                            </View>
                        </GradientPill>
                    );
                }

                return (
                    <Pressable
                        key={filter}
                        className="h-9 items-center justify-center px-5 active:opacity-70 rounded-full"
                        style={AppStyles.glassTag}
                        onPress={() => onFilterPress?.(filter)}
                    >
                        <Text className="font-lufga text-sm text-slate-500">
                            {filter}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
