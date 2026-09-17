import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useLoginMutation } from '@/api/auth/useLoginMutation';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { formatPakistanPhoneNumber, sanitizePakistanPhoneDigits, toPakistanLocal, validatePakistanPhoneNumber } from '@/lib/pakistanPhone';

type LoginScreenProps = {
    onSuccess?: () => void;
    onRegister?: () => void;
    onForgotPassword?: () => void;
};

export function LoginScreen({ onSuccess, onRegister, onForgotPassword }: LoginScreenProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState('');

    const loginMutation = useLoginMutation();

    const handleLogin = () => {
        setValidationError('');
        const phoneError = validatePakistanPhoneNumber(phone);
        if (phoneError) {
            setValidationError(phoneError);
            return;
        }
        if (!password || password.length < 4) {
            setValidationError('Password must be at least 4 characters');
            return;
        }
        loginMutation.mutate(
            { phone_no: toPakistanLocal(phone), password },
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
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        className="flex-1 px-6"
                        contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <Text className="text-4xl font-medium font-lufga text-app-dark mb-2 mt-10">
                            Log in to your account.
                        </Text>
                        <Text className="text-base text-app-muted font-lufga font-light mb-8">
                            Fill in a few quick details to begin.
                        </Text>

                        <GlassCard
                            className='!mx-[-24px] h-full rounded-none'
                            intensity={100}
                            variant="default"
                            style={{
                                borderRadius: 24,
                                shadowColor: 'rgba(255, 255, 255, 0.20)',
                                shadowOffset: { width: 2, height: 2 },
                                shadowOpacity: 1,
                                shadowRadius: 20,
                                elevation: 4,
                            }}
                        >
                            {/* Tab Switcher */}
                            <View className="flex-row bg-[#FFFFFFBF] rounded-full p-1 mb-8 mx-4 mt-6">
                                {activeTab === 'login' ? (
                                    <GradientPill className="flex-1 rounded-full">
                                        <Pressable
                                            className="flex-1 py-3 rounded-full items-center"
                                            onPress={() => setActiveTab('login')}
                                        >
                                            <Text className="text-base font-lufga font-normal text-app-dark">Login</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 py-3 rounded-full items-center"
                                        onPress={() => setActiveTab('login')}
                                    >
                                        <Text className="text-base font-lufga font-normal text-app-muted">Login</Text>
                                    </Pressable>
                                )}
                                {activeTab === 'register' ? (
                                    <GradientPill className="flex-1 rounded-full">
                                        <Pressable
                                            className="flex-1 py-3 rounded-full items-center"
                                            onPress={() => { setActiveTab('register'); onRegister?.(); }}
                                        >
                                            <Text className="font-semibold text-slate-900">Register</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 py-3 rounded-full items-center"
                                        onPress={() => { setActiveTab('register'); onRegister?.(); }}
                                    >
                                        <Text className="font-medium text-slate-500">Register</Text>
                                    </Pressable>
                                )}
                            </View>

                            {/* Error */}
                            {displayError ? (
                                <View className="bg-red-50 rounded-lg px-4 py-3 mb-4">
                                    <Text className="text-sm text-red-600 text-center">{displayError}</Text>
                                </View>
                            ) : null}

                            {/* Phone Number */}
                            <View className="mb-5 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Phone Number</Text>
                                <View className="flex-row items-center bg-white rounded-full px-5 h-14 justify-center shadow-sm">
                                    <Text className="border-r border-slate-200 pr-3 text-base font-lufga-semibold text-slate-700">+92</Text>
                                    <TextInput
                                        className="flex-1 px-3 text-base text-slate-800"
                                        placeholder="300 1234567"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="phone-pad"
                                        maxLength={11}
                                        value={formatPakistanPhoneNumber(phone).replace(/^\+92\s?/, '')}
                                        onChangeText={(value) => setPhone(sanitizePakistanPhoneDigits(value))}
                                    />
                                </View>
                            </View>

                            {/* Password */}
                            <View className="mb-3 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Password</Text>
                                <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm flex-row items-center">
                                    <TextInput
                                        className="flex-1 text-base text-slate-800"
                                        placeholder="••••••••"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(p => !p)} className="pl-2">
                                        {showPassword
                                            ? <EyeOff size={20} color="#9ca3af" />
                                            : <Eye size={20} color="#9ca3af" />
                                        }
                                    </Pressable>
                                </View>
                            </View>

                            {/* Forgot Password */}
                            <Pressable className="self-end mb-8 mx-4" onPress={onForgotPassword}>
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Forgot Password?</Text>
                            </Pressable>

                            {/* Login Button */}
                            <GradientPill
                                className="h-14 rounded-full mx-4"
                                style={{ opacity: loginMutation.isPending ? 0.6 : 1 }}
                            >
                                <Pressable
                                    className="flex-1 !rounded-full items-center justify-center"
                                    onPress={handleLogin}
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <Text className="text-slate-900 font-medium font-lufga text-base">Login</Text>
                                    )}
                                </Pressable>
                            </GradientPill>

                            {/* Divider */}
                            <View className="flex-row items-center my-6">
                                <View className="flex-1 h-px bg-slate-200" />
                                <Text className="mx-4 text-base font-lufga font-light text-[#9CA3AF]">Or Login with</Text>
                                <View className="flex-1 h-px bg-slate-200" />
                            </View>

                            {/* Google Button */}
                            <Pressable className="rounded-full h-14 items-center mx-4 justify-center bg-[#F5F5F5CC] flex-row">
                                <Image
                                    source={require('@/assets/Google.png')}
                                    style={{ width: 24, height: 24, marginRight: 8 }}
                                    resizeMode="contain"
                                />
                                <Text className="text-slate-700 font-normal font-lufga text-base">Continue with Google</Text>
                            </Pressable>
                        </GlassCard>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AppBackground>
    );
}
