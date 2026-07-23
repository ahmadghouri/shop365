import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterMutation } from '@/lib/mutations/useRegisterMutation';

type RegisterScreenProps = {
    onSuccess?: () => void;
    onLogin?: () => void;
};

export function RegisterScreen({ onSuccess, onLogin }: RegisterScreenProps) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState('');

    const registerMutation = useRegisterMutation();

    const handleRegister = async () => {
        setValidationError('');

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
        if (!termsAccepted) {
            setValidationError('Please accept Terms and Conditions');
            return;
        }

        registerMutation.mutate(
            { phone_no: phone, password },
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
        || 'Registration failed. Check your connection.'
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
                            Create an Account
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
                        <View className="mb-4">
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

                        {/* Confirm Password */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-slate-800 mb-2">Confirm Password</Text>
                            <View className="flex-row items-center border border-slate-300 rounded-lg bg-white px-4 h-12">
                                <TextInput
                                    className="flex-1 h-12 text-base text-slate-800"
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Text className="text-sm text-slate-500">{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Terms */}
                        <Pressable
                            className="flex-row items-center mb-6"
                            onPress={() => setTermsAccepted(!termsAccepted)}
                        >
                            <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${termsAccepted ? 'bg-yellow-500 border-yellow-500' : 'border-slate-300 bg-white'}`}>
                                {termsAccepted && <Text className="text-white text-xs font-bold">✓</Text>}
                            </View>
                            <Text className="text-sm text-slate-700">
                                I accept the <Text className="text-yellow-600 font-semibold">Terms and Conditions</Text>
                            </Text>
                        </Pressable>

                        {/* Button */}
                        <Pressable
                            className={`w-full rounded-lg h-12 items-center justify-center ${registerMutation.isPending ? 'bg-yellow-400' : 'bg-yellow-500 active:bg-yellow-600'}`}
                            onPress={handleRegister}
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-base">Create an Account</Text>
                            )}
                        </Pressable>

                        {/* Login link */}
                        <View className="mt-5 items-center">
                            <Text className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Text className="text-yellow-600 font-semibold" onPress={onLogin}>Log In</Text>
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
