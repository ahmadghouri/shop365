import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { RiderRegisterForm } from '@/pages/RiderRegisterForm';
import { useAuthStore } from '@/lib/authStore';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    toPakistanLocal,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';

export function AuthScreen() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const login = useAuthStore((s) => s.login);

    const handleLogin = async () => {
        setError('');
        const phoneError = validatePakistanPhoneNumber(phone);
        if (phoneError) {
            setError(phoneError);
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }
        setSubmitting(true);
        try {
            await login(toPakistanLocal(phone), password);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

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
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <Text className="mt-10 mb-2 text-4xl font-medium text-app-dark">
                            Rider Portal
                        </Text>
                        <Text className="mb-8 text-base font-light text-app-muted">
                            Sign in to start delivering.
                        </Text>

                        <View
                            className="-mx-6 rounded-t-3xl bg-white/50 px-6 pb-8 pt-6"
                            style={{ minHeight: 400 }}
                        >
                            {/* Tab Switcher */}
                            <View className="mb-8 flex-row rounded-full bg-white/70 p-1">
                                {activeTab === 'login' ? (
                                    <GradientPill className="flex-1 rounded-full">
                                        <Pressable
                                            className="flex-1 items-center rounded-full py-3"
                                            onPress={() => setActiveTab('login')}
                                        >
                                            <Text className="text-base text-app-dark">Login</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 items-center rounded-full py-3"
                                        onPress={() => setActiveTab('login')}
                                    >
                                        <Text className="text-base text-app-muted">Login</Text>
                                    </Pressable>
                                )}
                                {activeTab === 'register' ? (
                                    <GradientPill className="flex-1 rounded-full">
                                        <Pressable
                                            className="flex-1 items-center rounded-full py-3"
                                            onPress={() => setActiveTab('register')}
                                        >
                                            <Text className="text-base text-app-dark">Register</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 items-center rounded-full py-3"
                                        onPress={() => setActiveTab('register')}
                                    >
                                        <Text className="text-base text-app-muted">Register</Text>
                                    </Pressable>
                                )}
                            </View>

                            {activeTab === 'login' ? (
                                <>
                                    {/* Error */}
                                    {error ? (
                                        <View className="mb-4 rounded-lg bg-red-50 px-4 py-3">
                                            <Text className="text-center text-sm text-red-600">
                                                {error}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Phone */}
                                    <View className="mb-5">
                                        <Text className="mb-2 text-base text-slate-800">
                                            Phone Number
                                        </Text>
                                        <View className="h-14 flex-row items-center rounded-full bg-white px-5 shadow-sm">
                                            <Text className="border-r border-slate-200 pr-3 text-base font-semibold text-slate-700">
                                                +92
                                            </Text>
                                            <TextInput
                                                className="flex-1 pl-3 text-base text-slate-800"
                                                placeholder="300 1234567"
                                                placeholderTextColor="#9ca3af"
                                                keyboardType="phone-pad"
                                                maxLength={11}
                                                value={formatPakistanPhoneNumber(phone).replace(
                                                    /^\+92\s?/,
                                                    ''
                                                )}
                                                onChangeText={(v) =>
                                                    setPhone(sanitizePakistanPhoneDigits(v))
                                                }
                                            />
                                        </View>
                                    </View>

                                    {/* Password */}
                                    <View className="mb-8">
                                        <Text className="mb-2 text-base text-slate-800">
                                            Password
                                        </Text>
                                        <View className="h-14 flex-row items-center justify-center rounded-full bg-white px-5 shadow-sm">
                                            <TextInput
                                                className="flex-1 text-base text-slate-800"
                                                placeholder="••••••••"
                                                placeholderTextColor="#9ca3af"
                                                secureTextEntry={!showPassword}
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <Pressable
                                                onPress={() => setShowPassword((p) => !p)}
                                                className="pl-2"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} color="#9ca3af" />
                                                ) : (
                                                    <Eye size={20} color="#9ca3af" />
                                                )}
                                            </Pressable>
                                        </View>
                                    </View>

                                    {/* Login Button */}
                                    <GradientPill
                                        className="h-14 rounded-full"
                                        style={{ opacity: submitting ? 0.6 : 1 }}
                                    >
                                        <Pressable
                                            className="flex-1 items-center justify-center"
                                            onPress={handleLogin}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <ActivityIndicator color="#000" />
                                            ) : (
                                                <Text className="text-base font-medium text-slate-900">
                                                    Login
                                                </Text>
                                            )}
                                        </Pressable>
                                    </GradientPill>
                                </>
                            ) : (
                                /* Register tab — submit a rider application for admin approval */
                                <RiderRegisterForm
                                    onSubmitted={() => setActiveTab('login')}
                                    onBackToLogin={() => setActiveTab('login')}
                                />
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AppBackground>
    );
}
