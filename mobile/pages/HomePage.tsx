import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '@/components/home/HomeHeader';
import { Categories } from '@/components/home/Categories';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { ForYouSection } from '@/components/home/ForYouSection';
import { DiscountedItems } from '@/components/home/DiscountedItems';
import { BottomTabBar } from '@/components/home/BottomTabBar';

export function HomePage() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <HomeHeader />
                <Categories />
                <BannerCarousel />
                <ForYouSection />
                <DiscountedItems />
            </ScrollView>
            <BottomTabBar />
        </SafeAreaView>
    );
}
