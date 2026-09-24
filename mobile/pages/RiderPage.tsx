import { useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Bike, Camera, Send, Upload } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useAuthStore } from '@/lib/authStore';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';

// Format raw digits into the Pakistani CNIC pattern: 00000-0000000-0
function formatCnic(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)].filter(Boolean);
    return parts.join('-');
}

type RiderPageProps = {
    onBack: () => void;
};

const VEHICLES = ['Bike', 'Bicycle', 'Scooter'] as const;
type Vehicle = (typeof VEHICLES)[number];

export function RiderPage({ onBack }: RiderPageProps) {
    const { user } = useAuthStore();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    // Responsive tokens (match the rest of the app's breakpoints).
    const px = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const inputPy = isTinyScreen ? 'py-3' : 'py-4';
    const inputText = isTinyScreen ? 'text-sm' : 'text-base';
    const labelText = isTinyScreen ? 'text-[13px]' : 'text-sm';
    const labelGap = isTinyScreen ? 'mt-3' : 'mt-4';
    const heroPad = isTinyScreen ? 'p-4' : 'p-5';
    const heroIconBox = isTinyScreen ? 'h-12 w-12' : 'h-14 w-14';
    const heroIconSize = isTinyScreen ? 22 : 26;
    const heroTitle = isTinyScreen ? 'text-base' : 'text-lg';
    const vehicleGap = isTinyScreen ? 8 : 10;
    const submitH = isTinyScreen ? 'h-11' : 'h-12';

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(sanitizePakistanPhoneDigits(user?.phone_no || ''));
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [cnic, setCnic] = useState('');
    const [address, setAddress] = useState('');
    const [vehicle, setVehicle] = useState<Vehicle>('Bike');
    const [submitting, setSubmitting] = useState(false);

    // Uploaded document/photo URIs
    const [cnicFront, setCnicFront] = useState<string | null>(null);
    const [cnicBack, setCnicBack] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

    const pickImage = async (setter: (uri: string) => void) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                'Permission needed',
                'Allow photo library access to upload your documents.'
            );
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.length) return;
        setter(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        const phoneValidation = validatePakistanPhoneNumber(phone);
        if (phoneValidation) {
            setPhoneError(phoneValidation);
            return;
        }
        if (!name.trim() || cnic.replace(/\D/g, '').length !== 13 || !address.trim()) {
            Alert.alert(
                'Missing information',
                'Please fill in your name, a valid 13-digit CNIC and address.'
            );
            return;
        }
        if (!cnicFront || !cnicBack || !photo || !vehiclePhoto) {
            Alert.alert(
                'Upload required',
                'Please upload your CNIC (front & back), your photo and a vehicle photo.'
            );
            return;
        }

        setSubmitting(true);
        try {
            // No backend endpoint yet — acknowledge the application locally.
            await new Promise((resolve) => setTimeout(resolve, 600));
            Alert.alert(
                'Application submitted',
                'Thanks for applying as a rider. Our team will review your details and get back to you.',
                [{ text: 'OK', onPress: onBack }]
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                <PageHeader
                    title="Become a Rider"
                    subtitle="Deliver orders and earn on your own schedule"
                    onBack={onBack}
                />

                <ScrollView
                    className={`flex-1 ${px}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Hero */}
                    <View
                        className={`mt-2 mb-5 flex-row items-center rounded-[28px] bg-[#1D1D1D] ${heroPad}`}
                    >
                        <GradientPill className={`${heroIconBox} rounded-2xl shrink-0`}>
                            <View className="h-full w-full items-center justify-center">
                                <Bike size={heroIconSize} color="#171717" />
                            </View>
                        </GradientPill>
                        <View className="ml-4 flex-1 min-w-0">
                            <Text className={`${heroTitle} font-lufga-bold text-white`}>
                                Join as a Rider
                            </Text>
                            <Text className="mt-0.5 text-xs font-lufga text-slate-300">
                                Flexible hours, weekly payouts.
                            </Text>
                        </View>
                    </View>

                    {/* Full name */}
                    <Text className={`mb-2 ${labelText} font-lufga-semibold text-slate-900`}>
                        Full Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor="#94a3b8"
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200`}
                    />

                    {/* Phone */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        Phone Number
                    </Text>
                    <View className="flex-row items-center rounded-3xl bg-white px-4 py-1 shadow-sm shadow-slate-200">
                        <Text
                            className={`border-r border-slate-200 pr-3 ${inputText} font-lufga-semibold text-slate-700`}
                        >
                            +92
                        </Text>
                        <TextInput
                            value={formatPakistanPhoneNumber(phone).replace(/^\+92\s?/, '')}
                            onChangeText={(value) => {
                                setPhone(sanitizePakistanPhoneDigits(value));
                                setPhoneError(null);
                            }}
                            placeholder="300 1234567"
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                            className={`flex-1 px-3 py-3 ${inputText} font-lufga text-slate-900`}
                        />
                    </View>
                    {phoneError && (
                        <Text className="mt-1 px-2 text-sm font-lufga text-red-500">{phoneError}</Text>
                    )}

                    {/* CNIC */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        CNIC Number
                    </Text>
                    <TextInput
                        value={cnic}
                        onChangeText={(v) => setCnic(formatCnic(v))}
                        placeholder="42101-1234567-1"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        maxLength={15}
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200`}
                    />

                    {/* Address */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        Address
                    </Text>
                    <TextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Enter your full address"
                        placeholderTextColor="#94a3b8"
                        multiline
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200`}
                    />

                    {/* Vehicle type */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        Vehicle Type
                    </Text>
                    <View className="flex-row" style={{ gap: vehicleGap }}>
                        {VEHICLES.map((v) => {
                            const selected = vehicle === v;
                            return (
                                <Pressable
                                    key={v}
                                    onPress={() => setVehicle(v)}
                                    className={`flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-80 ${
                                        selected
                                            ? 'border-[#EAB308] bg-amber-50'
                                            : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    <Text
                                        className={`${labelText} font-lufga-semibold ${selected ? 'text-amber-700' : 'text-slate-600'}`}
                                    >
                                        {v}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Documents & photos */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        Documents & Photos
                    </Text>
                    <View className="flex-row flex-wrap" style={{ gap: vehicleGap }}>
                        <UploadTile
                            label="CNIC Front"
                            uri={cnicFront}
                            onPress={() => pickImage(setCnicFront)}
                        />
                        <UploadTile
                            label="CNIC Back"
                            uri={cnicBack}
                            onPress={() => pickImage(setCnicBack)}
                        />
                        <UploadTile
                            label="Your Photo"
                            uri={photo}
                            icon="camera"
                            onPress={() => pickImage(setPhoto)}
                        />
                        <UploadTile
                            label="Vehicle Photo"
                            uri={vehiclePhoto}
                            onPress={() => pickImage(setVehiclePhoto)}
                        />
                    </View>
                </ScrollView>

                {/* Submit */}
                <View className={`${px} pb-3 pt-2`}>
                    <GradientPill className={`${submitH} rounded-full`}>
                        <Pressable
                            className="flex-1 flex-row items-center justify-center active:opacity-80"
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Send size={18} color="#171717" />
                            <Text className="ml-2 text-base font-lufga-bold text-slate-950">
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}

type UploadTileProps = {
    label: string;
    uri: string | null;
    onPress: () => void;
    icon?: 'upload' | 'camera';
};

/** A square upload slot: shows the picked image, or a dashed placeholder. */
function UploadTile({ label, uri, onPress, icon = 'upload' }: UploadTileProps) {
    const Icon = icon === 'camera' ? Camera : Upload;
    return (
        <Pressable
            onPress={onPress}
            // Two per row (48% leaves room for the gap)
            style={{ width: '48%' }}
            className="active:opacity-80"
        >
            <View className="aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white">
                {uri ? (
                    <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <>
                        <Icon size={22} color="#b77900" />
                        <Text className="mt-2 px-2 text-center text-xs font-lufga-semibold text-slate-500">
                            {label}
                        </Text>
                    </>
                )}
            </View>
            {uri ? (
                <Text className="mt-1 text-center text-[11px] font-lufga-semibold text-amber-700">
                    {label} ✓
                </Text>
            ) : null}
        </Pressable>
    );
}
