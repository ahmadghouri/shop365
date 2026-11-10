import { Image, Pressable, Text, View } from 'react-native';
import { Camera, Upload } from 'lucide-react-native';

type UploadTileProps = {
    label: string;
    uri: string | null;
    onPress: () => void;
    error?: string;
    icon?: 'upload' | 'camera';
};

/** Square document/photo upload tile with preview. */
export function UploadTile({ label, uri, onPress, error, icon = 'upload' }: UploadTileProps) {
    return (
        <View style={{ width: '48%' }}>
            <Pressable onPress={onPress} className="active:opacity-80">
                <View
                    className={`h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${
                        error ? 'border-red-400' : 'border-slate-300'
                    } bg-white/60`}
                >
                    {uri ? (
                        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                        <>
                            {icon === 'camera' ? (
                                <Camera size={22} color="#b77900" />
                            ) : (
                                <Upload size={22} color="#b77900" />
                            )}
                            <Text className="mt-1 px-2 text-center text-xs font-semibold text-slate-600">
                                {label}
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>
            {uri ? (
                <Text className="mt-1 text-center text-[11px] text-slate-500">{label}</Text>
            ) : null}
            {error ? <Text className="mt-1 text-center text-[11px] text-red-500">{error}</Text> : null}
        </View>
    );
}
