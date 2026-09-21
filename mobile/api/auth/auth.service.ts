import api from '@/api/client';

export type GeoPayload = {
    city?: string;
    latitude?: number | null;
    longitude?: number | null;
};

export type LoginPayload = {
    phone_no: string;
    password: string;
    platform?: 'android' | 'ios' | 'web' | 'unknown';
    device?: string;
    geo?: GeoPayload;
};

export type RegisterPayload = {
    name?: string;
    phone_no: string;
    email?: string;
    password: string;
    platform?: 'android' | 'ios' | 'web' | 'unknown';
    device?: string;
    geo?: GeoPayload;
};

export type AuthResponse = {
    message: string;
    token: string;
    data: any;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', payload);
    return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', payload);
    return response.data;
}

export async function changePassword(currentPassword: string, password: string): Promise<void> {
    await api.post('/change-password', {
        current_password: currentPassword,
        password,
    });
}

export type LoginSession = {
    _id: string;
    platform: 'android' | 'ios' | 'web' | 'unknown';
    device: string;
    user_agent?: string;
    ip_address?: string;
    geo?: {
        city?: string;
        latitude?: number | null;
        longitude?: number | null;
    };
    logged_in_at: string;
    logged_out_at?: string | null;
    is_active?: boolean;
};

export async function getLoginSessions(): Promise<{ sessions: LoginSession[]; currentSessionId?: string }> {
    const response = await api.get<{ sessions: LoginSession[]; current_session_id?: string }>('/login-sessions');
    return { sessions: response.data.sessions, currentSessionId: response.data.current_session_id };
}

export async function logoutSession(sessionId: string): Promise<void> {
    await api.post(`/logout-session/${sessionId}`);
}

export async function logoutCurrentSession(): Promise<void> {
    await api.post('/logout-current');
}

export async function logoutAllSessions(): Promise<void> {
    await api.post('/logout-all-sessions');
}
