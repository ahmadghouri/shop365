import { Image, Pressable, Text, View } from 'react-native';
import { Camera, Upload } from 'lucide-react-native';

type UploadTileProps = {
    label: string;
    uri: string | null;
    onPress: () => void;
    icon?: 'upload' | 'camera';
    error?: string;
};

/** A square upload slot: shows the picked image, or a dashed placeholder. */
export function UploadTile({ label, uri, onPress, icon = 'upload', error }: UploadTileProps) {
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
