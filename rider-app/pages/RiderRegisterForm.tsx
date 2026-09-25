import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GradientPill } from '@/components/reusable/GradientPill';
import { UploadTile } from '@/components/reusable/UploadTile';
import { submitRiderApplication } from '@/lib/riderApplication';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    toPakistanLocal,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';

const VEHICLES = ['Bike', 'Bicycle', 'Scooter'] as const;
type Vehicle = (typeof VEHICLES)[number];

type FieldKey =
    | 'name'
    | 'phone'
    | 'cnic'
    | 'address'
    | 'vehicleNo'
    | 'cnicFront'
    | 'cnicBack'
    | 'photo'
    | 'vehiclePhoto';

// 00000-0000000-0
function formatCnic(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 13);
    return [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join('-');
}

type Props = {
    onSubmitted: () => void;
    onBackToLogin: () => void;
};

export function RiderRegisterForm({ onSubmitted, onBackToLogin }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [cnic, setCnic] = useState('');
    const [address, setAddress] = useState('');
    const [vehicle, setVehicle] = useState<Vehicle>('Bike');
    const [vehicleNo, setVehicleNo] = useState('');
    const needsVehicleNo = vehicle !== 'Bicycle';

    const [cnicFront, setCnicFront] = useState<string | null>(null);
    const [cnicBack, setCnicBack] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    const clearError = (k: FieldKey) =>
        setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

    const pick = async (setter: (uri: string) => void, key: FieldKey) => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission needed', 'Allow photo access to upload documents.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.length) return;
        setter(result.assets[0].uri);
        clearError(key);
    };

    const validate = (): boolean => {
        const next: Partial<Record<FieldKey, string>> = {};
        if (name.trim().length < 3) next.name = 'Enter your full name';
        const phoneErr = validatePakistanPhoneNumber(phone);
        if (phoneErr) next.phone = phoneErr;
        if (cnic.replace(/\D/g, '').length !== 13) next.cnic = 'CNIC must be 13 digits';
        if (address.trim().length < 10) next.address = 'Enter a complete address';
        if (needsVehicleNo && vehicleNo.trim().length < 3)
            next.vehicleNo = 'Vehicle number is required';
        if (!cnicFront) next.cnicFront = 'Required';
        if (!cnicBack) next.cnicBack = 'Required';
        if (!photo) next.photo = 'Required';
        if (!vehiclePhoto) next.vehiclePhoto = 'Required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert('Please check the form', 'Some fields need your attention.');
            return;
        }
        setSubmitting(true);
        try {
            await submitRiderApplication({
                name: name.trim(),
                phone_no: toPakistanLocal(phone),
                cnic,
                address: address.trim(),
                vehicle_type: vehicle,
                vehicle_no: needsVehicleNo ? vehicleNo.trim() : '',
                cnicFront: cnicFront!,
                cnicBack: cnicBack!,
                photo: photo!,
                vehiclePhoto: vehiclePhoto!,
            });
            Alert.alert(
                'Request submitted',
                'Your rider application has been sent for admin approval. You can log in once approved.',
                [{ text: 'Okay', onPress: onSubmitted }]
            );
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Could not submit. Please try again.';
            Alert.alert('Submission failed', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const inputBorder = (k: FieldKey) => (errors[k] ? 'border-red-400' : 'border-transparent');
    const label = 'mb-2 mt-4 text-sm font-semibold text-slate-900';
    const input = 'rounded-2xl bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm border';

    return (
        <View>
            <Text className="mb-1 text-center text-lg font-semibold text-slate-800">
                Become a Rider
            </Text>
            <Text className="mb-4 text-center text-xs font-light text-app-muted">
                Submit your details for admin approval.
            </Text>

            <Text className={label.replace('mt-4', 'mt-0')}>Full Name</Text>
            <TextInput
                value={name}
                onChangeText={(v) => {
                    setName(v);
                    clearError('name');
                }}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                className={`${input} ${inputBorder('name')}`}
            />
            {errors.name ? <Text className="mt-1 text-xs text-red-500">{errors.name}</Text> : null}

            <Text className={label}>Phone Number</Text>
            <View
                className={`flex-row items-center rounded-2xl bg-white px-4 shadow-sm border ${inputBorder(
                    'phone'
                )}`}
            >
                <Text className="border-r border-slate-200 pr-3 text-base font-semibold text-slate-700">
                    +92
                </Text>
                <TextInput
                    value={formatPakistanPhoneNumber(phone).replace(/^\+92\s?/, '')}
                    onChangeText={(v) => {
                        setPhone(sanitizePakistanPhoneDigits(v));
                        clearError('phone');
                    }}
                    placeholder="300 1234567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="flex-1 py-3.5 pl-3 text-base text-slate-900"
                />
            </View>
            {errors.phone ? (
                <Text className="mt-1 text-xs text-red-500">{errors.phone}</Text>
            ) : null}

            <Text className={label}>CNIC Number</Text>
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
                className={`${input} ${inputBorder('cnic')}`}
            />
            {errors.cnic ? <Text className="mt-1 text-xs text-red-500">{errors.cnic}</Text> : null}
            <Text className="mt-1 text-[11px] font-light text-app-muted">
                Your CNIC will be your login password once approved.
            </Text>

            <Text className={label}>Address</Text>
            <TextInput
                value={address}
                onChangeText={(v) => {
                    setAddress(v);
                    clearError('address');
                }}
                placeholder="Enter your full address"
                placeholderTextColor="#94a3b8"
                multiline
                className={`${input} ${inputBorder('address')}`}
            />
            {errors.address ? (
                <Text className="mt-1 text-xs text-red-500">{errors.address}</Text>
            ) : null}

            <Text className={label}>Vehicle Type</Text>
            <View className="flex-row" style={{ gap: 8 }}>
                {VEHICLES.map((v) => {
                    const selected = vehicle === v;
                    return (
                        <Pressable
                            key={v}
                            onPress={() => {
                                setVehicle(v);
                                if (v === 'Bicycle') clearError('vehicleNo');
                            }}
                            className={`flex-1 items-center justify-center rounded-2xl border py-3 active:opacity-80 ${
                                selected
                                    ? 'border-[#EAB308] bg-amber-50'
                                    : 'border-slate-200 bg-white'
                            }`}
                        >
                            <Text
                                className={`text-sm font-semibold ${
                                    selected ? 'text-amber-700' : 'text-slate-600'
                                }`}
                            >
                                {v}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {needsVehicleNo ? (
                <>
                    <Text className={label}>Vehicle Number</Text>
                    <TextInput
                        value={vehicleNo}
                        onChangeText={(v) => {
                            setVehicleNo(v.toUpperCase());
                            clearError('vehicleNo');
                        }}
                        placeholder="e.g. ABC-123"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        className={`${input} ${inputBorder('vehicleNo')}`}
                    />
                    {errors.vehicleNo ? (
                        <Text className="mt-1 text-xs text-red-500">{errors.vehicleNo}</Text>
                    ) : null}
                </>
            ) : null}

            <Text className={label}>Documents & Photos</Text>
            <View className="flex-row flex-wrap justify-between" style={{ rowGap: 12 }}>
                <UploadTile
                    label="CNIC Front"
                    uri={cnicFront}
                    error={errors.cnicFront}
                    onPress={() => pick(setCnicFront, 'cnicFront')}
                />
                <UploadTile
                    label="CNIC Back"
                    uri={cnicBack}
                    error={errors.cnicBack}
                    onPress={() => pick(setCnicBack, 'cnicBack')}
                />
                <UploadTile
                    label="Your Photo"
                    uri={photo}
                    icon="camera"
                    error={errors.photo}
                    onPress={() => pick(setPhoto, 'photo')}
                />
                <UploadTile
                    label="Vehicle Photo"
                    uri={vehiclePhoto}
                    error={errors.vehiclePhoto}
                    onPress={() => pick(setVehiclePhoto, 'vehiclePhoto')}
                />
            </View>

            <GradientPill className="mt-6 h-14 rounded-full" style={{ opacity: submitting ? 0.6 : 1 }}>
                <Pressable
                    className="flex-1 items-center justify-center"
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-base font-medium text-slate-900">
                            Submit Application
                        </Text>
                    )}
                </Pressable>
            </GradientPill>

            <Pressable onPress={onBackToLogin} className="mt-4 items-center">
                <Text className="text-sm text-app-muted">
                    Already approved? <Text className="font-semibold text-app-dark">Login</Text>
                </Text>
            </Pressable>
        </View>
    );
}
