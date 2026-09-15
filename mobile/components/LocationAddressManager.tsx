import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import {
  Check,
  LocateFixed,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react-native";
import { GlassCard } from "@/components/reusable/GlassCard";
import { GradientPill } from "@/components/reusable/GradientPill";
import { AddAddressModal } from "@/components/AddAddressModal";
import {
  useAddresses,
  useActivateAddress,
  useCreateAddress,
  useDeleteAddress,
} from "@/api/addresses/useAddressQueries";
import type { Address } from "@/api/addresses/address.service";

type LocationAddressManagerProps = {
  onAddressSelected?: (address: Address) => void;
  onAddressChanged?: (address: Address) => void;
};

export function LocationAddressManager({ onAddressSelected, onAddressChanged }: LocationAddressManagerProps) {
  const { data: addresses = [], isLoading } = useAddresses();
  const activateMutation = useActivateAddress();
  const deleteMutation = useDeleteAddress();
  const createMutation = useCreateAddress();

  const [locationGranted, setLocationGranted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addingLive, setAddingLive] = useState(false);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ granted }) =>
      setLocationGranted(granted),
    );
  }, []);

  const openAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleActivate = async (addr: Address) => {
    await activateMutation.mutateAsync(addr._id);
    onAddressSelected?.(addr);
  };

  const handleDelete = (addr: Address) => {
    Alert.alert("Remove address?", `"${addr.label}" will be deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteMutation.mutate(addr._id),
      },
    ]);
  };

  const handleUseLiveLocation = async () => {
    setAddingLive(true);
    try {
      const { granted } = await Location.getForegroundPermissionsAsync();
      if (!granted) return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      let addressText = "Live Location",
        street = "",
        area = "",
        city = "";
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (results?.[0]) {
          const r = results[0];
          street = r.street || r.name || "";
          area = r.district || r.subregion || "";
          city = r.city || r.region || "";
          addressText =
            [street, area, city].filter(Boolean).join(", ") || "Live Location";
        }
      } catch {}
      createMutation.mutate({
        label: "Live Location",
        address: addressText,
        street,
        area,
        city,
        latitude,
        longitude,
      });
    } finally {
      setAddingLive(false);
    }
  };

  if (isLoading)
    return <ActivityIndicator color="#EAB308" style={{ marginTop: 32 }} />;

  const hasLiveSaved = addresses.some((a) => a.label === "Live Location");

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Saved addresses */}
        {addresses.map((addr) => (
          <GlassCard
            key={addr._id}
            variant="light"
            className={`rounded-2xl mb-3 ${addr.is_active ? "border-2 border-[#FCD34D]" : ""}`}
          >
            <View className="flex-row items-center px-4 py-3">
              {/* Tap left portion to activate */}
              <Pressable
                className="flex-row flex-1 items-center"
                onPress={() => handleActivate(addr)}
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50 mr-3">
                  <MapPin size={18} color="#b77900" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-lufga-semibold text-slate-900">
                    {addr.label}
                  </Text>
                  <Text
                    className="text-xs font-lufga text-slate-400 mt-0.5"
                    numberOfLines={1}
                  >
                    {addr.address}
                  </Text>
                </View>
                {addr.is_active && <Check size={18} color="#EAB308" />}
              </Pressable>

              {/* Edit + Delete buttons — outside activate Pressable */}
              <Pressable
                className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-amber-50 active:opacity-60"
                onPress={() => openEdit(addr)}
              >
                <Pencil size={15} color="#b77900" />
              </Pressable>
              <Pressable
                className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-red-50 active:opacity-60"
                onPress={() => handleDelete(addr)}
              >
                <Trash2 size={15} color="#ef4444" />
              </Pressable>
            </View>
          </GlassCard>
        ))}

        {/* Live Location */}
        {locationGranted && !hasLiveSaved && (
          <Pressable
            className="flex-row items-center px-4 py-3 mb-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 active:opacity-70"
            disabled={addingLive || createMutation.isPending}
            onPress={handleUseLiveLocation}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100 mr-3">
              {addingLive ? (
                <ActivityIndicator size="small" color="#b77900" />
              ) : (
                <LocateFixed size={18} color="#b77900" />
              )}
            </View>
            <Text className="flex-1 text-sm font-lufga-semibold text-amber-800">
              Use Live Location
            </Text>
            <Plus size={16} color="#b77900" />
          </Pressable>
        )}

        {/* Add New Address */}
        <GradientPill className="rounded-full h-12 mt-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center active:opacity-80"
            onPress={openAdd}
          >
            <Plus size={16} color="#111827" />
            <Text className="ml-2 text-sm font-lufga-semibold text-slate-900">
              Add New Address
            </Text>
          </Pressable>
        </GradientPill>
      </ScrollView>

      <AddAddressModal
        visible={showModal}
        onClose={closeModal}
        editingAddress={editingAddress}
        onSaved={onAddressChanged}
      />
    </View>
  );
}
