import { Modal, Pressable, Text, View } from "react-native";
import { AppColors } from "@/components/reusable/colors";

export type VendorMinimumInfo = {
  businessId: string;
  name: string;
  minimumOrder: number;
  subtotal: number;
};

export type MinimumOrderNotMetModalProps = {
  open: boolean;
  vendors: VendorMinimumInfo[];
  onClose: () => void;
  onCheckoutWithout: () => void;
};

export function MinimumOrderNotMetModal({
  open,
  vendors,
  onClose,
  onCheckoutWithout,
}: MinimumOrderNotMetModalProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-2xl font-lufga-bold text-slate-900">
            Minimum order not met
          </Text>
          <Text className="mt-2 text-base font-lufga text-slate-600 leading-6">
            The following vendor(s) have minimum order requirements that aren&apos;t met:
          </Text>

          <View className="mt-5 gap-3">
            {vendors.map((v) => {
              const shortfall = v.minimumOrder - v.subtotal;
              return (
                <View
                  key={v.businessId}
                  className="rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <Text className="text-base font-lufga-semibold text-slate-900">
                    {v.name}
                  </Text>
                  <Text className="mt-0.5 text-sm font-lufga text-slate-500">
                    Min order: Rs {v.minimumOrder.toLocaleString()}
                  </Text>
                  <Text
                    className="mt-0.5 text-sm font-lufga-semibold"
                    style={{ color: AppColors.yellow }}
                  >
                    Add Rs {shortfall.toLocaleString()} more.
                  </Text>
                </View>
              );
            })}
          </View>

          <Pressable
            className="mt-6 items-center justify-center rounded-full py-4 active:opacity-80"
            style={{ backgroundColor: AppColors.yellow }}
            onPress={onCheckoutWithout}
          >
            <Text className="text-base font-lufga-semibold text-slate-900">
              Checkout without these items
            </Text>
          </Pressable>

          <Pressable
            className="mt-3 items-center justify-center py-2 active:opacity-60"
            onPress={onClose}
          >
            <Text className="text-base font-lufga text-slate-600">Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
