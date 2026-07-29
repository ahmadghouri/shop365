import api from '@/api/client';

export type LoginPayload = {
    phone_no: string;
    password: string;
};

export type RegisterPayload = {
    name?: string;
    phone_no: string;
    email?: string;
    password: string;
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
