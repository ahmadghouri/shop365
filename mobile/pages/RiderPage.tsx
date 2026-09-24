import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Bike, Camera, CheckCircle2, Clock, Send, Upload, XCircle } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useAuthStore } from '@/lib/authStore';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    toPakistanE164,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';
import { useSubmitRiderApplication } from '@/api/riders/useSubmitRiderApplication';
import { useMyRiderApplication } from '@/api/riders/useMyRiderApplication';
import { useReuploadRiderDocuments } from '@/api/riders/useReuploadRiderDocuments';
import type { RiderApplication } from '@/api/riders/riderApplication.service';

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
    const [cnic, setCnic] = useState('');
    const [address, setAddress] = useState('');
    const [vehicle, setVehicle] = useState<Vehicle>('Bike');

    // Field-level validation errors keyed by field name.
    type FieldKey =
        | 'name'
        | 'phone'
        | 'cnic'
        | 'address'
        | 'cnicFront'
        | 'cnicBack'
        | 'photo'
        | 'vehiclePhoto';
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
    const clearError = (key: FieldKey) =>
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    const submitMutation = useSubmitRiderApplication();
    const submitting = submitMutation.isPending;
    const queryClient = useQueryClient();
    const {
        data: myApplication,
        isLoading: loadingApplication,
        refetch,
        isRefetching,
    } = useMyRiderApplication();

    // Uploaded document/photo URIs
    const [cnicFront, setCnicFront] = useState<string | null>(null);
    const [cnicBack, setCnicBack] = useState<string | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

    const pickImage = async (setter: (uri: string) => void, key?: FieldKey) => {
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
        if (key) clearError(key);
    };

    // Validate every field and collect messages. Returns true when all pass.
    const validate = (): boolean => {
        const next: Partial<Record<FieldKey, string>> = {};

        const trimmedName = name.trim();
        if (!trimmedName) next.name = 'Name is required';
        else if (trimmedName.length < 3) next.name = 'Enter your full name (min 3 characters)';
        else if (!/^[a-zA-Z\s.]+$/.test(trimmedName))
            next.name = 'Name can only contain letters';

        const phoneError = validatePakistanPhoneNumber(phone);
        if (phoneError) next.phone = phoneError;

        const cnicDigits = cnic.replace(/\D/g, '');
        if (!cnicDigits) next.cnic = 'CNIC is required';
        else if (cnicDigits.length !== 13) next.cnic = 'CNIC must be 13 digits';

        const trimmedAddress = address.trim();
        if (!trimmedAddress) next.address = 'Address is required';
        else if (trimmedAddress.length < 10)
            next.address = 'Please enter a more complete address';

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
                cnicFront: cnicFront!,
                cnicBack: cnicBack!,
                photo: photo!,
                vehiclePhoto: vehiclePhoto!,
            });
            // Refresh the "my application" status so the page swaps to the
            // submitted/pending state.
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

    // While we check for an existing application, show a spinner.
    if (loadingApplication) {
        return (
            <AppBackground>
                <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                    <PageHeader title="Become a Rider" onBack={onBack} />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                </SafeAreaView>
            </AppBackground>
        );
    }

    // If the user already applied, show the status instead of the form.
    if (myApplication) {
        return (
            <AppBackground>
                <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                    <PageHeader title="Rider Application" onBack={onBack} />
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        <RiderStatusCard application={myApplication} px={px} />
                    </ScrollView>
                </SafeAreaView>
            </AppBackground>
        );
    }

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
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
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
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${errors.name ? 'border-red-400' : 'border-transparent'}`}
                    />
                    <FieldError message={errors.name} />

                    {/* Phone */}
                    <Text className={`mb-2 ${labelGap} ${labelText} font-lufga-semibold text-slate-900`}>
                        Phone Number
                    </Text>
                    <View
                        className={`flex-row items-center rounded-3xl bg-white px-4 py-1 shadow-sm shadow-slate-200 border ${errors.phone ? 'border-red-400' : 'border-transparent'}`}
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
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${errors.cnic ? 'border-red-400' : 'border-transparent'}`}
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
                        className={`rounded-3xl bg-white px-4 ${inputPy} ${inputText} font-lufga text-slate-900 shadow-sm shadow-slate-200 border ${errors.address ? 'border-red-400' : 'border-transparent'}`}
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
            </SafeAreaView>
        </AppBackground>
    );
}

type RiderStatusCardProps = {
    application: RiderApplication;
    px: string;
};

const DOC_LABELS: Record<string, string> = {
    cnic_front_image: 'CNIC Front',
    cnic_back_image: 'CNIC Back',
    photo_image: 'Your Photo',
    vehicle_image: 'Vehicle Photo',
};

/** Shown when the user has already applied — reflects their request status. */
function RiderStatusCard({ application, px }: RiderStatusCardProps) {
    const status = application.status;

    // Documents the admin asked to be re-uploaded.
    const resendDocs = Object.entries(application.documents ?? {})
        .filter(([, d]) => d?.status === 'resend')
        .map(([key, d]) => ({ key, label: DOC_LABELS[key] ?? key, note: d?.note }));

    // Local state for newly picked re-upload images (field -> uri).
    const [reuploads, setReuploads] = useState<Record<string, string>>({});
    const reuploadMutation = useReuploadRiderDocuments();

    const pickReupload = async (field: string) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Allow photo library access to upload documents.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.length) return;
        setReuploads((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    };

    const handleResubmit = async () => {
        const picked = Object.fromEntries(
            resendDocs
                .filter((d) => reuploads[d.key])
                .map((d) => [d.key, reuploads[d.key]])
        );
        if (Object.keys(picked).length === 0) {
            Alert.alert('Add documents', 'Please pick the requested document(s) first.');
            return;
        }
        try {
            await reuploadMutation.mutateAsync(picked);
            setReuploads({});
            Alert.alert('Submitted', 'Your documents have been re-submitted for review.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                'Could not submit your documents. Please try again.';
            Alert.alert('Submission failed', message);
        }
    };

    const config = {
        pending: {
            Icon: Clock,
            color: '#EAB308',
            title: 'Request submitted',
            message:
                'Thanks for applying as a rider. Our team is reviewing your request and will get back to you within 2–3 working days.',
        },
        approved: {
            Icon: CheckCircle2,
            color: '#16a34a',
            title: 'You are approved!',
            message: 'Your rider application has been approved. Welcome aboard!',
        },
        rejected: {
            Icon: XCircle,
            color: '#ef4444',
            title: 'Application not approved',
            message:
                'Unfortunately your rider application was not approved this time. You may contact support for more details.',
        },
    }[status];

    const { Icon } = config;

    return (
        <View className={`flex-1 items-center ${px} pt-10`}>
            <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: `${config.color}22` }}
            >
                <Icon size={40} color={config.color} />
            </View>
            <Text className="mt-5 text-xl font-lufga-bold text-slate-900">{config.title}</Text>
            <Text className="mt-2 text-center text-sm font-lufga text-slate-500">
                {config.message}
            </Text>
            {status === 'pending' && resendDocs.length === 0 && (
                <View className="mt-5 rounded-full bg-amber-50 px-4 py-2">
                    <Text className="text-xs font-lufga-semibold text-amber-700">
                        Status: Under review · 2–3 working days
                    </Text>
                </View>
            )}

            {/* Documents the admin asked to re-upload */}
            {resendDocs.length > 0 && (
                <View className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <View className="flex-row items-center">
                        <Upload size={16} color="#b45309" />
                        <Text className="ml-2 text-sm font-lufga-bold text-amber-800">
                            Re-upload requested
                        </Text>
                    </View>
                    <Text className="mt-1 text-xs font-lufga text-amber-700">
                        Please upload these documents again:
                    </Text>

                    {resendDocs.map((d) => (
                        <View key={d.key} className="mt-3">
                            <Text className="text-sm font-lufga-semibold text-slate-800">
                                {d.label}
                            </Text>
                            {d.note ? (
                                <Text className="text-xs font-lufga text-slate-500">{d.note}</Text>
                            ) : null}
                            <Pressable
                                onPress={() => pickReupload(d.key)}
                                className="mt-2 active:opacity-80"
                            >
                                <View className="h-32 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-amber-300 bg-white">
                                    {reuploads[d.key] ? (
                                        <Image
                                            source={{ uri: reuploads[d.key] }}
                                            className="h-full w-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <>
                                            <Upload size={20} color="#b45309" />
                                            <Text className="mt-1 text-xs font-lufga-semibold text-amber-700">
                                                Tap to upload {d.label}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    ))}

                    <Pressable
                        onPress={handleResubmit}
                        disabled={reuploadMutation.isPending}
                        className="mt-4 active:opacity-80"
                    >
                        <GradientPill className="h-11 rounded-full">
                            <View className="flex-1 flex-row items-center justify-center">
                                <Send size={16} color="#171717" />
                                <Text className="ml-2 text-sm font-lufga-bold text-slate-950">
                                    {reuploadMutation.isPending
                                        ? 'Submitting...'
                                        : 'Re-submit Documents'}
                                </Text>
                            </View>
                        </GradientPill>
                    </Pressable>
                </View>
            )}

            {/* A message from the admin, if any */}
            {application.admin_message ? (
                <View className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4">
                    <Text className="text-xs font-lufga-semibold text-slate-400">
                        Message from admin
                    </Text>
                    <Text className="mt-1 text-sm font-lufga text-slate-700">
                        {application.admin_message}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

type UploadTileProps = {
    label: string;
    uri: string | null;
    onPress: () => void;
    icon?: 'upload' | 'camera';
    error?: string;
};

/** A square upload slot: shows the picked image, or a dashed placeholder. */
function UploadTile({ label, uri, onPress, icon = 'upload', error }: UploadTileProps) {
    const Icon = icon === 'camera' ? Camera : Upload;
    return (
        <Pressable
            onPress={onPress}
            // Two per row (48% leaves room for the gap)
            style={{ width: '48%' }}
            className="active:opacity-80"
        >
            <View
                className={`aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white ${error ? 'border-red-400' : 'border-slate-300'}`}
            >
                {uri ? (
                    <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <>
                        <Icon size={22} color={error ? '#ef4444' : '#b77900'} />
                        <Text
                            className={`mt-2 px-2 text-center text-xs font-lufga-semibold ${error ? 'text-red-500' : 'text-slate-500'}`}
                        >
                            {label}
                        </Text>
                    </>
                )}
            </View>
            {uri ? (
                <Text className="mt-1 text-center text-[11px] font-lufga-semibold text-amber-700">
                    {label} ✓
                </Text>
            ) : error ? (
                <Text className="mt-1 text-center text-[11px] font-lufga text-red-500">{error}</Text>
            ) : null}
        </Pressable>
    );
}

/** Small inline error text shown under a form field. */
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <Text className="mt-1 px-2 text-xs font-lufga text-red-500">{message}</Text>;
}
