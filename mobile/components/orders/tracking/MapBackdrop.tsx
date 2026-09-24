import Svg, { Circle, Path, Rect } from 'react-native-svg';

type MapBackdropProps = { width: number; height: number };

/**
 * A stylised map surface: soft base, a few "blocks" and roads, a dashed
 * delivery route from the courier (yellow) to the destination (dark pin).
 */
export function MapBackdrop({ width, height }: MapBackdropProps) {
    const startX = width * 0.24;
    const startY = height * 0.82;
    const endX = width * 0.72;
    const endY = height * 0.2;

    const route = `M ${startX} ${startY}
        C ${startX} ${startY - 70}, ${width * 0.5} ${height * 0.72}, ${width * 0.42} ${height * 0.56}
        S ${width * 0.34} ${height * 0.42}, ${width * 0.52} ${height * 0.36}
        S ${endX} ${height * 0.34}, ${endX} ${endY}`;

    return (
        <Svg width={width} height={height}>
            <Rect x={0} y={0} width={width} height={height} fill="#E9EDE9" />

            {/* Faint street grid */}
            {[0.18, 0.4, 0.62, 0.84].map((f) => (
                <Rect key={`h${f}`} x={0} y={height * f} width={width} height={6} fill="#F4F6F3" />
            ))}
            {[0.2, 0.46, 0.72].map((f) => (
                <Rect key={`v${f}`} x={width * f} y={0} width={6} height={height} fill="#F4F6F3" />
            ))}

            {/* A couple of park / block accents */}
            <Rect
                x={width * 0.06}
                y={height * 0.24}
                width={width * 0.24}
                height={height * 0.12}
                rx={10}
                fill="#DDE6DB"
            />
            <Rect
                x={width * 0.56}
                y={height * 0.6}
                width={width * 0.3}
                height={height * 0.16}
                rx={10}
                fill="#DDE6DB"
            />

            {/* Delivery route */}
            <Path
                d={route}
                stroke="#1A1A1A"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1 12"
            />

            {/* Start (courier) marker */}
            <Circle cx={startX} cy={startY} r={12} fill="#EAB308" opacity={0.25} />
            <Circle cx={startX} cy={startY} r={7} fill="#EAB308" stroke="#fff" strokeWidth={2} />

            {/* Destination marker */}
            <Circle cx={endX} cy={endY} r={16} fill="#1A1A1A" />
            <Circle cx={endX} cy={endY} r={5} fill="#fff" />
        </Svg>
    );
}
