import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';

type LocationPermissionScreenProps = {
    onDone: () => void;
};

export function LocationPermissionScreen({ onDone }: LocationPermissionScreenProps) {
    const [loading, setLoading] = useState(false);

    const markOnboarded = async () => {
        try {
            await AsyncStorage.setItem('location_onboarded', '1');
        } catch {}
    };

    const handleAllow = async () => {
        setLoading(true);
        try {
            await Location.requestForegroundPermissionsAsync();
        } catch (err) {
            console.log('Location permission error:', err);
        } finally {
            await markOnboarded();
            setLoading(false);
            onDone();
        }
    };

    const handleSkip = async () => {
        await markOnboarded();
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
                        We use your location to show nearby services and deliver to your doorstep
                        accurately.
                    </Text>

                    {/* Allow Button */}
                    <GradientPill className="w-full rounded-full h-14 mb-4">
                        <Pressable
                            className="flex-1 items-center justify-center"
                            onPress={handleAllow}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#111827" />
                            ) : (
                                <Text className="text-slate-900 font-medium font-lufga text-base">
                                    Allow Location
                                </Text>
                            )}
                        </Pressable>
                    </GradientPill>

                    {/* Skip */}
                    <Pressable onPress={handleSkip} className="py-3" disabled={loading}>
                        <Text className="text-base font-lufga font-light text-app-muted">
                            Skip for now
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}
