import { View } from 'react-native';
import { Motorbike } from 'lucide-react-native';
const ACCENT = '#EAB308';
const ACCENT_DARK = '#111827';

const HALO = 38;
const DOT = 28;

/**
 * Live rider marker: a small dark disc with a yellow motorbike, white edge and
 * a soft yellow halo. Use with Marker anchor {x: 0.5, y: 0.5}.
 */
export function RiderPin() {
    return (
        <View style={{ width: HALO, height: HALO, alignItems: 'center', justifyContent: 'center' }}>
            {/* soft halo */}
            <View
                style={{
                    position: 'absolute',
                    width: HALO,
                    height: HALO,
                    borderRadius: HALO / 2,
                    backgroundColor: 'rgba(234,179,8,0.25)',
                }}
            />
            {/* disc */}
            <View
                style={{
                    width: DOT,
                    height: DOT,
                    borderRadius: DOT / 2,
                    backgroundColor: ACCENT_DARK,
                    borderWidth: 2,
                    borderColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                }}
            >
                <Motorbike size={15} color={ACCENT} strokeWidth={2.25} />
            </View>
        </View>
    );
}
