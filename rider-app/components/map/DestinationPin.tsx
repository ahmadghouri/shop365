import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
const ACCENT = '#EAB308';
const ACCENT_DARK = '#111827';

const WIDTH = 30;
const HEIGHT = 40;

/**
 * Classic map pin for the delivery address: filled yellow drop with a white
 * dot. The tip sits on the exact address — use with Marker anchor {x: 0.5, y: 1}.
 */
export function DestinationPin() {
    return (
        <View style={{ width: WIDTH, height: HEIGHT }}>
            <Svg width={WIDTH} height={HEIGHT} viewBox="0 0 30 40">
                {/* soft ground shadow under the tip */}
                <Ellipse cx="15" cy="38" rx="5" ry="1.8" fill="rgba(15,23,42,0.25)" />
                {/* pin body */}
                <Path
                    d="M15 1.5C7.5 1.5 1.5 7.4 1.5 14.8 1.5 24.6 15 37 15 37s13.5-12.4 13.5-22.2C28.5 7.4 22.5 1.5 15 1.5z"
                    fill={ACCENT}
                    stroke={ACCENT_DARK}
                    strokeWidth={1.5}
                />
                {/* centre dot */}
                <Circle cx="15" cy="14.5" r="5" fill="#fff" />
                <Circle cx="15" cy="14.5" r="2" fill={ACCENT_DARK} />
            </Svg>
        </View>
    );
}
