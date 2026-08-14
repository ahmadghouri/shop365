import api from "@/api/client";

export type AddressPayload = {
  label: string;
  address: string;
  street?: string;
  area?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type Address = AddressPayload & {
  _id: string;
  user_id: string;
  is_active: boolean;
  createdAt: string;
};

export const getAddresses = async (): Promise<Address[]> => {
  const res = await api.get("/addresses");
  return res.data.data;
};

export const createAddress = async (
  payload: AddressPayload,
): Promise<Address> => {
  const res = await api.post("/addresses", payload);
  return res.data.data;
};

export const activateAddress = async (id: string): Promise<Address> => {
  const res = await api.put(`/addresses/${id}/activate`);
  return res.data.data;
};

export const updateAddress = async (
  id: string,
  payload: Partial<AddressPayload>,
): Promise<Address> => {
  const res = await api.put(`/addresses/${id}`, payload);
  return res.data.data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};
