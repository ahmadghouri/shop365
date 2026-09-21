import type { LoginSession } from '@/api/auth/auth.service';

export function sessionLabel(session: LoginSession): string {
    if (session.geo?.city) return session.geo.city.split(',').pop()?.trim() || session.geo.city;
    if (session.geo?.latitude != null && session.geo?.longitude != null) {
        return `${session.geo.latitude.toFixed(4)}, ${session.geo.longitude.toFixed(4)}`;
    }
    return 'Location unavailable';
}

export function sessionTime(value: string): string {
    return new Date(value).toLocaleString();
}

export function formatLoginDate(value: string): string {
    const d = new Date(value);
    return (
        d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
        ' at ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
}

export function relativeSessionTime(value: string): string {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    return sessionTime(value);
}
