import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import * as Location from "expo-location";
import { AddAddressModal } from "@/components/AddAddressModal";
import { AddressCard } from "@/components/addresses/AddressCard";
import { UseLiveLocationButton } from "@/components/addresses/UseLiveLocationButton";
import { AddNewAddressButton } from "@/components/addresses/AddNewAddressButton";
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
      } catch { }
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
          <AddressCard
            key={addr._id}
            address={addr}
            onActivate={handleActivate}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}

        {/* Live Location */}
        {locationGranted && !hasLiveSaved && (
          <UseLiveLocationButton
            loading={addingLive}
            disabled={addingLive || createMutation.isPending}
            onPress={handleUseLiveLocation}
          />
        )}

        {/* Add New Address */}
        <AddNewAddressButton onPress={openAdd} />
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
