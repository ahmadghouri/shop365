import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

type SearchBarProps = {
    value?: string;
    placeholder?: string;
    onChangeText?: (text: string) => void;
};

export function SearchBar({ value, placeholder = 'Search', onChangeText }: SearchBarProps) {
    return (
        <View
            className="mx-5 mt-1 h-12 flex-row items-center px-4"
            style={{
                borderRadius: 50,
                borderWidth: 1,
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
            }}
        >
            <Search size={20} color="#94a3b8" />
            <TextInput
                className="ml-3 flex-1 font-lufga text-base text-slate-800"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}
