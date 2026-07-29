import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type PromoBannerProps = {
    discount?: string;
    storeName?: string;
};

export function PromoBanner({ discount = '10%', storeName = 'SHOP365 Mart' }: PromoBannerProps) {
    return (
        <View className="px-5 mt-5">
            <LinearGradient
                colors={['#FCD34D', '#EAB308']}
                style={{ borderRadius: 24, padding: 24 }}
            >
                <Text className="text-slate-900 text-sm font-bold tracking-wide">UPTO</Text>
                <Text className="text-slate-900 text-5xl font-bold mt-1">{discount} OFF</Text>
                <Text className="text-slate-900/70 text-base mt-1">On {storeName}</Text>
            </LinearGradient>
        </View>
    );
}
