import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useRegisterMutation } from '@/api/auth/useRegisterMutation';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';

type RegisterScreenProps = {
    onSuccess?: () => void;
    onLogin?: () => void;
};

export function RegisterScreen({ onSuccess, onLogin }: RegisterScreenProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState('');

    const registerMutation = useRegisterMutation();

    const handleRegister = () => {
        setValidationError('');
        if (!name || name.trim().length < 2) {
            setValidationError('Name must be at least 2 characters');
            return;
        }
        if (!phone || phone.length !== 11) {
            setValidationError('Phone number must be 11 digits');
            return;
        }
        if (!password || password.length < 4) {
            setValidationError('Password must be at least 4 characters');
            return;
        }
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }
        registerMutation.mutate(
            { name, phone_no: phone, email: email || undefined, password },
            {
                onSuccess: () => { if (onSuccess) onSuccess(); },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || 'Registration failed';
                    Alert.alert('Error', msg);
                },
            }
        );
    };

    const apiError = registerMutation.error
        ? (registerMutation.error as any)?.response?.data?.message
        || (registerMutation.error as any)?.message
        || 'Registration failed'
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
                        // keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <Text className="text-4xl font-medium font-lufga text-app-dark mb-2 mt-10">
                            Create your account.
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
                                            onPress={() => { setActiveTab('login'); onLogin?.(); }}
                                        >
                                            <Text className="text-base font-lufga font-normal text-app-dark">Login</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 py-3 rounded-full items-center"
                                        onPress={() => { setActiveTab('login'); onLogin?.(); }}
                                    >
                                        <Text className="text-base font-lufga font-normal text-app-muted">Login</Text>
                                    </Pressable>
                                )}
                                {activeTab === 'register' ? (
                                    <GradientPill className="flex-1 rounded-full">
                                        <Pressable
                                            className="flex-1 py-3 rounded-full items-center"
                                            onPress={() => setActiveTab('register')}
                                        >
                                            <Text className="text-base font-lufga font-normal text-app-dark">Register</Text>
                                        </Pressable>
                                    </GradientPill>
                                ) : (
                                    <Pressable
                                        className="flex-1 py-3 rounded-full items-center"
                                        onPress={() => setActiveTab('register')}
                                    >
                                        <Text className="text-base font-lufga font-normal text-app-muted">Register</Text>
                                    </Pressable>
                                )}
                            </View>

                            {/* Error */}
                            {displayError ? (
                                <View className="bg-red-50 rounded-lg px-4 py-3 mb-4 mx-4">
                                    <Text className="text-sm text-red-600 text-center">{displayError}</Text>
                                </View>
                            ) : null}

                            {/* Full Name */}
                            <View className="mb-5 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Full Name</Text>
                                <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm">
                                    <TextInput
                                        className="text-base text-slate-800"
                                        placeholder="John Doe"
                                        placeholderTextColor="#9ca3af"
                                        autoCapitalize="words"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>

                            {/* Phone Number */}
                            <View className="mb-5 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Phone Number</Text>
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

                            {/* Email (optional) */}
                            <View className="mb-5 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">
                                    Email <Text className="text-app-muted font-light">(optional)</Text>
                                </Text>
                                <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm">
                                    <TextInput
                                        className="text-base text-slate-800"
                                        placeholder="john@example.com"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            {/* Password */}
                            <View className="mb-5 mx-4">
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

                            {/* Confirm Password */}
                            <View className="mb-8 mx-4">
                                <Text className="text-base font-normal font-lufga text-slate-800 mb-2">Confirm Password</Text>
                                <View className="bg-white rounded-full px-5 h-14 justify-center shadow-sm flex-row items-center">
                                    <TextInput
                                        className="flex-1 text-base text-slate-800"
                                        placeholder="••••••••"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <Pressable onPress={() => setShowConfirmPassword(p => !p)} className="pl-2">
                                        {showConfirmPassword
                                            ? <EyeOff size={20} color="#9ca3af" />
                                            : <Eye size={20} color="#9ca3af" />
                                        }
                                    </Pressable>
                                </View>
                            </View>

                            {/* Register Button */}
                            <GradientPill
                                className="h-14 rounded-full mx-4"
                                style={{ opacity: registerMutation.isPending ? 0.6 : 1 }}
                            >
                                <Pressable
                                    className="flex-1 items-center justify-center"
                                    onPress={handleRegister}
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <Text className="text-slate-900 font-medium font-lufga text-base">Create Account</Text>
                                    )}
                                </Pressable>
                            </GradientPill>

                            {/* Divider */}
                            <View className="flex-row items-center my-6">
                                <View className="flex-1 h-px bg-slate-200" />
                                <Text className="mx-4 text-base font-lufga font-light text-[#9CA3AF]">Or Register with</Text>
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
