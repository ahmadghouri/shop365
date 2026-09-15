import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Map, Plus, X } from "lucide-react-native";
import { LocationPickerModal } from "@/components/LocationPickerModal";
import { useAuthStore } from "@/lib/authStore";
import {
  useCreateAddress,
  useUpdateAddress,
} from "@/api/addresses/useAddressQueries";
import type { Address } from "@/api/addresses/address.service";

type AddAddressModalProps = {
  visible: boolean;
  onClose: () => void;
  editingAddress?: Address | null;
  onSaved?: (address: Address) => void;
};

export function AddAddressModal({
  visible,
  onClose,
  editingAddress,
  onSaved,
}: AddAddressModalProps) {
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingAddress) {
        setLabel(editingAddress.label || "");
        setAddress(editingAddress.address || "");
        setCoords(
          editingAddress.latitude && editingAddress.longitude
            ? { lat: editingAddress.latitude, lng: editingAddress.longitude }
            : null,
        );
      } else {
        setLabel("");
        setAddress("");
        setCoords(null);
      }
    }
  }, [visible, editingAddress]);

  const handlePickerClose = () => {
    setShowPicker(false);
    const u = useAuthStore.getState().user;
    if (u?.latitude && u.longitude) {
      setCoords({ lat: u.latitude, lng: u.longitude });
      if (u.address && !address.trim()) setAddress(u.address);
    }
  };

  const handleSave = async () => {
    const name = label.trim();
    const addrText = address.trim();
    if (!name) {
      Alert.alert("Name required", "Please enter a name like Home or Office.");
      return;
    }
    if (!addrText) {
      Alert.alert(
        "Address required",
        "Please type your address or pick a location on the map.",
      );
      return;
    }
    try {
      const u = useAuthStore.getState().user;
      const payload: any = {
        label: name,
        address: addrText,
        street: u?.street || editingAddress?.street || "",
        area: u?.area || editingAddress?.area || "",
        city: u?.city || editingAddress?.city || "",
      };
      if (coords) {
        payload.latitude = coords.lat;
        payload.longitude = coords.lng;
      } else if (editingAddress?.latitude && editingAddress?.longitude) {
        payload.latitude = editingAddress.latitude;
        payload.longitude = editingAddress.longitude;
      }
      const responseAddress = editingAddress
        ? await updateMutation.mutateAsync({ id: editingAddress._id, payload })
        : await createMutation.mutateAsync(payload);
      const savedAddress: Address = {
        ...(editingAddress || {}),
        ...payload,
        ...(responseAddress || {}),
      } as Address;
      onSaved?.(savedAddress);
      setLabel("");
      setAddress("");
      setCoords(null);
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Could not save address",
        error?.response?.data?.message || "Please try again.",
      );
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
          <Pressable
            className="rounded-t-[32px] bg-white px-5 pb-9 pt-4"
            onPress={() => {}}
          >
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-lufga-bold text-slate-950">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </Text>
                <Text className="mt-1 text-sm font-lufga text-slate-400">
                  Enter a name and address, or pick on map
                </Text>
              </View>
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                onPress={onClose}
              >
                <X size={19} color="#334155" />
              </Pressable>
            </View>

            {/* Name */}
            <Text className="mb-2 text-sm font-lufga-semibold text-slate-700">
              Address name
            </Text>
            <TextInput
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-lufga text-slate-950 mb-4"
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Home, Office, Parents House"
              placeholderTextColor="#94a3b8"
              maxLength={40}
              autoCapitalize="words"
            />

            {/* Address + map icon */}
            <Text className="mb-2 text-sm font-lufga-semibold text-slate-700">
              Location
            </Text>
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 mb-1">
              <TextInput
                className="flex-1 py-4 font-lufga text-slate-950"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter full address or tap map icon"
                placeholderTextColor="#94a3b8"
              />
              <Pressable
                className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-amber-50 active:opacity-70"
                onPress={() => setShowPicker(true)}
              >
                <Map size={17} color="#b77900" />
              </Pressable>
            </View>
            {coords && (
              <Text className="text-xs font-lufga text-emerald-600 mb-4">
                📍 Location selected
              </Text>
            )}
            {!coords && <View className="mb-4" />}

            {/* Save */}
            <Pressable
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-row items-center justify-center rounded-full bg-[#FFC400] py-4 disabled:opacity-60"
              onPress={handleSave}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#171717" />
              ) : (
                <>
                  <Plus size={19} color="#171717" />
                  <Text className="ml-2 font-lufga-bold text-slate-950">
                    {editingAddress ? "Update Address" : "Save Address"}
                  </Text>
                </>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <LocationPickerModal visible={showPicker} onClose={handlePickerClose} />
    </>
  );
}
