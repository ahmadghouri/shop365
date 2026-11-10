import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Navigation } from 'lucide-react-native';

type MapCardProps = {
    height?: number;
    /** Floating GPS button press. */
    onRecenter?: () => void;
    label?: string;
};

/**
 * Stylised map illustration (not a real GPS map — no map library installed).
 * Drawn with react-native-svg using the app's palette. Shows the rider marker,
 * a couple of order/restaurant markers and a route.
 */
export function MapCard({ height = 180, onRecenter, label = 'Your location' }: MapCardProps) {
    const W = 340;
    const H = height;

    return (
        <View
            className="overflow-hidden rounded-3xl border border-white"
            style={{ height }}
        >
            <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
                <Rect x={0} y={0} width={W} height={H} fill="#E9EDE9" />
                {/* streets */}
                {[0.28, 0.6, 0.85].map((f) => (
                    <Rect key={`h${f}`} x={0} y={H * f} width={W} height={5} fill="#F4F6F3" />
                ))}
                {[0.25, 0.55, 0.8].map((f) => (
                    <Rect key={`v${f}`} x={W * f} y={0} width={5} height={H} fill="#F4F6F3" />
                ))}
                {/* blocks */}
                <Rect x={W * 0.08} y={H * 0.34} width={W * 0.2} height={H * 0.16} rx={8} fill="#DDE6DB" />
                <Rect x={W * 0.62} y={H * 0.5} width={W * 0.24} height={H * 0.18} rx={8} fill="#DDE6DB" />
                {/* route */}
                <Path
                    d={`M ${W * 0.2} ${H * 0.78} C ${W * 0.35} ${H * 0.6}, ${W * 0.45} ${H * 0.5}, ${W * 0.62} ${H * 0.38}`}
                    stroke="#1A1A1A"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="1 9"
                />
                {/* order markers */}
                <Circle cx={W * 0.62} cy={H * 0.38} r={7} fill="#EAB308" stroke="#fff" strokeWidth={2} />
                <Circle cx={W * 0.82} cy={H * 0.7} r={6} fill="#EAB308" stroke="#fff" strokeWidth={2} />
                {/* rider marker */}
                <Circle cx={W * 0.2} cy={H * 0.78} r={12} fill="#1A1A1A" />
                <Circle cx={W * 0.2} cy={H * 0.78} r={4} fill="#fff" />
            </Svg>

            {/* location label */}
            <View className="absolute left-3 top-3 flex-row items-center rounded-full bg-white/90 px-3 py-1.5">
                <View className="h-2 w-2 rounded-full bg-[#EAB308]" />
                <Text className="ml-2 text-xs font-semibold text-slate-700">{label}</Text>
            </View>

            {/* floating GPS button */}
            <Pressable
                onPress={onRecenter}
                className="absolute bottom-3 right-3 h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
                style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 4,
                }}
            >
                <Navigation size={20} color="#EAB308" />
            </Pressable>
        </View>
    );
}
