import { View, Image } from 'react-native';
import { AppBackground } from '@/components/AppBackground';

export function SplashScreen() {
    return (
        <AppBackground>
            <View className="flex-1 items-center justify-center">
                {/* App Icon */}
                <Image
                    source={require('@/assets/Appicon.png')}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="contain"
                />
                {/* Shop365 Logo Text */}
                <Image
                    source={require('@/assets/shop365logo.png')}
                    className="w-56 h-16 mt-3"
                    resizeMode="contain"
                />
            </View>
        </AppBackground>
    );
}
