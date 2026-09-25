import { ViewStyle } from 'react-native';

/**
 * App color constants — copied from the customer mobile app so the driver/rider
 * app matches exactly.
 */
export const AppColors = {
    /** Dark text / headings - #111827 */
    dark: '#111827',
    /** Dark surfaces (hero cards / pills) */
    surface: '#1D1D1D',
    surfaceAlt: '#141414',
    /** Primary yellow / accent - #EAB308 */
    yellow: '#EAB308',
    /** Gradient pair for primary buttons */
    yellowGradient: ['#FCD34D', '#EAB308'] as [string, string],
    /** Lime accent used on the tracking stepper */
    lime: '#C6F542',
    /** Muted / subtitle text - #6B7280 */
    muted: '#6B7280',
    /** Full-screen background gradient (top → bottom) */
    background: ['#FFF3C4', '#FFF9E6', '#FFFFFF'] as [string, string, string],
} as const;

/** Reusable glass style objects. */
export const AppStyles = {
    glassTag: {
        borderWidth: 1,
        borderColor: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    } as ViewStyle,
} as const;
