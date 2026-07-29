import { Text, ScrollView, Pressable } from 'react-native';

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
                return (
                    <Pressable
                        key={filter}
                        className={`h-9 items-center justify-center rounded-full px-5 active:opacity-70 ${isActive ? 'bg-[#EAB308]' : 'bg-white/80'
                            }`}
                        onPress={() => onFilterPress?.(filter)}
                    >
                        <Text
                            className={`font-lufga text-sm ${isActive ? 'font-lufga-medium text-slate-900' : 'text-slate-500'
                                }`}
                        >
                            {filter}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}
