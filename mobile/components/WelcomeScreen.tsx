import { View, Image, Text as RNText, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = {
    onRegister?: () => void;
};

export function WelcomeScreen({ onRegister }: WelcomeScreenProps) {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6">
                {/* Illustration */}
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={require('@/assets/register/register.jpg')}
                        className="w-full h-80"
                        resizeMode="contain"
                    />
                </View>

                {/* Text Content & Button */}
                <View className="w-full pb-20">
                    <RNText className="text-4xl font-semibold text-slate-800">
                        {'Welcome to our\n'}
                        <RNText className="text-yellow-500 font-bold text-4xl">Shop</RNText>
                        <RNText className="text-slate-800 font-bold text-4xl">365</RNText>
                        <RNText className="text-slate-800 font-semibold text-4xl"> App</RNText>
                    </RNText>

                    <RNText className="text-slate-600 mt-3 text-base font-medium">
                        Powered by NBT-HUB
                    </RNText>

                    {/* Register Button */}
                    <Pressable
                        className="mt-6 w-full bg-yellow-500 active:bg-yellow-600 rounded-lg h-14 items-center justify-center"
                        onPress={onRegister}
                    >
                        <RNText className="text-white font-semibold text-base">
                            Register Now
                        </RNText>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
