import { ViewStyle } from 'react-native';

/**
 * App color constants
 *
 * NativeWind/Tailwind classes:
 *   text-app-dark       / bg-app-dark       → #111827
 *   text-app-yellow     / bg-app-yellow     → #EAB308
 *   text-app-muted      / bg-app-muted      → #6B7280
 */
export const AppColors = {
    /** Dark text / headings - #111827 */
    dark: '#111827',
    /** Primary yellow / accent - #EAB308 */
    yellow: '#EAB308',
    /** Muted / subtitle text - #6B7280 */
    muted: '#6B7280',
} as const;

/**
 * Reusable style objects for glass effects
 * Usage: style={AppStyles.glassTag}
 */
export const AppStyles = {
    /** border-radius:50px; border:1px solid white; background:rgba(255,255,255,0.35) */
    glassTag: {
        // borderRadius: 50,
        borderWidth: 1,
        borderColor: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    } as ViewStyle,
} as const;
