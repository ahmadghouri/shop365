import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';

type LocationPermissionScreenProps = {
    onDone: () => void;
};

export function LocationPermissionScreen({ onDone }: LocationPermissionScreenProps) {
    const handleAllow = async () => {
        await Location.requestForegroundPermissionsAsync();
        // Regardless of allow/deny, move forward
        onDone();
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-6 items-center justify-center">

                    {/* Illustration */}
                    <View className="mb-10 items-center">
                        <Text style={{ fontSize: 80 }}>📍</Text>
                    </View>

                    {/* Text */}
                    <Text className="text-4xl font-medium font-lufga text-app-dark text-center mb-3">
                        Allow Location Access
                    </Text>
                    <Text className="text-base font-lufga font-light text-app-muted text-center mb-12 leading-6">
                        We use your location to show nearby services and deliver to your doorstep accurately.
                    </Text>

                    {/* Allow Button */}
                    <GradientPill className="w-full rounded-full h-14 mb-4">
                        <Pressable
                            className="flex-1 items-center justify-center"
                            onPress={handleAllow}
                        >
                            <Text className="text-slate-900 font-medium font-lufga text-base">
                                Allow Location
                            </Text>
                        </Pressable>
                    </GradientPill>

                    {/* Skip */}
                    <Pressable onPress={onDone} className="py-3">
                        <Text className="text-base font-lufga font-light text-app-muted">
                            Skip for now
                        </Text>
                    </Pressable>

                </View>
            </SafeAreaView>
        </AppBackground>
    );
}
