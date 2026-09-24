import { Bike, Check, CookingPot, ReceiptText } from 'lucide-react-native';

// Brand accent used across the app (see tailwind `app.yellow`). The dark tone
// pairs with it for text/icons that sit on top of the accent.
export const ACCENT = '#EAB308';
export const ACCENT_DARK = '#111827';

// The bottom-sheet stepper is a condensed 4-stage view of the full timeline.
export const STAGES = [
    { key: 'placed', label: 'Order placed', Icon: ReceiptText },
    { key: 'preparing', label: 'Preparing', Icon: CookingPot },
    { key: 'on_the_way', label: 'On the way', Icon: Bike },
    { key: 'delivered', label: 'Delivered', Icon: Check },
];

// Map the detailed timeline step (0..6) onto the 4 condensed stages.
export function timelineStepToStage(step: number): number {
    if (step >= 6) return 3; // delivered
    if (step >= 3) return 2; // picked up / out for delivery
    if (step >= 2) return 1; // preparing
    return 0; // placed / confirmed
}

export function formatTime(value?: string | null) {
    if (!value) return '';
    const at = new Date(value);
    if (Number.isNaN(at.getTime())) return '';
    return at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
