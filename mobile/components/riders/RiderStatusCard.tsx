import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CheckCircle2, Clock, Send, Upload, XCircle } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useReuploadRiderDocuments } from '@/api/riders/useReuploadRiderDocuments';
import type { RiderApplication } from '@/api/riders/riderApplication.service';
import { DetailRow } from './FormBits';
import { DOC_LABELS } from './riderFormUtils';

type Props = {
    application: RiderApplication;
    px: string;
};

/** Shown when the user has already applied — reflects their request status. */
export function RiderStatusCard({ application, px }: Props) {
    const status = application.status;

    // Documents the admin asked to be re-uploaded.
    const resendDocs = Object.entries(application.documents ?? {})
        .filter(([, d]) => d?.status === 'resend')
        .map(([key, d]) => ({ key, label: DOC_LABELS[key] ?? key, note: d?.note }));

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
            resendDocs.filter((d) => reuploads[d.key]).map((d) => [d.key, reuploads[d.key]])
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

            {/* Approved → simple rider dashboard with the rider's details */}
            {status === 'approved' && (
                <View className="mt-6 w-full">
                    <View className="flex-row items-center rounded-2xl bg-[#1D1D1D] p-4">
                        <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                            {application.photo_image ? (
                                <Image
                                    source={{ uri: application.photo_image }}
                                    className="h-12 w-12"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-xs font-lufga text-slate-300">Rider</Text>
                            )}
                        </View>
                        <View className="ml-3 flex-1 min-w-0">
                            <Text className="text-sm font-lufga-bold text-white" numberOfLines={1}>
                                {application.name}
                            </Text>
                            <View className="mt-0.5 flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-green-400" />
                                <Text className="ml-1.5 text-xs font-lufga text-green-300">
                                    Active Rider
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <DetailRow label="Phone" value={application.phone_no} />
                        <DetailRow label="CNIC" value={application.cnic} />
                        <DetailRow label="Vehicle" value={application.vehicle_type} />
                        <DetailRow label="Address" value={application.address} last />
                    </View>
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
