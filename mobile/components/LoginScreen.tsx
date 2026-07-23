import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginMutation } from '@/lib/mutations/useLoginMutation';

type LoginScreenProps = {
    onSuccess?: () => void;
    onRegister?: () => void;
    onForgotPassword?: () => void;
};

export function LoginScreen({ onSuccess, onRegister, onForgotPassword }: LoginScreenProps) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState('');

    const loginMutation = useLoginMutation();

    const handleLogin = async () => {
        setValidationError('');

        if (!phone || phone.length !== 11) {
            setValidationError('Phone number must be 11 digits');
            return;
        }
        if (!password || password.length < 4) {
            setValidationError('Password must be at least 4 characters');
            return;
        }

        loginMutation.mutate(
            { phone_no: phone, password },
            {
                onSuccess: () => { if (onSuccess) onSuccess(); },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || 'Login failed';
                    Alert.alert('Error', msg);
                },
            }
        );
    };

    const apiError = loginMutation.error
        ? (loginMutation.error as any)?.response?.data?.message
        || (loginMutation.error as any)?.message
        || 'Login failed. Check your connection.'
        : '';
    const displayError = validationError || apiError;

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerClassName="flex-grow justify-center px-6 py-8"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card */}
                    <View className="bg-white rounded-2xl px-6 py-8 shadow-sm shadow-black/5">
                        {/* Title */}
                        <Text className="text-2xl font-bold text-slate-800 text-center mb-6">
                            Log In
                        </Text>

                        {/* Error */}
                        {displayError ? (
                            <View className="bg-red-50 rounded-lg px-4 py-3 mb-4">
                                <Text className="text-sm text-red-600 text-center">{displayError}</Text>
                            </View>
                        ) : null}

                        {/* Phone */}
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-slate-800 mb-2">Your Phone</Text>
                            <TextInput
                                className="w-full h-12 border border-slate-300 rounded-lg px-4 text-base text-slate-800 bg-white"
                                placeholder="Enter your phone number"
                                placeholderTextColor="#9ca3af"
                                keyboardType="phone-pad"
                                maxLength={11}
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        {/* Password */}
                        <View className="mb-6">
                            <Text className="text-sm font-semibold text-slate-800 mb-2">Password</Text>
                            <View className="flex-row items-center border border-slate-300 rounded-lg bg-white px-4 h-12">
                                <TextInput
                                    className="flex-1 h-12 text-base text-slate-800"
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Text className="text-sm text-slate-500">{showPassword ? 'Hide' : 'Show'}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Button */}
                        <Pressable
                            className={`w-full rounded-lg h-12 items-center justify-center ${loginMutation.isPending ? 'bg-yellow-400' : 'bg-yellow-500 active:bg-yellow-600'}`}
                            onPress={handleLogin}
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-base">Log In</Text>
                            )}
                        </Pressable>

                        {/* Forgot Password */}
                        <Pressable className="mt-4 items-center" onPress={onForgotPassword}>
                            <Text className="text-sm text-yellow-600 font-semibold">Forgot Password?</Text>
                        </Pressable>

                        {/* Register link */}
                        <View className="mt-5 items-center">
                            <Text className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Text className="text-yellow-600 font-semibold" onPress={onRegister}>Register</Text>
                            </Text>
                        </View>

                        {/* Footer */}
                        <View className="mt-4 items-center">
                            <Text className="text-xs text-yellow-600">
                                Powered by <Text className="font-semibold underline">NBT-HUB</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
