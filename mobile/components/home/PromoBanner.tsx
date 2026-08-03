import { View, Text } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type PromoBannerProps = {
    discount?: string;
    storeName?: string;
};

export function PromoBanner({ discount = '10%', storeName = 'SHOP365 Mart' }: PromoBannerProps) {
    return (
        <GradientPill className="mx-5 mt-5 rounded-3xl">
            <View className="p-6 text-app-dark">
                <Text className="text-app-dark text-2xl font-medium tracking-wide">UPTO</Text>
                <Text className="text-app-dark text-5xl font-medium mt-1">{discount} OFF</Text>
                <Text className="text-app-dark font-light font-lufga text-base mt-1">On {storeName}</Text>
            </View>
        </GradientPill>
    );
}
