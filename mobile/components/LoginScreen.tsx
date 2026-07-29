import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLoginMutation } from '@/api/auth/useLoginMutation';

type LoginScreenProps = {
    onSuccess?: () => void;
    onRegister?: () => void;
    onForgotPassword?: () => void;
};

export function LoginScreen({ onSuccess, onRegister, onForgotPassword }: LoginScreenProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    const loginMutation = useLoginMutation();

    const handleLogin = () => {
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
        || 'Login failed'
        : '';
    const displayError = validationError || apiError;

    return (
        <LinearGradient colors={['#FFF3C4', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1" edges={['bottom', 'left', 'right']}>
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        className="flex-1 px-6"
                        contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <Text className="text-4xl font-bold text-slate-900 mb-2">
                            Log in to your{'\n'}account.
                        </Text>
                        <Text className="text-base text-slate-400 mb-8">
                            Fill in a few quick details to begin.
                        </Text>

                        {/* Tab Switcher */}
                        <View className="flex-row bg-slate-100 rounded-full p-1 mb-8">
                            <Pressable
                                className="flex-1 py-3 rounded-full items-center bg-yellow-400"
                                onPress={() => setActiveTab('login')}
                            >
                                <Text className="font-semibold text-slate-900">Login</Text>
                            </Pressable>
                            <Pressable
                                className="flex-1 py-3 rounded-full items-center"
                                onPress={onRegister}
                            >
                                <Text className="font-medium text-slate-500">Register</Text>
                            </Pressable>
                        </View>

                        {/* Error */}
                        {displayError ? (
                            <View className="bg-red-50 rounded-lg px-4 py-3 mb-4">
                                <Text className="text-sm text-red-600 text-center">{displayError}</Text>
                            </View>
                        ) : null}

                        {/* Phone Number */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-slate-800 mb-2">Phone Number</Text>
                            <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm">
                                <TextInput
                                    className="text-base text-slate-800"
                                    placeholder="0300-1234567"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="phone-pad"
                                    maxLength={11}
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View className="mb-3">
                            <Text className="text-sm font-semibold text-slate-800 mb-2">Password</Text>
                            <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm">
                                <TextInput
                                    className="text-base text-slate-800"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {/* Forgot Password */}
                        <Pressable className="self-end mb-8" onPress={onForgotPassword}>
                            <Text className="text-sm text-slate-700 font-medium">Forgot Password?</Text>
                        </Pressable>

                        {/* Login Button */}
                        <Pressable
                            className={`w-full rounded-full h-14 items-center justify-center shadow-sm ${loginMutation.isPending ? 'bg-yellow-300' : 'bg-yellow-400 active:bg-yellow-500'}`}
                            onPress={handleLogin}
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text className="text-slate-900 font-bold text-base">Login</Text>
                            )}
                        </Pressable>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-slate-200" />
                            <Text className="mx-4 text-sm text-slate-400">Or Login with</Text>
                            <View className="flex-1 h-px bg-slate-200" />
                        </View>

                        {/* Google Button */}
                        <Pressable className="w-full rounded-full h-14 items-center justify-center border border-slate-200 bg-white flex-row">
                            <Text className="text-lg mr-2">G</Text>
                            <Text className="text-slate-700 font-medium text-base">Continue with Google</Text>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}
