import { useState } from 'react';
import {
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Bike, Send } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useAuthStore } from '@/lib/authStore';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    toPakistanE164,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';
import { useSubmitRiderApplication } from '@/api/riders/useSubmitRiderApplication';
import { FieldError } from './FormBits';
import { UploadTile } from './UploadTile';
import { formatCnic, VEHICLES, type FieldKey, type Vehicle } from './riderFormUtils';

type Props = {
    refreshing: boolean;
    onRefresh: () => void;
};

/** The full "Become a Rider" application form. */
export function RiderApplicationForm({ refreshing, onRefresh }: Props) {
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
    const [cnic, setCnic] = useState('');
    const [address, setAddress] = useState('');
    const [vehicle, setVehicle] = useState<Vehicle>('Bike');
    const [vehicleNo, setVehicleNo] = useState('');
    // Bicycles have no registration number.
    const needsVehicleNo = vehicle !== 'Bicycle';

    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
    const clearError = (key: FieldKey) =>
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

    const submitMutation = useSubmitRiderApplication();
    const submitting = submitMutation.isPending;
    const queryClient = useQueryClient();

    // Uploaded document/photo URIs
    const [cnicFront, setCnicFront] = useState<string | null>(null);
    const [cnicBack, setCnicBack] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

    const pickImage = async (setter: (uri: string) => void, key?: FieldKey) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Allow photo library access to upload your documents.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.length) return;
        setter(result.assets[0].uri);
        if (key) clearError(key);
    };

    // Validate every field and collect messages. Returns true when all pass.
    const validate = (): boolean => {
        const next: Partial<Record<FieldKey, string>> = {};

        const trimmedName = name.trim();
        if (!trimmedName) next.name = 'Name is required';
        else if (trimmedName.length < 3) next.name = 'Enter your full name (min 3 characters)';
        else if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) next.name = 'Name can only contain letters';

        const phoneError = validatePakistanPhoneNumber(phone);
        if (phoneError) next.phone = phoneError;

        const cnicDigits = cnic.replace(/\D/g, '');
        if (!cnicDigits) next.cnic = 'CNIC is required';
        else if (cnicDigits.length !== 13) next.cnic = 'CNIC must be 13 digits';

        const trimmedAddress = address.trim();
        if (!trimmedAddress) next.address = 'Address is required';
        else if (trimmedAddress.length < 10) next.address = 'Please enter a more complete address';

        const trimmedVehicleNo = vehicleNo.trim();
        if (needsVehicleNo) {
            if (!trimmedVehicleNo) next.vehicleNo = 'Vehicle number is required';
            else if (trimmedVehicleNo.length < 3) next.vehicleNo = 'Enter a valid vehicle number';
        }

        if (!cnicFront) next.cnicFront = 'Upload CNIC front';
        if (!cnicBack) next.cnicBack = 'Upload CNIC back';
        if (!photo) next.photo = 'Upload your photo';
        if (!vehiclePhoto) next.vehiclePhoto = 'Upload a vehicle photo';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert('Please check the form', 'Some fields need your attention.');
            return;
        }
        try {
            await submitMutation.mutateAsync({
                name: name.trim(),
                phone_no: toPakistanE164(phone),
                cnic,
                address: address.trim(),
                vehicle_type: vehicle,
                vehicle_no: needsVehicleNo ? vehicleNo.trim() : '',
                cnicFront: cnicFront!,
                cnicBack: cnicBack!,
                photo: photo!,
                vehiclePhoto: vehiclePhoto!,
            });
            await queryClient.invalidateQueries({ queryKey: ['riderApplication', 'me'] });
            Alert.alert(
                'Request submitted',
                'Thanks for applying as a rider. Our team will review your request within 2–3 working days.'
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                'Your application could not be submitted. Please try again.';
            Alert.alert('Submission failed', message);
        }
    };

    const inputBorder = (key: FieldKey) => (errors[key] ? 'border-red-400' : 'border-transparent');

    return (
        <>
            <ScrollView
                className={`flex-1 ${px}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#EAB308"
                        colors={['#EAB308']}
                    />
                }
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
                    onChangeText={(v) => {
                        setName(v);
                        clearError('name');
                    }}
                    placeholder="Enter your name"
                    placeholderTextColor="#94a3b8"
                    className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${inputBorder('name')}`}
                />
                <FieldError message={errors.name} />

                {/* Phone */}
                <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                    Phone Number
                </Text>
                <View
                    className={`flex-row items-center rounded-3xl bg-white px-4 py-1 shadow-sm shadow-slate-200 border ${inputBorder('phone')}`}
                >
                    <Text
                        className={`border-r border-slate-200 pr-3 ${inputText} font-lufga-semibold text-slate-700`}
                    >
                        +92
                    </Text>
                    <TextInput
                        value={formatPakistanPhoneNumber(phone).replace(/^\+92\s?/, '')}
                        onChangeText={(value) => {
                            setPhone(sanitizePakistanPhoneDigits(value));
                            clearError('phone');
                        }}
                        placeholder="300 1234567"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        className={`flex-1 px-3 py-3 ${inputText} font-lufga text-slate-900`}
                    />
                </View>
                <FieldError message={errors.phone} />

                {/* CNIC */}
                <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                    CNIC Number
                </Text>
                <TextInput
                    value={cnic}
                    onChangeText={(v) => {
                        setCnic(formatCnic(v));
                        clearError('cnic');
                    }}
                    placeholder="42101-1234567-1"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={15}
                    className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${inputBorder('cnic')}`}
                />
                <FieldError message={errors.cnic} />

                {/* Address */}
                <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                    Address
                </Text>
                <TextInput
                    value={address}
                    onChangeText={(v) => {
                        setAddress(v);
                        clearError('address');
                    }}
                    placeholder="Enter your full address"
                    placeholderTextColor="#94a3b8"
                    multiline
                    className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${inputBorder('address')}`}
                />
                <FieldError message={errors.address} />

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
                                onPress={() => {
                                    setVehicle(v);
                                    if (v === 'Bicycle') clearError('vehicleNo');
                                }}
                                className={`flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-80 ${selected ? 'border-[#EAB308] bg-amber-50' : 'border-slate-200 bg-white'
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

                {/* Vehicle number (not needed for bicycles) */}
                {needsVehicleNo && (
                    <>
                        <Text
                            className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}
                        >
                            Vehicle Number
                        </Text>
                        <TextInput
                            value={vehicleNo}
                            onChangeText={(v) => {
                                setVehicleNo(v.toUpperCase());
                                clearError('vehicleNo');
                            }}
                            placeholder="e.g. ABC-123"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="characters"
                            className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${inputBorder('vehicleNo')}`}
                        />
                        <FieldError message={errors.vehicleNo} />
                    </>
                )}

                {/* Documents & photos */}
                <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                    Documents & Photos
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: vehicleGap }}>
                    <UploadTile
                        label="CNIC Front"
                        uri={cnicFront}
                        error={errors.cnicFront}
                        onPress={() => pickImage(setCnicFront, 'cnicFront')}
                    />
                    <UploadTile
                        label="CNIC Back"
                        uri={cnicBack}
                        error={errors.cnicBack}
                        onPress={() => pickImage(setCnicBack, 'cnicBack')}
                    />
                    <UploadTile
                        label="Your Photo"
                        uri={photo}
                        icon="camera"
                        error={errors.photo}
                        onPress={() => pickImage(setPhoto, 'photo')}
                    />
                    <UploadTile
                        label="Vehicle Photo"
                        uri={vehiclePhoto}
                        error={errors.vehiclePhoto}
                        onPress={() => pickImage(setVehiclePhoto, 'vehiclePhoto')}
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
        </>
    );
}
