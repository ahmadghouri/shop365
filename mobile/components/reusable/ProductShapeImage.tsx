import { useId } from 'react';
import type { ImageSourcePropType } from 'react-native';
import Svg, {
    Circle,
    Defs,
    G,
    Image as SvgImage,
    Mask,
    Path,
    Rect,
} from 'react-native-svg';

type ProductShapeImageProps = {
    source: ImageSourcePropType;
};

// const SHAPE_PATH = `
//     M16 0
//     H159
//     C167.837 0 175 7.163 175 16
//     V66

//     C175 75 168 82 159 82
//     H155

//     C136.222 82 121 97.222 121 116

//     C121 123.18 115.18 129 108 129
//     H16

//     C7.163 129 0 121.837 0 113
//     V16

//     C0 7.163 7.163 0 16 0
//     Z
// `;
const SHAPE_PATH = `M175 69.8106C175 76.9772 164.816 81.8048 157.681 81.1267C156.799 81.0429 155.904 81 155 81C139.536 81 127 93.536 127 109C127 109.904 127.043 110.799 127.127 111.681C127.805 118.815 122.978 129 115.811 129H8C3.58172 129 0 125.418 0 121V8C0 3.58173 3.58172 0 8 0H167C171.418 0 175 3.58172 175 8V69.8106Z`;

const BUTTON_RADIUS = 24;
const GAP = 13;
const NOTCH_RADIUS = BUTTON_RADIUS + GAP;

export default function ProductShapeImage({
    source,
}: ProductShapeImageProps) {
    const maskId = `product-mask-${useId().replace(/:/g, '')}`;

    return (
        <Svg
            width="100%"
            height="100%"
            viewBox="0 0 175 129"
            preserveAspectRatio="xMidYMid meet"
        >
            <Defs>
                <Mask
                    id={maskId}
                    x={0}
                    y={0}
                    width={175}
                    height={129}
                    maskUnits="userSpaceOnUse"
                >
                    <Path d={SHAPE_PATH} fill="#FFFFFF" />

                    <Circle
                        cx={155}
                        cy={109}
                        r={NOTCH_RADIUS}
                        fill="#000000"
                    />
                </Mask>
            </Defs>

            <G mask={`url(#${maskId})`}>
                <Rect
                    x={0}
                    y={0}
                    width={175}
                    height={129}
                    fill="#E5E7EB"
                    fillOpacity={0.5}
                />

                <SvgImage
                    href={source}
                    x={0}
                    y={0}
                    width={175}
                    height={129}
                    preserveAspectRatio="xMidYMid meet"
                />
            </G>
        </Svg>
    );
}