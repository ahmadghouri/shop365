export type UserLocationPayload = {
    address: string;
    street: string;
    area: string;
    city: string;
    latitude: number;
    longitude: number;
};

export type UpdateUserResponse = {
    message: string;
    user: any;
};
